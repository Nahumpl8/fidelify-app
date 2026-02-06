import { supabase } from '../lib/supabase';

/**
 * Tipos de programas disponibles (mapea a program_type en businesses)
 */
export const PROGRAM_TYPES = {
  seals: {
    id: 'seals',
    name: 'Sellos',
    description: 'Acumula sellos y obtén un premio',
    icon: '🎫',
    defaultConfig: {
      auto_reset_on_reward: true,
      stamps_per_visit: 1,
    },
  },
  points: {
    id: 'points',
    name: 'Puntos',
    description: 'Gana puntos por cada compra',
    icon: '⭐',
    defaultConfig: {
      points_per_currency: 1,
      currency: 'MXN',
    },
  },
  levels: {
    id: 'levels',
    name: 'Niveles',
    description: 'Sube de nivel y desbloquea beneficios',
    icon: '👑',
    defaultConfig: {
      tier_thresholds: {
        Silver: 100,
        Gold: 500,
        Platinum: 1000,
        Diamond: 5000,
      },
    },
  },
  cashback: {
    id: 'cashback',
    name: 'Cashback',
    description: 'Recibe un % de tus compras',
    icon: '💰',
    defaultConfig: {
      percentage: 5,
      max_cashback: 100,
      currency: 'MXN',
    },
  },
};

/**
 * Campos de datos disponibles para recolectar
 */
export const DATA_FIELDS = [
  { id: 'full_name', label: 'Nombre completo', required: false },
  { id: 'email', label: 'Email', required: true },
  { id: 'phone', label: 'Teléfono', required: false },
  { id: 'birthday', label: 'Fecha de nacimiento', required: false },
  { id: 'avatar_url', label: 'Foto', required: false },
];

/**
 * Obtener la configuración del programa del negocio
 * (En este schema, el "programa" es parte del business)
 */
export const getPrograms = async (businessId) => {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error) return { data: null, error };

  // Transformar a formato de "programa" para compatibilidad
  const program = {
    id: business.id,
    business_id: business.id,
    name: business.name,
    type: business.program_type,
    is_active: business.is_active,
    target_value: business.target_value,
    reward_text: business.reward_text,
    branding_config: {
      logo_url: business.logo_url,
      icon_url: business.icon_url,
      strip_image_url: business.strip_image_url,
      brand_color: business.brand_color,
      background_color: business.background_color,
      label_color: business.label_color,
    },
    rules_config: business.program_config,
    back_side_config: business.back_fields,
    wallet_settings: business.wallet_settings,
    created_at: business.created_at,
    updated_at: business.updated_at,
  };

  return { data: [program], error: null };
};

/**
 * Obtener un programa por ID (business ID)
 */
export const getProgram = async (businessId) => {
  const { data, error } = await getPrograms(businessId);
  if (error || !data || data.length === 0) {
    return { data: null, error: error || 'Program not found' };
  }
  return { data: data[0], error: null };
};

/**
 * Crear/actualizar la configuración del programa
 * (Actualiza el business directamente)
 */
