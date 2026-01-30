-- ============================================================
-- SEED: Datos de prueba para "El Ray-Myon Loco"
-- ============================================================

-- Insertar clientes de prueba (UUIDs válidos)
INSERT INTO clients (id, full_name, email, phone, first_name, last_name) VALUES
  ('c1a00000-0000-0000-0000-000000000001', 'María González', 'maria@example.com', '+52 55 1234 5678', 'María', 'González'),
  ('c1a00000-0000-0000-0000-000000000002', 'Carlos Rodríguez', 'carlos@example.com', '+52 55 2345 6789', 'Carlos', 'Rodríguez'),
  ('c1a00000-0000-0000-0000-000000000003', 'Ana Martínez', 'ana@example.com', '+52 55 3456 7890', 'Ana', 'Martínez'),
  ('c1a00000-0000-0000-0000-000000000004', 'Roberto Sánchez', 'roberto@example.com', '+52 55 4567 8901', 'Roberto', 'Sánchez'),
  ('c1a00000-0000-0000-0000-000000000005', 'Laura Pérez', 'laura@example.com', '+52 55 5678 9012', 'Laura', 'Pérez')
ON CONFLICT DO NOTHING;

-- Insertar loyalty cards vinculadas a "El Ray-Myon Loco"
-- Incluimos apple_serial_number para evitar el trigger que usa gen_random_bytes
INSERT INTO loyalty_cards (id, business_id, client_id, current_balance, lifetime_balance, tier_level, state, total_visits, rewards_redeemed, last_activity_at, apple_serial_number) VALUES
  ('ca4d0000-0000-0000-0000-000000000001', '0143fd84-d926-462f-b885-f07b721746a6', 'c1a00000-0000-0000-0000-000000000001', 7, 22, 'Gold', 'ACTIVE', 22, 2, NOW() - INTERVAL '2 hours', 'serial_maria_001'),
  ('ca4d0000-0000-0000-0000-000000000002', '0143fd84-d926-462f-b885-f07b721746a6', 'c1a00000-0000-0000-0000-000000000002', 3, 8, 'Bronze', 'ACTIVE', 8, 0, NOW() - INTERVAL '1 day', 'serial_carlos_002'),
  ('ca4d0000-0000-0000-0000-000000000003', '0143fd84-d926-462f-b885-f07b721746a6', 'c1a00000-0000-0000-0000-000000000003', 10, 35, 'Gold', 'ACTIVE', 35, 3, NOW() - INTERVAL '30 minutes', 'serial_ana_003'),
  ('ca4d0000-0000-0000-0000-000000000004', '0143fd84-d926-462f-b885-f07b721746a6', 'c1a00000-0000-0000-0000-000000000004', 1, 1, 'Bronze', 'ACTIVE', 1, 0, NOW() - INTERVAL '5 days', 'serial_roberto_004'),
  ('ca4d0000-0000-0000-0000-000000000005', '0143fd84-d926-462f-b885-f07b721746a6', 'c1a00000-0000-0000-0000-000000000005', 5, 15, 'Silver', 'ACTIVE', 15, 1, NOW() - INTERVAL '6 hours', 'serial_laura_005')
ON CONFLICT DO NOTHING;

-- Insertar transacciones de ejemplo
INSERT INTO transactions (card_id, type, amount, balance_before, balance_after, description, location_name, created_at) VALUES
  ('ca4d0000-0000-0000-0000-000000000001', 'EARN', 1, 6, 7, 'Visita regular', 'Sucursal Centro', NOW() - INTERVAL '2 hours'),
  ('ca4d0000-0000-0000-0000-000000000001', 'EARN', 1, 5, 6, 'Compra café', 'Sucursal Centro', NOW() - INTERVAL '1 day'),
  ('ca4d0000-0000-0000-0000-000000000001', 'REDEEM', -10, 15, 5, 'Café gratis canjeado', 'Sucursal Centro', NOW() - INTERVAL '3 days'),
  ('ca4d0000-0000-0000-0000-000000000003', 'EARN', 2, 8, 10, 'Doble puntos martes', 'Sucursal Norte', NOW() - INTERVAL '30 minutes'),
  ('ca4d0000-0000-0000-0000-000000000003', 'EARN', 1, 7, 8, 'Visita regular', 'Sucursal Norte', NOW() - INTERVAL '2 days'),
  ('ca4d0000-0000-0000-0000-000000000005', 'EARN', 1, 4, 5, 'Primera visita del mes', 'Sucursal Sur', NOW() - INTERVAL '6 hours'),
  ('ca4d0000-0000-0000-0000-000000000002', 'EARN', 1, 2, 3, 'Compra especial', 'Sucursal Centro', NOW() - INTERVAL '1 day');
