-- ============================================================
-- FUNCIÓN: ADD_POINTS_FOR_PURCHASE
-- Calcula automáticamente puntos/cashback basado en monto de compra
-- ============================================================

CREATE OR REPLACE FUNCTION add_points_for_purchase(
    p_card_id UUID,
    p_purchase_amount DECIMAL(10,2),
    p_description TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_location_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_card RECORD;
    v_calculated_amount INTEGER;
    v_points_per_currency DECIMAL;
    v_cashback_percentage DECIMAL;
    v_max_cashback INTEGER;
    v_result JSONB;
BEGIN
    -- 1. Obtener tarjeta y configuración del negocio
    SELECT
        lc.*,
        b.program_type,
        b.program_config,
        b.target_value,
        b.reward_text
    INTO v_card
    FROM loyalty_cards lc
    JOIN businesses b ON b.id = lc.business_id
    WHERE lc.id = p_card_id
    FOR UPDATE OF lc;

    -- Validaciones básicas
    IF v_card IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Card not found',
            'error_code', 'CARD_NOT_FOUND'
        );
    END IF;

    IF v_card.state != 'ACTIVE' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Card is not active',
            'error_code', 'CARD_INACTIVE'
        );
    END IF;

    IF p_purchase_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Purchase amount must be positive',
            'error_code', 'INVALID_AMOUNT'
        );
    END IF;

    -- 2. Calcular puntos según tipo de programa
    CASE v_card.program_type
        WHEN 'points' THEN
            -- Puntos: amount = compra * puntos_por_peso
            v_points_per_currency := COALESCE(
                (v_card.program_config->>'points_per_currency')::decimal,
                1
            );
            v_calculated_amount := FLOOR(p_purchase_amount * v_points_per_currency);

        WHEN 'cashback' THEN
            -- Cashback: amount = compra * porcentaje / 100 (en centavos)
            v_cashback_percentage := COALESCE(
                (v_card.program_config->>'cashback_percentage')::decimal,
                (v_card.program_config->>'percentage')::decimal,
                5
            );
            v_max_cashback := COALESCE(
                (v_card.program_config->>'max_cashback_per_purchase')::integer,
                (v_card.program_config->>'max_cashback')::integer,
                NULL
            );

            -- Calcular cashback (guardamos en centavos para precisión)
            v_calculated_amount := FLOOR(p_purchase_amount * v_cashback_percentage);

            -- Aplicar máximo si existe
            IF v_max_cashback IS NOT NULL AND v_calculated_amount > v_max_cashback THEN
                v_calculated_amount := v_max_cashback;
            END IF;

        WHEN 'seals' THEN
            -- Sellos no se calculan por monto, usar add_stamp directamente
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Seal programs use add_stamp, not purchase amount',
                'error_code', 'WRONG_FUNCTION',
                'program_type', 'seals',
                'suggestion', 'Use add_stamp(card_id, 1) instead'
            );

        WHEN 'levels' THEN
            -- Levels/XP: similar a puntos
            v_points_per_currency := COALESCE(
                (v_card.program_config->>'xp_per_currency')::decimal,
                (v_card.program_config->>'points_per_currency')::decimal,
                1
            );
            v_calculated_amount := FLOOR(p_purchase_amount * v_points_per_currency);

        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Unknown program type: ' || v_card.program_type::text,
                'error_code', 'UNKNOWN_PROGRAM_TYPE'
            );
    END CASE;

    -- 3. Validar que haya algo que agregar
    IF v_calculated_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Purchase amount too low to earn rewards',
            'error_code', 'AMOUNT_TOO_LOW',
            'purchase_amount', p_purchase_amount,
            'calculated_amount', 0,
            'program_type', v_card.program_type::text
        );
    END IF;

    -- 4. Llamar a add_stamp con el monto calculado
    SELECT add_stamp(
        p_card_id,
        v_calculated_amount,
        COALESCE(p_description, 'Compra por $' || p_purchase_amount::text),
        p_created_by,
        p_location_name
    ) INTO v_result;

    -- 5. Agregar info adicional al resultado
    IF (v_result->>'success')::boolean = true THEN
        v_result := v_result || jsonb_build_object(
            'purchase_amount', p_purchase_amount,
            'calculated_points', v_calculated_amount,
            'program_type', v_card.program_type::text,
            'calculation_details', CASE v_card.program_type
                WHEN 'points' THEN jsonb_build_object(
                    'points_per_currency', v_points_per_currency,
                    'formula', p_purchase_amount::text || ' x ' || v_points_per_currency::text || ' = ' || v_calculated_amount::text
                )
                WHEN 'cashback' THEN jsonb_build_object(
                    'cashback_percentage', v_cashback_percentage,
                    'max_cashback', v_max_cashback,
                    'formula', p_purchase_amount::text || ' x ' || v_cashback_percentage::text || '% = ' || v_calculated_amount::text
                )
                WHEN 'levels' THEN jsonb_build_object(
                    'xp_per_currency', v_points_per_currency,
                    'formula', p_purchase_amount::text || ' x ' || v_points_per_currency::text || ' = ' || v_calculated_amount::text
                )
                ELSE '{}'::jsonb
            END
        );
    END IF;

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos
GRANT EXECUTE ON FUNCTION add_points_for_purchase TO authenticated;
GRANT EXECUTE ON FUNCTION add_points_for_purchase TO anon;

-- ============================================================
-- Comentario de uso
-- ============================================================
COMMENT ON FUNCTION add_points_for_purchase IS '
Calcula y agrega puntos/cashback basado en el monto de una compra.

Parámetros:
- p_card_id: UUID de la loyalty_card
- p_purchase_amount: Monto de la compra (ej: 150.50)
- p_description: Descripción opcional
- p_created_by: UUID del usuario que registra
- p_location_name: Nombre de la sucursal

Comportamiento por tipo de programa:
- points: Multiplica por points_per_currency (default 1)
- cashback: Multiplica por cashback_percentage/100 (default 5%)
- levels: Multiplica por xp_per_currency (default 1)
- seals: Retorna error (usar add_stamp directo)

Ejemplo:
  SELECT add_points_for_purchase(
    ''card-uuid'',
    150.00,
    ''Compra en sucursal centro''
  );
';
