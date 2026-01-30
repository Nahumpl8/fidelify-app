-- ============================================
-- FIDELIFY - Políticas RLS (Row Level Security)
-- Archivo: supabase/policies/rls_policies.sql
-- ============================================

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: organizations
-- ============================================

CREATE POLICY "Users can view own organization"
ON organizations FOR SELECT
USING (id = get_user_organization_id());

CREATE POLICY "Owners can update own organization"
ON organizations FOR UPDATE
USING (
    id = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
    )
);

CREATE POLICY "Authenticated users can create organization"
ON organizations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owners can delete own organization"
ON organizations FOR DELETE
USING (
    id = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
    )
);

-- ============================================
-- POLÍTICAS: profiles
-- ============================================

CREATE POLICY "Users can view profiles in own organization"
ON profiles FOR SELECT
USING (organization_id = get_user_organization_id());

CREATE POLICY "Owners can add profiles to organization"
ON profiles FOR INSERT
WITH CHECK (
    organization_id = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Owners can delete profiles except themselves"
ON profiles FOR DELETE
USING (
    organization_id = get_user_organization_id()
    AND id != auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
    )
);

-- ============================================
-- POLÍTICAS: loyalty_cards
-- ============================================

CREATE POLICY "Users can view loyalty cards in own organization"
ON loyalty_cards FOR SELECT
USING (organization_id = get_user_organization_id());

CREATE POLICY "Public can view active loyalty cards"
ON loyalty_cards FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create loyalty cards in own organization"
ON loyalty_cards FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update loyalty cards in own organization"
ON loyalty_cards FOR UPDATE
USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can delete loyalty cards"
ON loyalty_cards FOR DELETE
USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin')
    )
);

-- ============================================
-- POLÍTICAS: customers
-- ============================================

CREATE POLICY "Users can view customers in own organization"
ON customers FOR SELECT
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can add customers to own organization"
ON customers FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Public can register as customer"
ON customers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update customers in own organization"
ON customers FOR UPDATE
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete customers in own organization"
ON customers FOR DELETE
USING (organization_id = get_user_organization_id());

-- ============================================
-- POLÍTICAS: transactions
-- ============================================

CREATE POLICY "Users can view transactions in own organization"
ON transactions FOR SELECT
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create transactions in own organization"
ON transactions FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Transacciones son inmutables - no UPDATE ni DELETE
