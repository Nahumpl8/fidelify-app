-- ============================================================
-- RESET: Limpieza para nuevo schema optimizado para Wallet
-- ============================================================
-- ADVERTENCIA: Este script elimina tablas existentes.
-- Solo usar en desarrollo, NO en producción con datos reales.
-- ============================================================

-- Deshabilitar temporalmente triggers de FK para limpieza ordenada
SET session_replication_role = 'replica';

-- Eliminar tablas existentes del schema anterior
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS loyalty_cards CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- Eliminar tablas del schema v2 anterior si existen
DROP TABLE IF EXISTS program_links CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Eliminar tipos enum si existen (para recrearlos limpios)
DROP TYPE IF EXISTS program_type CASCADE;
DROP TYPE IF EXISTS card_state CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS tier_level CASCADE;

-- Rehabilitar triggers
SET session_replication_role = 'origin';

-- ============================================================
-- FIN DEL RESET
-- ============================================================
-- ============================================================
-- FIDELIFY: SCHEMA OPTIMIZADO PARA APPLE/GOOGLE WALLET
-- Version: 3.0 - Wallet-First Architecture
-- ============================================================
-- Este schema está diseñado para mapear directamente a los
-- campos requeridos por .pkpass (Apple) y JWT Objects (Google)
-- ============================================================

-- 0. EXTENSIONES NECESARIAS
-- gen_random_uuid() y gen_random_bytes() son nativos en PostgreSQL 13+
-- pgcrypto solo se necesita si usas funciones adicionales de cifrado
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TIPOS ENUMERADOS (ENUMs)
-- ============================================================

-- Tipo de programa de lealtad
DO $$ BEGIN
    CREATE TYPE program_type AS ENUM ('seals', 'points', 'levels', 'cashback');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estado de tarjeta de lealtad
DO $$ BEGIN
    CREATE TYPE card_state AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipo de transacción
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('EARN', 'REDEEM', 'ADJUSTMENT', 'BONUS', 'EXPIRE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Niveles de membresía
DO $$ BEGIN
    CREATE TYPE tier_level AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. TABLA: BUSINESSES (Configuración del SaaS)
-- ============================================================
-- Contiene TODA la información necesaria para generar wallet passes

CREATE TABLE IF NOT EXISTS businesses (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,  -- URL-friendly identifier: fidelify.app/join/{slug}
    name VARCHAR(255) NOT NULL,

    -- ========================================
    -- BRANDING (Mapea directamente a Wallet)
    -- ========================================
    -- Apple: logoText, organizationName
    -- Google: programName, programLogo
    logo_url TEXT,                      -- Logo principal (Apple: logo@2x.png, Google: programLogo)
    icon_url TEXT,                      -- Icono cuadrado (Apple: icon@2x.png)
    strip_image_url TEXT,               -- Imagen hero/banner (Apple: strip@2x.png, Google: heroImage)

    -- Colores en formato HEX (Apple: requiere rgb(), convertir en backend)
    brand_color VARCHAR(7) DEFAULT '#000000',       -- Apple: foregroundColor, Google: hexBackgroundColor
    background_color VARCHAR(7) DEFAULT '#FFFFFF',  -- Apple: backgroundColor
    label_color VARCHAR(7) DEFAULT '#666666',       -- Apple: labelColor (para los títulos de campos)

    -- ========================================
    -- WALLET SETTINGS (Configuración Avanzada)
    -- ========================================
    wallet_settings JSONB DEFAULT '{
        "apple": {
            "team_id": null,
            "pass_type_identifier": null,
            "web_service_url": null,
            "authentication_token_prefix": null
        },
        "google": {
            "issuer_id": null,
            "class_suffix": null,
            "callback_url": null
        },
        "barcode": {
            "format": "QR",
            "message_encoding": "utf-8",
            "alt_text_type": "CARD_ID"
        },
        "locations": [],
        "relevant_date": null,
        "expiration_type": "NEVER",
        "expiration_days": null
    }'::jsonb,

    -- ========================================
    -- LÓGICA DEL PROGRAMA
    -- ========================================
    program_type program_type NOT NULL DEFAULT 'seals',
    target_value INTEGER NOT NULL DEFAULT 10,       -- Meta para desbloquear reward
    reward_text VARCHAR(255) DEFAULT 'Recompensa Desbloqueada',

    -- Configuración adicional del programa
    program_config JSONB DEFAULT '{
        "auto_reset_on_reward": true,
        "allow_partial_redeem": false,
        "points_per_currency": 1,
        "currency": "MXN",
        "stamps_per_visit": 1,
        "tier_thresholds": {
            "Silver": 100,
            "Gold": 500,
            "Platinum": 1000,
            "Diamond": 5000
        }
    }'::jsonb,

    -- ========================================
    -- CONTENIDO DEL REVERSO (Back of Pass)
    -- ========================================
    back_fields JSONB DEFAULT '{
        "description": "Tarjeta de lealtad oficial",
        "terms_and_conditions": "",
        "contact_email": null,
        "contact_phone": null,
        "website_url": null,
        "links": []
    }'::jsonb,

    -- ========================================
    -- METADATOS
    -- ========================================
    owner_user_id UUID REFERENCES auth.users(id),   -- Dueño del negocio
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para businesses
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_wallet_settings ON businesses USING GIN (wallet_settings);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active) WHERE is_active = true;