export const createProgram = async (programData) => {
  const {
    organization_id, // Este será el business_id
    name,
    type,
    is_active,
    branding_config,
    rules_config,
    back_side_config,
  } = programData;

  // Map frontend types to valid DB enum values: 'seals' | 'points' | 'levels' | 'cashback'
  const dbTypeMap = { stamp: 'seals', mixed: 'seals', identity: 'seals' };
  const dbType = dbTypeMap[type] || type;

  const businessUpdate = {
    name: name || undefined,
    program_type: dbType,
    is_active: is_active ?? true,
    target_value: rules_config?.target_stamps || rules_config?.target_value || 10,
    reward_text: rules_config?.reward_name || 'Recompensa',
    program_config: rules_config,
    back_fields: back_side_config,
  };

  // Helper to check if URL is base64 (won't work with Google Wallet)
  const isBase64 = (url) => url?.startsWith('data:');

  // Only include branding fields if they have actual values (not null/undefined)
  // This prevents overwriting existing branding with null when wizard doesn't have images
  if (branding_config?.logo_url) {
    if (isBase64(branding_config.logo_url)) {
      console.warn('⚠️ Logo is base64 - will not work with Google Wallet. Please re-upload.');
    }
    businessUpdate.logo_url = branding_config.logo_url;
  }
  if (branding_config?.icon_url) {
    businessUpdate.icon_url = branding_config.icon_url;
  }
  if (branding_config?.strip_image_url) {
    if (isBase64(branding_config.strip_image_url)) {
      console.warn('⚠️ Strip image is base64 - skipping save (incompatible with Google Wallet)');
    } else {
      businessUpdate.strip_image_url = branding_config.strip_image_url;
    }
  }
  if (branding_config?.hero_image_url) {
    if (isBase64(branding_config.hero_image_url)) {
      console.warn('⚠️ Hero image is base64 - skipping save (incompatible with Google Wallet)');
    } else {
      businessUpdate.hero_image_url = branding_config.hero_image_url;
    }
  }
  // Colors should always be included if they exist (they have defaults)
  if (branding_config?.primary_color || branding_config?.brand_color) {
    businessUpdate.brand_color = branding_config.primary_color || branding_config.brand_color;
  }
  if (branding_config?.background_color) {
    businessUpdate.background_color = branding_config.background_color;
  }
  if (branding_config?.label_color) {
    businessUpdate.label_color = branding_config.label_color;
  }

  console.log('📝 Saving program to database:', {
    organization_id,
    name: businessUpdate.name,
    background_color: businessUpdate.background_color,
    brand_color: businessUpdate.brand_color,
    logo_url: businessUpdate.logo_url ? (isBase64(businessUpdate.logo_url) ? 'BASE64' : businessUpdate.logo_url.substring(0, 50) + '...') : 'NOT SET',
    strip_image_url: businessUpdate.strip_image_url ? (isBase64(businessUpdate.strip_image_url) ? 'BASE64' : businessUpdate.strip_image_url.substring(0, 50) + '...') : 'NOT SET',
  });

  // Limpiar undefined
  Object.keys(businessUpdate).forEach(key => {
    if (businessUpdate[key] === undefined) delete businessUpdate[key];
  });

  const { data, error } = await supabase
    .from('businesses')
    .update(businessUpdate)
    .eq('id', organization_id)
    .select()
    .single();

  if (error) return { data: null, error };

  // Retornar en formato de programa
  return {
    data: {
      id: data.id,
      business_id: data.id,
      ...programData,
    },
    error: null,
  };
};

/**
 * Actualizar un programa
 */
export const updateProgram = async (businessId, updates) => {
  return createProgram({ organization_id: businessId, ...updates });
};

/**
 * Eliminar un programa (desactivar el negocio)
 */
export const deleteProgram = async (businessId) => {
  const { error } = await supabase
    .from('businesses')
    .update({ is_active: false })
    .eq('id', businessId);

  return { error };
};

/**
 * Obtener links de un programa (stored in back_fields.links)
 */
export const getProgramLinks = async (businessId) => {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('back_fields')
    .eq('id', businessId)
    .single();

  if (error) return { data: null, error };

  const links = business?.back_fields?.links || [];
  return { data: links, error: null };
};

/**
 * Crear link de programa
 */
export const createProgramLink = async (linkData) => {
  const { program_id, label, url, type } = linkData;

  // Obtener links actuales
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('back_fields')
    .eq('id', program_id)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  const currentLinks = business?.back_fields?.links || [];
  const newLink = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    url,
    type: type || 'link',
    created_at: new Date().toISOString(),
  };

  const updatedBackFields = {
    ...business?.back_fields,
    links: [...currentLinks, newLink],
  };

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ back_fields: updatedBackFields })
    .eq('id', program_id);

  if (updateError) return { data: null, error: updateError };

  return { data: newLink, error: null };
};

/**
 * Eliminar link de programa
 */
export const deleteProgramLink = async (businessId, linkId) => {
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('back_fields')
    .eq('id', businessId)
    .single();

  if (fetchError) return { error: fetchError };

  const currentLinks = business?.back_fields?.links || [];
  const updatedLinks = currentLinks.filter(link => link.id !== linkId);

  const updatedBackFields = {
    ...business?.back_fields,
    links: updatedLinks,
  };

  const { error } = await supabase
    .from('businesses')
    .update({ back_fields: updatedBackFields })
    .eq('id', businessId);

  return { error };
};
