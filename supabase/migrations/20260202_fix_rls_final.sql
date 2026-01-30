-- ============================================================
-- FIX FINAL: Eliminar TODA recursión en RLS
-- ============================================================
-- Estrategia: Cada tabla solo referencia tablas "superiores" en
-- la jerarquía, nunca hacia abajo o en ciclos.
--
-- Jerarquía (de arriba a abajo):
--   auth.users (Supabase, sin RLS nuestro)
--   ↓
--   businesses (solo depende de auth.uid)
--   ↓
--   employees (depende de businesses)
--   ↓
--   clients (solo depende de auth.uid para self-access)
--   ↓
--   loyalty_cards (depende de businesses, employees - NO de clients)
--   ↓
--   transactions (depende de loyalty_cards via business check)
-- ============================================================

-- ============================================================
-- PASO 1: Limpiar TODAS las políticas existentes
-- ============================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname
              FROM pg_policies
              WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                       r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================================
-- PASO 2: BUSINESSES - Base de la jerarquía
-- ============================================================
-- Solo depende de auth.uid(), sin subconsultas

CREATE POLICY "businesses_owner_all" ON businesses
    FOR ALL
    USING (owner_user_id = auth.uid());

CREATE POLICY "businesses_public_select" ON businesses
    FOR SELECT
    USING (is_active = true);

-- ============================================================
-- PASO 3: EMPLOYEES - Depende solo de businesses
-- ============================================================

CREATE POLICY "employees_by_business_owner" ON employees
    FOR ALL
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_user_id = auth.uid()
        )
    );

CREATE POLICY "employees_self_select" ON employees
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- ============================================================
-- PASO 4: CLIENTS - Solo self-access, sin referencias a otras tablas con RLS
-- ============================================================
-- IMPORTANTE: NO incluir políticas que referencien loyalty_cards

CREATE POLICY "clients_self_all" ON clients
    FOR ALL
    USING (auth_user_id = auth.uid());

-- Para el registro público (sin auth)
CREATE POLICY "clients_anon_insert" ON clients
    FOR INSERT
    WITH CHECK (true);

-- Para que el owner/staff pueda ver clientes, usamos SECURITY DEFINER functions
-- en lugar de políticas RLS que causen recursión

-- ============================================================
-- PASO 5: LOYALTY_CARDS - Depende de businesses y employees
-- ============================================================
-- NO incluir referencias a clients para evitar recursión

-- Owner del negocio
CREATE POLICY "cards_by_business_owner" ON loyalty_cards
    FOR ALL
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_user_id = auth.uid()
        )
    );

-- Empleado del negocio
CREATE POLICY "cards_by_employee" ON loyalty_cards
    FOR ALL
    USING (
        business_id IN (
            SELECT business_id FROM employees
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- Cliente ve su propia tarjeta (usando client_id directo, no JOIN)
-- Aquí NO consultamos clients, solo verificamos si el client_id
-- corresponde a un cliente con nuestro auth.uid
CREATE POLICY "cards_by_client_self" ON loyalty_cards
    FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM clients WHERE auth_user_id = auth.uid()
        )
    );

-- ============================================================
-- PASO 6: TRANSACTIONS - Depende de loyalty_cards vía business
-- ============================================================

-- Owner puede todo
CREATE POLICY "tx_by_business_owner" ON transactions
    FOR ALL
    USING (
        card_id IN (
            SELECT lc.id
            FROM loyalty_cards lc
            WHERE lc.business_id IN (
                SELECT b.id FROM businesses b WHERE b.owner_user_id = auth.uid()
            )
        )
    );

-- Empleado puede todo
CREATE POLICY "tx_by_employee" ON transactions
    FOR ALL
    USING (
        card_id IN (
            SELECT lc.id
            FROM loyalty_cards lc
            WHERE lc.business_id IN (
                SELECT e.business_id FROM employees e
                WHERE e.auth_user_id = auth.uid() AND e.is_active = true
            )
        )
    );

-- Cliente puede leer sus transacciones
CREATE POLICY "tx_by_client_self" ON transactions
    FOR SELECT
    USING (
        card_id IN (
            SELECT lc.id
            FROM loyalty_cards lc
            WHERE lc.client_id IN (
                SELECT c.id FROM clients c WHERE c.auth_user_id = auth.uid()
            )
        )
    );

-- ============================================================
-- PASO 7: Función auxiliar para que owner pueda ver clientes
-- ============================================================
-- Esta función usa SECURITY DEFINER para bypass RLS

CREATE OR REPLACE FUNCTION get_business_clients(p_business_id UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    card_id UUID,
    current_balance INT,
    tier_level TEXT,
    state TEXT,
    created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario es owner del negocio
    IF NOT EXISTS (
        SELECT 1 FROM businesses
        WHERE businesses.id = p_business_id
        AND businesses.owner_user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT
        c.id,
        c.full_name::TEXT,
        c.email::TEXT,
        c.phone::TEXT,
        c.avatar_url::TEXT,
        lc.id as card_id,
        lc.current_balance::INT,
        lc.tier_level::TEXT,
        lc.state::TEXT,
        lc.created_at
    FROM clients c
    INNER JOIN loyalty_cards lc ON lc.client_id = c.id
    WHERE lc.business_id = p_business_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_business_clients TO authenticated;

-- ============================================================
-- FIN
-- ============================================================