-- ============================================================
-- 3. TABLA: CLIENTS (Identidad Global de Usuarios)
-- ============================================================
-- Un cliente puede tener tarjetas en múltiples negocios

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Vinculación con Supabase Auth (opcional, para usuarios registrados)
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Datos de identidad
    email VARCHAR(255),
    phone VARCHAR(50),
    full_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),

    -- Datos adicionales (útiles para personalización de pases)
    avatar_url TEXT,
    birthday DATE,

    -- Preferencias
    locale VARCHAR(10) DEFAULT 'es-MX',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

    -- Metadatos
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Al menos email o phone debe existir
    CONSTRAINT client_has_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Índices para clients
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_email ON clients(LOWER(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_auth_user ON clients(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(full_name);

-- ============================================================
-- 4. TABLA: LOYALTY_CARDS (Relación Cliente-Negocio)
-- ============================================================
-- Esta es la tabla CORE que representa un "pase" en la wallet
-- Cada registro = 1 tarjeta de lealtad de 1 cliente en 1 negocio

CREATE TABLE IF NOT EXISTS loyalty_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- ========================================
    -- BALANCES (El corazón de la tarjeta)
    -- ========================================
    current_balance INTEGER DEFAULT 0,      -- Sellos/Puntos actuales
    lifetime_balance INTEGER DEFAULT 0,     -- Balance histórico total (nunca decrementa)
    pending_balance INTEGER DEFAULT 0,      -- Puntos pendientes de confirmar

    -- ========================================
    -- ESTADO Y NIVEL
    -- ========================================
    state card_state DEFAULT 'ACTIVE',
    tier_level tier_level DEFAULT 'Bronze',

    -- ========================================
    -- WALLET TOKENS (Para Push Updates)
    -- ========================================
    -- Apple Wallet: El token se recibe cuando el usuario añade el pase
    apple_push_token TEXT,
    apple_device_library_id TEXT,
    apple_pass_type_identifier TEXT,
    apple_serial_number TEXT UNIQUE,        -- Único por pase, se genera al crear
    apple_last_updated TIMESTAMPTZ,

    -- Google Wallet: Object ID único
    google_object_id TEXT UNIQUE,           -- Format: issuerId.objectSuffix
    google_class_id TEXT,
    google_last_updated TIMESTAMPTZ,

    -- ========================================
    -- TRACKING Y ENGAGEMENT
    -- ========================================
    rewards_redeemed INTEGER DEFAULT 0,     -- Cuántas veces ha canjeado
    last_activity_at TIMESTAMPTZ,
    last_visit_at TIMESTAMPTZ,
    total_visits INTEGER DEFAULT 0,

    -- UTM tracking (cómo llegó)
    acquisition_source VARCHAR(100),
    acquisition_medium VARCHAR(100),
    acquisition_campaign VARCHAR(100),

    -- ========================================
    -- METADATOS
    -- ========================================
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Un cliente solo puede tener una tarjeta por negocio
    CONSTRAINT unique_client_business UNIQUE (client_id, business_id)
);

-- Índices para loyalty_cards
CREATE INDEX IF NOT EXISTS idx_cards_business ON loyalty_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_cards_client ON loyalty_cards(client_id);
CREATE INDEX IF NOT EXISTS idx_cards_state ON loyalty_cards(state);
CREATE INDEX IF NOT EXISTS idx_cards_tier ON loyalty_cards(tier_level);
CREATE INDEX IF NOT EXISTS idx_cards_apple_token ON loyalty_cards(apple_push_token) WHERE apple_push_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cards_google_object ON loyalty_cards(google_object_id) WHERE google_object_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cards_last_activity ON loyalty_cards(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_balance ON loyalty_cards(current_balance);

-- ============================================================
-- 5. TABLA: TRANSACTIONS (Historial de Movimientos)
-- ============================================================
-- Log inmutable de todas las operaciones

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relación
    card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,

    -- ========================================
    -- DATOS DE LA TRANSACCIÓN
    -- ========================================
    type transaction_type NOT NULL,
    amount INTEGER NOT NULL,                -- Positivo para EARN/BONUS, negativo para REDEEM
    balance_before INTEGER NOT NULL,        -- Snapshot del balance antes
    balance_after INTEGER NOT NULL,         -- Snapshot del balance después

    -- Descripción y contexto
    description VARCHAR(500),               -- ej. "Compra en Sucursal Centro"
    reference_code VARCHAR(100),            -- Código externo (ej. número de ticket)

    -- ========================================
    -- QUIÉN REALIZÓ LA OPERACIÓN
    -- ========================================
    created_by UUID REFERENCES auth.users(id),  -- ID del empleado/admin
    created_by_name VARCHAR(255),               -- Nombre para display rápido
    location_name VARCHAR(255),                 -- Sucursal donde ocurrió

    -- ========================================
    -- METADATOS
    -- ========================================
    metadata JSONB DEFAULT '{}'::jsonb,     -- Datos adicionales flexibles
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()

    -- Las transacciones son inmutables, no hay updated_at
);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_tx_card ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_tx_card_date ON transactions(card_id, created_at DESC);

-- ============================================================
-- 6. TABLA: EMPLOYEES (Staff del Negocio)
-- ============================================================
-- Para control de acceso y auditoría

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id),

    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff',       -- 'owner', 'admin', 'manager', 'staff'
    pin_code VARCHAR(6),                    -- PIN para acceso rápido en POS

    permissions JSONB DEFAULT '{
        "can_add_stamps": true,
        "can_redeem": true,
        "can_adjust": false,
        "can_view_reports": false,
        "can_manage_settings": false
    }'::jsonb,

    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_employee_business UNIQUE (auth_user_id, business_id)
);

