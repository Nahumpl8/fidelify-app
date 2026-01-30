/**
 * Supabase Client Configuration
 * Fidelify - Loyalty SaaS
 *
 * Este archivo configura el cliente de Supabase con opciones
 * optimizadas para una aplicación de wallet passes.
 */

import { createClient } from '@supabase/supabase-js';

// Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

/**
 * Supabase Client Options
 * @see https://supabase.com/docs/reference/javascript/initializing
 */
const supabaseOptions = {
  auth: {
    // Persist session in localStorage
    persistSession: true,
    // Auto-refresh tokens before expiry
    autoRefreshToken: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: 'fidelify-auth',
  },

  // Global headers (useful for analytics/tracking)
  global: {
    headers: {
      'x-application-name': 'fidelify-web',
    },
  },

  // Realtime configuration (for live updates)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },

  // Database configuration
  db: {
    // Use public schema by default
    schema: 'public',
  },
};

/**
 * Supabase Client Instance
 * Use this throughout your application for all Supabase operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

/**
 * Helper: Get current authenticated user
 * @returns {Promise<User|null>}
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Helper: Get current session
 * @returns {Promise<Session|null>}
 */
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Helper: Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export default supabase;
