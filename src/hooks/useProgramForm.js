import { useState, useCallback, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { createProgram, updateProgram, getProgram } from '../api/programs';
import { supabase } from '../lib/supabase';
import { INDUSTRY_TEMPLATES } from '../components/card-wizard/steps/Step1Template';
import { generateAndUploadStripImage, isValidImageUrl } from '../utils/generateStripImage';

/**
 * Program types supported by the wizard
 */
export const WIZARD_PROGRAM_TYPES = {
  stamp: {
    id: 'stamp',
    name: 'Tarjeta de Sellos',
    description: 'Clientes acumulan sellos por cada visita',
    icon: '🎫',
    supportsProgressiveStrip: true,
  },
  points: {
    id: 'points',
    name: 'Puntos',
    description: 'Gana puntos por cada compra',
    icon: '⭐',
    supportsProgressiveStrip: false,
  },
  membership: {
    id: 'membership',
    name: 'Membresia',
    description: 'Niveles y beneficios exclusivos',
    icon: '👑',
    supportsProgressiveStrip: false,
  },
  coupon: {
    id: 'coupon',
    name: 'Cupon',
    description: 'Descuento de un solo uso',
    icon: '🏷️',
    supportsProgressiveStrip: false,
  },
  gift_card: {
    id: 'gift_card',
    name: 'Tarjeta de Regalo',
    description: 'Saldo prepagado para compras',
    icon: '🎁',
    supportsProgressiveStrip: false,
  },
  cashback: {
    id: 'cashback',
    name: 'Cashback',
    description: 'Porcentaje de devolucion en compras',
    icon: '💰',
    supportsProgressiveStrip: false,
  },
};

// LocalStorage key for wizard data persistence
const STORAGE_KEY = 'fidelify_wizard_data';

/**
 * Load saved state from localStorage
 */
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('📦 Loaded wizard data from localStorage');
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load from localStorage:', err);
  }
  return null;
};

/**
 * Save state to localStorage
 */
const saveToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
};

/**
 * Clear localStorage
 */
const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Cleared wizard data from localStorage');
  } catch (err) {
    console.warn('Failed to clear localStorage:', err);
  }
};

/**
 * Initial state for the program form
 */
const getInitialState = () => ({
  // Meta
  id: null,
  name: '',
  description: '',
  is_active: true,

  // Step 1: Template/Type
  type: null,
  selectedTemplate: null,

  // Step 2: Branding
  branding_config: {
    // Layout mode: 'grid' | 'progressive' | 'hero'
    layout_mode: 'grid',

    // Colors
    primary_color: '#4CAF50',
    background_color: '#4CAF50',
    label_color: '#FFFFFF',
    text_color: '#FFFFFF',

    // Images
    logo_url: null,
    icon_url: null,
    strip_image_url: null,
    hero_image_url: null,

    // Progressive strip config
    strip_config: {
      mode: 'static',
      static_url: null,
      progressive_urls: [],
    },

    // Stamp customization
    stamp_image_url: null,
    stamp_inactive_color: '#E0E0E0',
    stamp_active_color: '#FFFFFF',

    // Barcode config: 'qr' | 'pdf417' | 'code128'
    barcode_type: 'pdf417',
  },

  // Step 3: Back side & Content
  back_side_config: {
    description: 'Tarjeta de lealtad oficial',
    terms_text: '',
    links: [],
    issuer_details: {
      email: '',
      phone: '',
    },
  },

  // Step 4: Rules & Data Collection
  rules_config: {
    target_stamps: 10,
    reward_name: 'Recompensa',
    stamps_expire_days: null,
    auto_redeem: false,
    redirect_url_after_install: null,
    // Type-specific fields added dynamically
    // --- NUEVOS CAMPOS AGREGADOS ---
    enable_points: false,             // El toggle principal
    cashback_rule_type: 'percentage', // 'percentage' o 'fixed'
    cashback_percentage: 5,           // Valor por defecto
    fixed_reward_amount: null,        // Para modo fijo ($10)
    fixed_reward_trigger: null,       // Para modo fijo (por cada $200)
    minimum_purchase: 0,              // Compra mínima general
    points_value: 0,                  // Saldo inicial de regalo
  },

  data_collection_config: {
    fields: [
      { name: 'first_name', required: true, enabled: true },
      { name: 'email', required: true, enabled: true },
      { name: 'phone', required: false, enabled: true },
      { name: 'birthday', required: true, enabled: true },
      { name: 'photo', required: false, enabled: false },
    ],
  },

  features_config: {
    utm_tracking: true,
    referral_program: {
      enabled: false,
      reward_stamps: 1,
    },
    locations: [],
  },
});

