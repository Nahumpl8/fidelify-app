-- ============================================================
-- FIX: RLS Policies para Owner del Negocio
-- ============================================================
-- Problema: El owner_user_id no podía ver loyalty_cards ni clients
-- porque las políticas solo cubrían employees, no owners directos.
-- ============================================================

-- ============================================================
-- 1. POLÍTICAS PARA LOYALTY_CARDS
-- ============================================================

-- DROP política existente que es muy restrictiva
DROP POLICY IF EXISTS "card_staff_access" ON loyalty_cards;
DROP POLICY IF EXISTS "card_client_read" ON loyalty_cards;

-- Nueva política: Owner del negocio puede ver/editar TODAS las tarjetas de su negocio
CREATE POLICY "card_owner_access" ON loyalty_cards
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses
            WHERE owner_user_id = auth.uid()
        )
    );

-- Política: Empleados activos pueden ver/editar tarjetas de su negocio
CREATE POLICY "card_employee_access" ON loyalty_cards
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM employees
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- Política: Cliente puede ver sus propias tarjetas (para app cliente)
CREATE POLICY "card_client_self_read" ON loyalty_cards
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE auth_user_id = auth.uid()
        )
    );

-- ============================================================
-- 2. POLÍTICAS PARA CLIENTS
-- ============================================================

DROP POLICY IF EXISTS "client_staff_read" ON clients;
DROP POLICY IF EXISTS "client_self_access" ON clients;

-- Owner del negocio puede ver clientes que tienen tarjetas en su negocio
CREATE POLICY "client_owner_read" ON clients
    FOR SELECT USING (
        id IN (
            SELECT lc.client_id
            FROM loyalty_cards lc
            JOIN businesses b ON b.id = lc.business_id
            WHERE b.owner_user_id = auth.uid()
        )
    );

-- Empleados pueden ver clientes de su negocio
CREATE POLICY "client_employee_read" ON clients
    FOR SELECT USING (
        id IN (
            SELECT lc.client_id
            FROM loyalty_cards lc
            JOIN employees e ON e.business_id = lc.business_id
            WHERE e.auth_user_id = auth.uid() AND e.is_active = true
        )
    );

-- Cliente puede ver/editar su propio perfil
CREATE POLICY "client_self_access" ON clients
    FOR ALL USING (auth.uid() = auth_user_id);

-- Permitir INSERT para registro de nuevos clientes (público)
CREATE POLICY "client_public_insert" ON clients
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. POLÍTICAS PARA TRANSACTIONS
-- ============================================================

DROP POLICY IF EXISTS "tx_staff_access" ON transactions;
DROP POLICY IF EXISTS "tx_client_read" ON transactions;

-- Owner puede ver todas las transacciones de tarjetas de su negocio
CREATE POLICY "tx_owner_access" ON transactions
    FOR ALL USING (
        card_id IN (
            SELECT lc.id
            FROM loyalty_cards lc
            JOIN businesses b ON b.id = lc.business_id
            WHERE b.owner_user_id = auth.uid()
        )
    );

-- Empleados pueden ver/crear transacciones de su negocio
CREATE POLICY "tx_employee_access" ON transactions
    FOR ALL USING (
        card_id IN (
            SELECT lc.id
            FROM loyalty_cards lc
            JOIN employees e ON e.business_id = lc.business_id
            WHERE e.auth_user_id = auth.uid() AND e.is_active = true
        )
    );

-- Cliente puede ver transacciones de sus propias tarjetas
CREATE POLICY "tx_client_read" ON transactions
    FOR SELECT USING (
        card_id IN (
            SELECT lc.id
            FROM loyalty_cards lc
            JOIN clients c ON c.id = lc.client_id
            WHERE c.auth_user_id = auth.uid()
        )
    );

-- ============================================================
-- 4. POLÍTICAS PARA BUSINESSES (Asegurar acceso owner)
-- ============================================================

DROP POLICY IF EXISTS "business_owner_all" ON businesses;
DROP POLICY IF EXISTS "business_public_read" ON businesses;

-- Owner tiene acceso completo a su negocio
CREATE POLICY "business_owner_full_access" ON businesses
    FOR ALL USING (owner_user_id = auth.uid());

-- Empleados pueden leer info del negocio donde trabajan
CREATE POLICY "business_employee_read" ON businesses
    FOR SELECT USING (
        id IN (
            SELECT business_id FROM employees
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    );

-- Público puede ver negocios activos (para página /join)
CREATE POLICY "business_public_read" ON businesses
    FOR SELECT USING (is_active = true);

-- ============================================================
-- 5. POLÍTICAS PARA EMPLOYEES
-- ============================================================

DROP POLICY IF EXISTS "employee_owner_all" ON employees;
DROP POLICY IF EXISTS "employee_self_read" ON employees;

-- Owner puede gestionar todos los empleados de su negocio
CREATE POLICY "employee_owner_manage" ON employees
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_user_id = auth.uid()
        )
    );

-- Empleado puede ver su propio registro
CREATE POLICY "employee_self_read" ON employees
    FOR SELECT USING (auth_user_id = auth.uid());

-- ============================================================
-- FIN DEL FIX
-- ============================================================
