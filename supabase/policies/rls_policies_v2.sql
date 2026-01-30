-- ============================================
-- FIDELIFY - Políticas RLS v2 (Motor de Lealtad)
-- Archivo: supabase/policies/rls_policies_v2.sql
-- ============================================

-- ============================================
-- HABILITAR RLS EN NUEVAS TABLAS
-- ============================================
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: programs
-- ============================================

-- SELECT: Ver programas de mi organización
CREATE POLICY "Users can view programs in own organization"
ON programs FOR SELECT
USING (organization_id = get_user_organization_id());

-- SELECT: Público puede ver programas activos (para registro de clientes)
CREATE POLICY "Public can view active programs"
ON programs FOR SELECT
USING (is_active = true);

-- INSERT: Crear programas en mi organización
CREATE POLICY "Users can create programs in own organization"
ON programs FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- UPDATE: Actualizar programas de mi organización
CREATE POLICY "Users can update programs in own organization"
ON programs FOR UPDATE
USING (organization_id = get_user_organization_id());

-- DELETE: Solo admins pueden eliminar programas
CREATE POLICY "Admins can delete programs"
ON programs FOR DELETE
USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('owner', 'admin')
    )
);

-- ============================================
-- POLÍTICAS: program_links
-- ============================================

-- SELECT: Ver links de mi organización
CREATE POLICY "Users can view program links in own organization"
ON program_links FOR SELECT
USING (organization_id = get_user_organization_id());

-- SELECT: Público puede ver links activos (para seguimiento)
CREATE POLICY "Public can view active program links"
ON program_links FOR SELECT
USING (is_active = true);

-- INSERT: Crear links en mi organización
CREATE POLICY "Users can create program links in own organization"
ON program_links FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- UPDATE: Actualizar links de mi organización
CREATE POLICY "Users can update program links in own organization"
ON program_links FOR UPDATE
USING (organization_id = get_user_organization_id());

-- DELETE: Eliminar links de mi organización
CREATE POLICY "Users can delete program links in own organization"
ON program_links FOR DELETE
USING (organization_id = get_user_organization_id());

-- ============================================
-- FUNCIÓN RPC: Registrar cliente via link público
-- ============================================
CREATE OR REPLACE FUNCTION register_customer_via_link(
    p_link_slug VARCHAR,
    p_email VARCHAR DEFAULT NULL,
    p_phone VARCHAR DEFAULT NULL,
    p_full_name VARCHAR DEFAULT NULL,
    p_custom_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_link RECORD;
    v_program RECORD;
    v_customer_id UUID;
    v_pass_serial VARCHAR;
BEGIN
    -- Obtener link y programa
    SELECT pl.*, p.organization_id, p.id as program_id, p.data_collection
    INTO v_link
    FROM program_links pl
    JOIN programs p ON p.id = pl.program_id
    WHERE pl.slug = p_link_slug AND pl.is_active = true AND p.is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Invalid or inactive link');
    END IF;

    -- Incrementar contador de clicks
    UPDATE program_links SET clicks = clicks + 1 WHERE id = v_link.id;

    -- Generar serial único para el pase
    v_pass_serial := 'FID-' || REPLACE(gen_random_uuid()::text, '-', '');

    -- Crear cliente
    INSERT INTO customers (
        organization_id,
        program_id,
        email,
        phone,
        full_name,
        custom_data,
        pass_serial_number
    ) VALUES (
        v_link.organization_id,
        v_link.program_id,
        p_email,
        p_phone,
        p_full_name,
        p_custom_data,
        v_pass_serial
    )
    RETURNING id INTO v_customer_id;

    -- Incrementar contador de registros
    UPDATE program_links SET registrations = registrations + 1 WHERE id = v_link.id;

    RETURN jsonb_build_object(
        'success', true,
        'customer_id', v_customer_id,
        'pass_serial', v_pass_serial
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN RPC: Incrementar click en link (sin auth)
-- ============================================
CREATE OR REPLACE FUNCTION track_link_click(p_link_slug VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE program_links SET clicks = clicks + 1 WHERE slug = p_link_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