CREATE INDEX IF NOT EXISTS idx_employees_business ON employees(business_id);
CREATE INDEX IF NOT EXISTS idx_employees_auth ON employees(auth_user_id);

-- ============================================================
-- 7. FUNCIONES DE UTILIDAD
-- ============================================================

-- Función: Generar Serial Number único para Apple Wallet
CREATE OR REPLACE FUNCTION generate_apple_serial()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Función: Generar Google Object ID
CREATE OR REPLACE FUNCTION generate_google_object_id(issuer_id TEXT, card_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN issuer_id || '.' || REPLACE(card_uuid::TEXT, '-', '');
END;
$$ LANGUAGE plpgsql;

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. TRIGGERS
-- ============================================================

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trg_businesses_updated ON businesses;
CREATE TRIGGER trg_businesses_updated
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_clients_updated ON clients;
CREATE TRIGGER trg_clients_updated
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cards_updated ON loyalty_cards;
CREATE TRIGGER trg_cards_updated
    BEFORE UPDATE ON loyalty_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_employees_updated ON employees;
CREATE TRIGGER trg_employees_updated
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Generar serial number automático para nuevas cards
CREATE OR REPLACE FUNCTION set_card_wallet_ids()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.apple_serial_number IS NULL THEN
        NEW.apple_serial_number = generate_apple_serial();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_card_wallet_ids ON loyalty_cards;
CREATE TRIGGER trg_card_wallet_ids
    BEFORE INSERT ON loyalty_cards
    FOR EACH ROW EXECUTE FUNCTION set_card_wallet_ids();

-- ============================================================
-- 9. RPC: ADD STAMP (Función Transaccional Principal)
-- ============================================================
-- Esta función es ATÓMICA y maneja toda la lógica de negocio

CREATE OR REPLACE FUNCTION add_stamp(
    p_card_id UUID,
    p_amount INTEGER DEFAULT 1,
    p_description TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_location_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_card RECORD;
    v_business RECORD;
    v_new_balance INTEGER;
    v_new_lifetime INTEGER;
    v_reward_unlocked BOOLEAN := false;
    v_rewards_count INTEGER := 0;
    v_transaction_id UUID;
    v_new_tier tier_level;
BEGIN
    -- 1. Obtener la tarjeta con bloqueo para evitar race conditions
    SELECT
        lc.*,
        b.target_value,
        b.program_type,
        b.program_config,
        b.reward_text
    INTO v_card
    FROM loyalty_cards lc
    JOIN businesses b ON b.id = lc.business_id
    WHERE lc.id = p_card_id
    FOR UPDATE OF lc;

    -- Validaciones
    IF v_card IS NULL THEN
        RAISE EXCEPTION 'Card not found: %', p_card_id;
    END IF;

    IF v_card.state != 'ACTIVE' THEN
        RAISE EXCEPTION 'Card is not active. Current state: %', v_card.state;
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;

    -- 2. Calcular nuevo balance
    v_new_balance := v_card.current_balance + p_amount;
    v_new_lifetime := v_card.lifetime_balance + p_amount;

    -- 3. Verificar si se desbloqueó recompensa
    IF v_new_balance >= v_card.target_value THEN
        v_reward_unlocked := true;
        v_rewards_count := v_new_balance / v_card.target_value;

        -- Auto-reset si está configurado
        IF (v_card.program_config->>'auto_reset_on_reward')::boolean = true THEN
            v_new_balance := v_new_balance % v_card.target_value;
        END IF;
    END IF;

    -- 4. Calcular nuevo tier basado en lifetime_balance (para programa 'levels')
    IF v_card.program_type = 'levels' THEN
        v_new_tier := CASE
            WHEN v_new_lifetime >= (v_card.program_config->'tier_thresholds'->>'Diamond')::int THEN 'Diamond'::tier_level
            WHEN v_new_lifetime >= (v_card.program_config->'tier_thresholds'->>'Platinum')::int THEN 'Platinum'::tier_level
            WHEN v_new_lifetime >= (v_card.program_config->'tier_thresholds'->>'Gold')::int THEN 'Gold'::tier_level
            WHEN v_new_lifetime >= (v_card.program_config->'tier_thresholds'->>'Silver')::int THEN 'Silver'::tier_level
            ELSE 'Bronze'::tier_level
        END;
    ELSE
        v_new_tier := v_card.tier_level;
    END IF;

    -- 5. Insertar transacción
    INSERT INTO transactions (
        card_id,
        type,
        amount,
        balance_before,
        balance_after,
        description,
        created_by,
        location_name
    ) VALUES (
        p_card_id,
        'EARN',
        p_amount,
        v_card.current_balance,
        v_new_balance,
        COALESCE(p_description, 'Stamp added'),
        p_created_by,
        p_location_name
    )
    RETURNING id INTO v_transaction_id;

    -- 6. Actualizar la tarjeta
    UPDATE loyalty_cards
    SET
        current_balance = v_new_balance,
        lifetime_balance = v_new_lifetime,
        tier_level = v_new_tier,
        rewards_redeemed = rewards_redeemed + v_rewards_count,
        last_activity_at = NOW(),
        last_visit_at = NOW(),
        total_visits = total_visits + 1
    WHERE id = p_card_id;

    -- 7. Retornar resultado
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'card_id', p_card_id,
        'previous_balance', v_card.current_balance,
        'new_balance', v_new_balance,
        'lifetime_balance', v_new_lifetime,
        'target_value', v_card.target_value,
        'progress_percentage', ROUND((v_new_balance::decimal / v_card.target_value) * 100),
        'reward_unlocked', v_reward_unlocked,
        'rewards_earned', v_rewards_count,
        'reward_text', CASE WHEN v_reward_unlocked THEN v_card.reward_text ELSE NULL END,
        'new_tier', v_new_tier::text,
        'tier_changed', v_new_tier != v_card.tier_level,
        'requires_wallet_update', true
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. RPC: REDEEM REWARD
-- ============================================================

CREATE OR REPLACE FUNCTION redeem_reward(
    p_card_id UUID,
    p_amount INTEGER DEFAULT NULL,  -- NULL = redeem full target
    p_description TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_card RECORD;
    v_redeem_amount INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Obtener tarjeta con lock
    SELECT
        lc.*,
        b.target_value,
        b.program_config
    INTO v_card
    FROM loyalty_cards lc
    JOIN businesses b ON b.id = lc.business_id
    WHERE lc.id = p_card_id
    FOR UPDATE OF lc;

    IF v_card IS NULL THEN
        RAISE EXCEPTION 'Card not found';
    END IF;

    IF v_card.state != 'ACTIVE' THEN
        RAISE EXCEPTION 'Card is not active';
    END IF;

    -- Determinar cantidad a redimir
    v_redeem_amount := COALESCE(p_amount, v_card.target_value);

    IF v_card.current_balance < v_redeem_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient balance',
            'current_balance', v_card.current_balance,
            'required', v_redeem_amount
        );
    END IF;

    v_new_balance := v_card.current_balance - v_redeem_amount;

    -- Insertar transacción de redención
    INSERT INTO transactions (
        card_id, type, amount, balance_before, balance_after, description, created_by
    ) VALUES (
        p_card_id, 'REDEEM', -v_redeem_amount, v_card.current_balance, v_new_balance,
        COALESCE(p_description, 'Reward redeemed'), p_created_by
    );

    -- Actualizar balance
    UPDATE loyalty_cards
    SET
        current_balance = v_new_balance,
        rewards_redeemed = rewards_redeemed + 1,
        last_activity_at = NOW()
    WHERE id = p_card_id;

    RETURN jsonb_build_object(
        'success', true,
        'redeemed_amount', v_redeem_amount,
        'new_balance', v_new_balance,
        'requires_wallet_update', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. RLS POLICIES (Row Level Security)
-- ============================================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Businesses: Owner y empleados pueden ver/editar
CREATE POLICY "business_owner_all" ON businesses
    FOR ALL USING (
        auth.uid() = owner_user_id
        OR auth.uid() IN (
            SELECT auth_user_id FROM employees
            WHERE business_id = businesses.id AND is_active = true
        )
    );

-- Businesses: Público puede ver negocios activos (para /join)
CREATE POLICY "business_public_read" ON businesses
    FOR SELECT USING (is_active = true);

-- Clients: Usuario puede ver/editar su propio perfil
CREATE POLICY "client_self_access" ON clients
    FOR ALL USING (auth.uid() = auth_user_id);

-- Clients: Staff puede ver clientes de su negocio
CREATE POLICY "client_staff_read" ON clients
    FOR SELECT USING (
        id IN (
            SELECT client_id FROM loyalty_cards lc
            JOIN employees e ON e.business_id = lc.business_id
            WHERE e.auth_user_id = auth.uid() AND e.is_active = true
        )
    );

-- Loyalty Cards: Cliente ve sus propias tarjetas
CREATE POLICY "card_client_read" ON loyalty_cards
    FOR SELECT USING (
        client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())
    );

-- Loyalty Cards: Staff puede ver/editar tarjetas de su negocio
CREATE POLICY "card_staff_access" ON loyalty_cards
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM employees
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- Transactions: Solo lectura para el cliente
CREATE POLICY "tx_client_read" ON transactions
    FOR SELECT USING (
        card_id IN (
            SELECT lc.id FROM loyalty_cards lc
            JOIN clients c ON c.id = lc.client_id
            WHERE c.auth_user_id = auth.uid()
        )
    );

-- Transactions: Staff puede ver/crear transacciones de su negocio
CREATE POLICY "tx_staff_access" ON transactions
    FOR ALL USING (
        card_id IN (
            SELECT lc.id FROM loyalty_cards lc
            JOIN employees e ON e.business_id = lc.business_id
            WHERE e.auth_user_id = auth.uid() AND e.is_active = true
        )
    );

-- Employees: Owner gestiona empleados
CREATE POLICY "employee_owner_all" ON employees
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_user_id = auth.uid()
        )
    );

-- Employees: Staff ve a sus compañeros
CREATE POLICY "employee_self_read" ON employees
    FOR SELECT USING (auth.uid() = auth_user_id);

-- ============================================================
-- 12. GRANTS PARA FUNCIONES RPC
-- ============================================================

GRANT EXECUTE ON FUNCTION add_stamp TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_reward TO authenticated;
GRANT EXECUTE ON FUNCTION generate_apple_serial TO authenticated;
GRANT EXECUTE ON FUNCTION generate_google_object_id TO authenticated;

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
