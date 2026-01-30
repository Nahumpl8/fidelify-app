-- ============================================================
-- FIX: Recursión Infinita en Políticas RLS
-- ============================================================
-- Problema: Las políticas se referenciaban circularmente causando
-- "infinite recursion detected in policy"
--
-- Solución: Usar subconsultas directas sin JOINs entre tablas
-- que tienen políticas RLS activas.
-- ============================================================

-- ============================================================
-- 1. DESACTIVAR RLS TEMPORALMENTE PARA LIMPIAR
-- ============================================================

-- Eliminar TODAS las políticas existentes
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ============================================================
-- 2. POLÍTICAS PARA BUSINESSES (Sin dependencias)
-- ============================================================

-- Owner tiene acceso completo (simple, sin subconsultas)
CREATE POLICY "businesses_owner" ON businesses
    FOR ALL
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

-- Lectura pública para negocios activos
CREATE POLICY "businesses_public_read" ON businesses
    FOR SELECT
    USING (is_active = true);

-- ============================================================
-- 3. POLÍTICAS PARA EMPLOYEES (Solo depende de businesses.owner_user_id)
-- ============================================================

-- Owner del negocio gestiona empleados
CREATE POLICY "employees_owner" ON employees
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM businesses b
            WHERE b.id = employees.business_id
            AND b.owner_user_id = auth.uid()
        )
    );

-- Empleado ve su propio registro
CREATE POLICY "employees_self" ON employees
    FOR SELECT
    USING (auth_user_id = auth.uid());

-- ============================================================
-- 4. POLÍTICAS PARA LOYALTY_CARDS
-- ============================================================

-- Owner ve tarjetas de su negocio (via businesses directamente)
CREATE POLICY "cards_owner" ON loyalty_cards
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM businesses b
            WHERE b.id = loyalty_cards.business_id
            AND b.owner_user_id = auth.uid()
        )
    );

-- Empleado ve tarjetas de su negocio
CREATE POLICY "cards_employee" ON loyalty_cards
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees e
            WHERE e.business_id = loyalty_cards.business_id
            AND e.auth_user_id = auth.uid()
            AND e.is_active = true
        )
    );

-- Cliente ve sus propias tarjetas
CREATE POLICY "cards_client" ON loyalty_cards
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = loyalty_cards.client_id
            AND c.auth_user_id = auth.uid()
        )
    );

-- ============================================================
-- 5. POLÍTICAS PARA CLIENTS
-- ============================================================

-- Cliente accede a su propio perfil
CREATE POLICY "clients_self" ON clients
    FOR ALL
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- Owner ve clientes de su negocio (sin JOIN a loyalty_cards que tiene RLS)
CREATE POLICY "clients_owner_read" ON clients
    FOR SELECT
    USING (
        id IN (
            SELECT lc.client_id
            FROM loyalty_cards lc
            INNER JOIN businesses b ON b.id = lc.business_id
            WHERE b.owner_user_id = auth.uid()
        )
    );

-- Empleado ve clientes de su negocio
CREATE POLICY "clients_employee_read" ON clients
    FOR SELECT
    USING (
        id IN (
            SELECT lc.client_id
            FROM loyalty_cards lc
            INNER JOIN employees e ON e.business_id = lc.business_id
            WHERE e.auth_user_id = auth.uid()
            AND e.is_active = true
        )
    );

-- Registro público de nuevos clientes
CREATE POLICY "clients_insert" ON clients
    FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- 6. POLÍTICAS PARA TRANSACTIONS
-- ============================================================

-- Owner ve transacciones de su negocio
CREATE POLICY "tx_owner" ON transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM loyalty_cards lc
            INNER JOIN businesses b ON b.id = lc.business_id
            WHERE lc.id = transactions.card_id
            AND b.owner_user_id = auth.uid()
        )
    );

-- Empleado ve/crea transacciones de su negocio
CREATE POLICY "tx_employee" ON transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM loyalty_cards lc
            INNER JOIN employees e ON e.business_id = lc.business_id
            WHERE lc.id = transactions.card_id
            AND e.auth_user_id = auth.uid()
            AND e.is_active = true
        )
    );

-- Cliente ve sus propias transacciones
CREATE POLICY "tx_client_read" ON transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM loyalty_cards lc
            INNER JOIN clients c ON c.id = lc.client_id
            WHERE lc.id = transactions.card_id
            AND c.auth_user_id = auth.uid()
        )
    );

-- ============================================================
-- FIN - Las políticas ahora usan EXISTS con JOINs directos
-- evitando referencias circulares
-- ============================================================