/**
 * Step validation rules
 */
const validateStep = (step, state) => {
  const errors = {};

  switch (step) {
    case 1:
      if (!state.type && !state.selectedTemplate) {
        errors.type = 'Selecciona un giro de negocio';
      }
      break;

    case 2:
      if (!state.name?.trim()) {
        errors.name = 'El nombre es requerido';
      }
      if (!state.branding_config.background_color) {
        errors.background_color = 'Selecciona un color de fondo';
      }
      break;

    case 3:
      // Links validation (optional)
      state.back_side_config.links.forEach((link, idx) => {
        if (link.label && !link.url) {
          errors[`link_${idx}_url`] = 'URL requerida';
        }
        if (link.url && !link.url.startsWith('http')) {
          errors[`link_${idx}_url`] = 'URL debe empezar con http';
        }
      });
      break;

    case 4:
      if (state.type === 'stamp') {
        if (!state.rules_config.target_stamps || state.rules_config.target_stamps < 1) {
          errors.target_stamps = 'Mínimo 1 sello';
        }
        if (!state.rules_config.reward_name?.trim()) {
          errors.reward_name = 'Nombre del premio requerido';
        }
      }

      // --- VALIDACIÓN MEJORADA PARA CASHBACK ---
      if (state.type === 'cashback' || state.rules_config.enable_points) {

        // Si eligió Porcentaje
        if (state.rules_config.cashback_rule_type === 'percentage') {
          if (!state.rules_config.cashback_percentage || state.rules_config.cashback_percentage <= 0) {
            errors.cashback_percentage = 'El porcentaje debe ser mayor a 0';
          }
        }

        // Si eligió Monto Fijo
        if (state.rules_config.cashback_rule_type === 'fixed') {
          if (!state.rules_config.fixed_reward_amount || state.rules_config.fixed_reward_amount <= 0) {
            errors.fixed_reward_amount = 'Define cuánto dinero vas a regalar';
          }
          if (!state.rules_config.fixed_reward_trigger || state.rules_config.fixed_reward_trigger <= 0) {
            errors.fixed_reward_trigger = 'Define el monto mínimo de compra para dar el regalo';
          }
        }
      }
      break;

    default:
      break;
  }

  return errors;
};

/**
 * useProgramForm - Central state management hook for the Card Wizard
 */
