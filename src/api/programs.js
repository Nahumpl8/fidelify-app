import { supabase } from './supabaseClient';

/**
 * Tipos de programas disponibles
 */
export const PROGRAM_TYPES = {
  stamp: {
    id: 'stamp',
    name: 'Sellos',
    description: 'Acumula sellos y obtén un premio',
    icon: '🎫',
    defaultLogic: {
      target: 8,
      reward: 'Premio gratis',
      stamp_value: 1,
    },
  },
  points: {
    id: 'points',
    name: 'Puntos',
    description: 'Gana puntos por cada compra',
    icon: '⭐',
    defaultLogic: {
      points_per_visit: 10,
      points_per_currency: 1,
      currency: 'MXN',
      reward_threshold: 100,
      reward: '10% de descuento',
    },
  },
  membership: {
    id: 'membership',
    name: 'Membresía',
    description: 'Niveles y beneficios exclusivos',
    icon: '👑',
    defaultLogic: {
      tiers: [
        { name: 'Bronce', min_points: 0, benefits: ['5% descuento'] },
        { name: 'Plata', min_points: 100, benefits: ['10% descuento', 'Envío gratis'] },
        { name: 'Oro', min_points: 500, benefits: ['15% descuento', 'Envío gratis', 'Acceso VIP'] },
      ],
    },
  },
  coupon: {
    id: 'coupon',
    name: 'Cupón',
    description: 'Descuentos de un solo uso',
    icon: '🏷️',
    defaultLogic: {
      discount_type: 'percentage', // 'percentage' | 'fixed'
      discount_value: 20,
      uses_limit: 1,
      min_purchase: 0,
    },
  },
  gift_card: {
    id: 'gift_card',
    name: 'Tarjeta de Regalo',
    description: 'Saldo prepagado para compras',
    icon: '🎁',
    defaultLogic: {
      initial_balance: 500,
      currency: 'MXN',
      is_rechargeable: true,
    },
  },
  cashback: {
    id: 'cashback',
    name: 'Cashback',
    description: 'Recibe un % de tus compras',
    icon: '💰',
    defaultLogic: {
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
  { id: 'name', label: 'Nombre', required: false },
  { id: 'email', label: 'Email', required: true },
  { id: 'phone', label: 'Teléfono', required: false },
  { id: 'birthday', label: 'Fecha de nacimiento', required: false },
  { id: 'photo', label: 'Foto', required: false },
  { id: 'address', label: 'Dirección', required: false },
];

/**
 * Obtener todos los programas de la organización
 */
export const getPrograms = async (organizationId) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Obtener un programa por ID
 */
export const getProgram = async (programId) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single();

  return { data, error };
};

/**
 * Crear un nuevo programa
 */
export const createProgram = async (programData) => {
  const { data, error } = await supabase
    .from('programs')
    .insert(programData)
    .select()
    .single();

  return { data, error };
};

/**
 * Actualizar un programa
 */
export const updateProgram = async (programId, updates) => {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', programId)
    .select()
    .single();

  return { data, error };
};

/**
 * Eliminar un programa
 */
export const deleteProgram = async (programId) => {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId);

  return { error };
};

/**
 * Obtener links de un programa
 */
export const getProgramLinks = async (programId) => {
  const { data, error } = await supabase
    .from('program_links')
    .select('*')
    .eq('program_id', programId)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Crear link de programa
 */
export const createProgramLink = async (linkData) => {
  // Generar slug único
  const slug = `${linkData.program_id.slice(0, 8)}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from('program_links')
    .insert({
      ...linkData,
      slug,
    })
    .select()
    .single();

  return { data, error };
};

/**
 * Eliminar link de programa
 */
export const deleteProgramLink = async (linkId) => {
  const { error } = await supabase
    .from('program_links')
    .delete()
    .eq('id', linkId);

  return { error };
};
