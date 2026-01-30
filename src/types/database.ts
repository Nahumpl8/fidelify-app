/**
 * Database Types
 * Fidelify - TypeScript definitions for Supabase tables
 *
 * Generated from the wallet-optimized schema.
 * Use these types for type-safe database operations.
 */

// ============================================================
// ENUMS
// ============================================================

export type ProgramType = 'seals' | 'points' | 'levels' | 'cashback';
export type CardState = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'EXPIRED';
export type TransactionType = 'EARN' | 'REDEEM' | 'ADJUSTMENT' | 'BONUS' | 'EXPIRE';
export type TierLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type EmployeeRole = 'owner' | 'admin' | 'manager' | 'staff';

// ============================================================
// JSONB TYPES
// ============================================================

export interface WalletSettings {
  apple: {
    team_id: string | null;
    pass_type_identifier: string | null;
    web_service_url: string | null;
    authentication_token_prefix: string | null;
  };
  google: {
    issuer_id: string | null;
    class_suffix: string | null;
    callback_url: string | null;
  };
  barcode: {
    format: 'QR' | 'PDF417' | 'CODE128' | 'AZTEC';
    message_encoding: string;
    alt_text_type: 'CARD_ID' | 'PHONE' | 'CUSTOM';
  };
  locations: Array<{
    latitude: number;
    longitude: number;
    relevant_text?: string;
  }>;
  relevant_date: string | null;
  expiration_type: 'NEVER' | 'FIXED_DATE' | 'DAYS_FROM_CREATION';
  expiration_days: number | null;
}

export interface ProgramConfig {
  auto_reset_on_reward: boolean;
  allow_partial_redeem: boolean;
  points_per_currency: number;
  currency: string;
  stamps_per_visit: number;
  tier_thresholds: {
    Silver: number;
    Gold: number;
    Platinum: number;
    Diamond: number;
  };
}

export interface BackFields {
  description: string;
  terms_and_conditions: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  links: Array<{
    label: string;
    url: string;
  }>;
}

export interface EmployeePermissions {
  can_add_stamps: boolean;
  can_redeem: boolean;
  can_adjust: boolean;
  can_view_reports: boolean;
  can_manage_settings: boolean;
}

// ============================================================
// TABLE TYPES
// ============================================================

export interface Business {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  icon_url: string | null;
  strip_image_url: string | null;
  brand_color: string;
  background_color: string;
  label_color: string;
  wallet_settings: WalletSettings;
  program_type: ProgramType;
  target_value: number;
  reward_text: string;
  program_config: ProgramConfig;
  back_fields: BackFields;
  owner_user_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  birthday: string | null;
  locale: string;
  timezone: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyCard {
  id: string;
  business_id: string;
  client_id: string;
  current_balance: number;
  lifetime_balance: number;
  pending_balance: number;
  state: CardState;
  tier_level: TierLevel;
  apple_push_token: string | null;
  apple_device_library_id: string | null;
  apple_pass_type_identifier: string | null;
  apple_serial_number: string;
  apple_last_updated: string | null;
  google_object_id: string | null;
  google_class_id: string | null;
  google_last_updated: string | null;
  rewards_redeemed: number;
  last_activity_at: string | null;
  last_visit_at: string | null;
  total_visits: number;
  acquisition_source: string | null;
  acquisition_medium: string | null;
  acquisition_campaign: string | null;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;

  // Relations (when using select with joins)
  business?: Business;
  client?: Client;
}

export interface Transaction {
  id: string;
  card_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  reference_code: string | null;
  created_by: string | null;
  created_by_name: string | null;
  location_name: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;

  // Relations
  card?: LoyaltyCard;
}

export interface Employee {
  id: string;
  business_id: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  role: EmployeeRole;
  pin_code: string | null;
  permissions: EmployeePermissions;
  is_active: boolean;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  business?: Business;
}

// ============================================================
// RPC FUNCTION TYPES
// ============================================================

export interface AddStampParams {
  p_card_id: string;
  p_amount?: number;
  p_description?: string;
  p_created_by?: string;
  p_location_name?: string;
}

export interface AddStampResult {
  success: boolean;
  transaction_id?: string;
  card_id?: string;
  previous_balance?: number;
  new_balance?: number;
  lifetime_balance?: number;
  target_value?: number;
  progress_percentage?: number;
  reward_unlocked?: boolean;
  rewards_earned?: number;
  reward_text?: string;
  new_tier?: string;
  tier_changed?: boolean;
  requires_wallet_update?: boolean;
  error?: string;
  error_code?: string;
}

export interface RedeemRewardParams {
  p_card_id: string;
  p_amount?: number;
  p_description?: string;
  p_created_by?: string;
}

export interface RedeemRewardResult {
  success: boolean;
  redeemed_amount?: number;
  new_balance?: number;
  requires_wallet_update?: boolean;
  error?: string;
  current_balance?: number;
  required?: number;
}

// ============================================================
// SUPABASE DATABASE TYPE (for type inference)
// ============================================================

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Business, 'id' | 'created_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at'>>;
      };
      loyalty_cards: {
        Row: LoyaltyCard;
        Insert: Omit<
          LoyaltyCard,
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'apple_serial_number'
          | 'current_balance'
          | 'lifetime_balance'
          | 'pending_balance'
          | 'rewards_redeemed'
          | 'total_visits'
        >;
        Update: Partial<Omit<LoyaltyCard, 'id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: never; // Transactions are immutable
      };
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      add_stamp: {
        Args: AddStampParams;
        Returns: AddStampResult;
      };
      redeem_reward: {
        Args: RedeemRewardParams;
        Returns: RedeemRewardResult;
      };
    };
  };
}