export function useProgramForm(programId = null) {
  const { organization } = useOrganization();

  // Initialize state from localStorage or defaults
  const [formState, setFormState] = useState(() => {
    // If editing existing program, don't load from storage
    if (programId) return getInitialState();

    // Try to load from localStorage first
    const savedState = loadFromStorage();
    if (savedState) {
      return { ...getInitialState(), ...savedState };
    }

    return getInitialState();
  });

  const [currentStep, setCurrentStep] = useState(() => {
    if (programId) return 1;
    const savedState = loadFromStorage();
    return savedState?.currentStep || 1;
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [activeFocusField, setActiveFocusField] = useState(null);

  // Save to localStorage whenever formState or currentStep changes
  useEffect(() => {
    // Don't save if editing existing program
    if (programId) return;
    // Don't save empty/initial state
    if (!formState.selectedTemplate && !formState.name && !formState.type) return;

    const dataToSave = {
      ...formState,
      currentStep,
    };
    saveToStorage(dataToSave);
  }, [formState, currentStep, programId]);

  // Load existing program if ID provided
  useEffect(() => {
    if (programId) {
      loadProgram(programId);
    }
  }, [programId]);

  /**
   * Load program from database
   */
  const loadProgram = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const { data, error } = await getProgram(id);
      if (error) throw error;

      if (data) {
        setFormState({
          ...getInitialState(),
          ...data,
          type: data.type,
        });
      }
    } catch (err) {
      console.error('Error loading program:', err);
      setErrors({ load: 'Error al cargar el programa' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Apply industry template configuration
   */
  const applyTemplate = useCallback((templateId) => {
    const template = INDUSTRY_TEMPLATES[templateId];
    if (!template) {
      console.warn('Template not found:', templateId);
      return;
    }

    const { config } = template;

    setFormState((prev) => {
      // Deep merge the template config with current state
      const newState = {
        ...prev,
        selectedTemplate: templateId,
        type: config.type,
        name: config.name || prev.name,
        branding_config: {
          ...prev.branding_config,
          ...config.branding_config,
          // Preserve existing images if any
          logo_url: prev.branding_config.logo_url,
          strip_image_url: prev.branding_config.strip_image_url,
          hero_image_url: prev.branding_config.hero_image_url,
          stamp_image_url: prev.branding_config.stamp_image_url,
          strip_config: {
            ...prev.branding_config.strip_config,
            ...config.branding_config?.strip_config,
          },
        },
        rules_config: {
          ...prev.rules_config,
          ...config.rules_config,
        },
        features_config: {
          ...prev.features_config,
          ...config.features_config,
        },
      };

      // Apply back_side_config if provided
      if (config.back_side_config) {
        newState.back_side_config = {
          ...prev.back_side_config,
          ...config.back_side_config,
        };
      }

      // Apply data_collection_config if provided
      if (config.data_collection_config) {
        newState.data_collection_config = {
          ...prev.data_collection_config,
          ...config.data_collection_config,
        };
      }

      return newState;
    });
    setIsDirty(true);
  }, []);

  /**
   * Generic field update with dot notation support
   */
  const updateField = useCallback((path, value) => {
    setFormState((prev) => {
      const keys = path.split('.');
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newState;
    });
    setIsDirty(true);
  }, []);

  /**
   * Update branding config
   */
  const updateBranding = useCallback((updates) => {
    setFormState((prev) => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        ...updates,
      },
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update rules config
   */
  const updateRules = useCallback((updates) => {
    setFormState((prev) => ({
      ...prev,
      rules_config: {
        ...prev.rules_config,
        ...updates,
      },
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update back side config
   */
  const updateBackSide = useCallback((updates) => {
    setFormState((prev) => ({
      ...prev,
      back_side_config: {
        ...prev.back_side_config,
        ...updates,
      },
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update data collection config
   */
  const updateDataCollection = useCallback((updates) => {
    setFormState((prev) => ({
      ...prev,
      data_collection_config: {
        ...prev.data_collection_config,
        ...updates,
      },
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update features config
   */
  const updateFeatures = useCallback((updates) => {
    setFormState((prev) => ({
      ...prev,
      features_config: {
        ...prev.features_config,
        ...updates,
      },
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update strip config specifically
   */
  const updateStripConfig = useCallback((updates) => {
    setFormState((prev) => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        strip_config: {
          ...prev.branding_config.strip_config,
          ...updates,
        },
      },
    }));
    setIsDirty(true);
  }, []);

  /**
   * Link management
   */
  const addLink = useCallback((link = { label: '', url: '' }) => {
    setFormState((prev) => ({
      ...prev,
      back_side_config: {
        ...prev.back_side_config,
        links: [...prev.back_side_config.links, { id: Date.now(), ...link }],
      },
    }));
    setIsDirty(true);
  }, []);

  const updateLink = useCallback((index, updates) => {
    setFormState((prev) => {
      const newLinks = [...prev.back_side_config.links];
      newLinks[index] = { ...newLinks[index], ...updates };
      return {
        ...prev,
        back_side_config: {
          ...prev.back_side_config,
          links: newLinks,
        },
      };
    });
    setIsDirty(true);
  }, []);

  const removeLink = useCallback((index) => {
    setFormState((prev) => ({
      ...prev,
      back_side_config: {
        ...prev.back_side_config,
        links: prev.back_side_config.links.filter((_, i) => i !== index),
      },
    }));
    setIsDirty(true);
  }, []);

  /**
   * Image upload to Supabase Storage with fallback to base64
   */
  const uploadImage = useCallback(async (file, type) => {
    // Convert file to base64 for immediate preview
    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

    // If no organization (business), use base64 (dev mode)
    if (!organization?.id) {
      console.warn('No business, using base64 preview');
      return await toBase64(file);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${type}.${fileExt}`;
      // Use business ID as folder path
      const filePath = `${organization.id}/${fileName}`;

      // Try to upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('program-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload failed, using base64:', uploadError.message);
        return await toBase64(file);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('program-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.warn('Upload error, falling back to base64:', err);
      return await toBase64(file);
    }
  }, [organization?.id]);

  /**
   * Upload multiple progressive images
   */
  const uploadProgressiveImages = useCallback(async (files) => {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], `progressive_${i}`);
      urls.push(url);
    }
    return urls;
  }, [uploadImage]);

  /**
   * Navigation
   */
  const canProceed = useCallback(() => {
    const stepErrors = validateStep(currentStep, formState);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, formState]);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
      setErrors({});
    }
  }, []);

  const nextStep = useCallback(() => {
    const stepErrors = validateStep(currentStep, formState);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return false;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      setErrors({});
      return true;
    }
    return false;
  }, [currentStep, formState]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  /**
   * Save program to database
   */
  const saveProgram = useCallback(async () => {
    if (!organization?.id) {
      setErrors({ save: 'No organization found' });
      return { error: 'No organization found' };
    }

    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      const stepErrors = validateStep(step, formState);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return { error: 'Validation failed', errors: stepErrors };
      }
    }

    setIsSubmitting(true);
    try {
      // Auto-generate strip/hero image if missing or base64
      let brandingWithImage = { ...formState.branding_config };
      const hasValidStrip = isValidImageUrl(brandingWithImage.strip_image_url);
      const hasValidHero = isValidImageUrl(brandingWithImage.hero_image_url);

      if (!hasValidStrip && !hasValidHero) {
        console.log('🎨 Auto-generating strip image for Google Wallet...');
        const generatedUrl = await generateAndUploadStripImage({
          businessName: formState.name || 'Mi Negocio',
          bgColor: brandingWithImage.background_color || '#4CAF50',
          textColor: brandingWithImage.text_color || brandingWithImage.label_color || '#FFFFFF',
          current: 0,
          total: formState.rules_config?.target_stamps || 10,
          rewardText: formState.rules_config?.reward_name || 'Recompensa',
          programType: formState.type || 'stamp',
        }, organization.id);

        if (generatedUrl) {
          brandingWithImage.strip_image_url = generatedUrl;
          brandingWithImage.hero_image_url = generatedUrl;
          console.log('✅ Strip image generated and uploaded:', generatedUrl);
        }
      }

      const programData = {
        organization_id: organization.id,
        name: formState.name,
        description: formState.description,
        type: formState.type,
        is_active: formState.is_active,
        branding_config: brandingWithImage,
        rules_config: formState.rules_config,
        back_side_config: formState.back_side_config,
        data_collection_config: formState.data_collection_config,
        features_config: formState.features_config,
      };

      let result;
      if (formState.id) {
        result = await updateProgram(formState.id, programData);
      } else {
        result = await createProgram(programData);
      }

      if (result.error) {
        throw result.error;
      }

      // Clear localStorage on successful save
      clearStorage();

      setIsDirty(false);
      setFormState((prev) => ({ ...prev, id: result.data.id }));
      return { data: result.data };
    } catch (err) {
      console.error('Error saving program:', err);
      setErrors({ save: 'Error al guardar el programa' });
      return { error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [organization?.id, formState]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormState(getInitialState());
    setCurrentStep(1);
    setErrors({});
    setIsDirty(false);
    setSimulatedProgress(0);
  }, []);

  /**
   * Clear form and localStorage (use after successful save)
   */
  const clearForm = useCallback(() => {
    clearStorage();
    setFormState(getInitialState());
    setCurrentStep(1);
    setErrors({});
    setIsDirty(false);
    setSimulatedProgress(0);
    console.log('✅ Form cleared and localStorage wiped');
  }, []);

  /**
   * Set program type and apply default rules
   * (Legacy function - kept for backwards compatibility)
   */
  const setType = useCallback((type) => {
    setFormState((prev) => {
      const typeConfig = WIZARD_PROGRAM_TYPES[type];
      let typeSpecificRules = {};

      switch (type) {
        case 'stamp':
          typeSpecificRules = {
            target_stamps: 10,
            reward_name: 'Recompensa',
            stamp_value: 1,
          };
          break;
        case 'membership':
          typeSpecificRules = {
            tiers: [
              { name: 'Bronce', min_points: 0, benefits: ['5% descuento'] },
            ],
          };
          break;
        case 'coupon':
          typeSpecificRules = {
            discount_type: 'percentage',
            discount_value: 20,
            uses_limit: 1,
            min_purchase: 0,
          };
          break;
        case 'cashback':
          typeSpecificRules = {
            percentage: 5,
            max_cashback: 100,
            currency: 'MXN',
          };
          break;
        default:
          break;
      }

      return {
        ...prev,
        type,
        rules_config: {
          ...prev.rules_config,
          ...typeSpecificRules,
        },
      };
    });
    setIsDirty(true);
  }, []);

  return {
    // State
    formState,
    currentStep,
    errors,
    isDirty,
    isLoading,
    isSubmitting,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    canProceed,

    // Updates
    updateField,
    updateBranding,
    updateRules,
    updateBackSide,
    updateDataCollection,
    updateFeatures,
    updateStripConfig,
    setType,
    applyTemplate,

    // Links
    addLink,
    updateLink,
    removeLink,

    // Images
    uploadImage,
    uploadProgressiveImages,

    // Preview simulation
    simulatedProgress,
    setSimulatedProgress,

    // Spotlight focus
    activeFocusField,
    setActiveFocusField,

    // Persistence
    saveProgram,
    loadProgram,
    resetForm,
    clearForm,
  };
}

export default useProgramForm;
