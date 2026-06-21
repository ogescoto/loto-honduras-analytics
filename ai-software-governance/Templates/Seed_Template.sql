-- =====================================================================
-- PLANTILLA DE SEED
-- =====================================================================
-- Copia este archivo y ajústalo. Elige UNO de los tipos (dev o test).
-- Reglas: ver ../03_Database/Seeds_Strategy.md
--
--   - Prefijo de archivo: dev_<nombre>.sql  |  test_<nombre>.sql
--   - dev  → datos realistas, idempotente, para revisión manual/demo
--   - test → datos deterministas, aislados por caso de uso
--   - prod → NO usar datos ficticios aquí (solo catálogos base)
-- =====================================================================

-- ---------------------------------------------------------------------
-- EJEMPLO: SEED DE DESARROLLO
-- Tipo: desarrollo | Módulo: Pagos
-- Descripción: datos iniciales para pruebas manuales del flujo de pago
-- Ejecutar: make seed-dev   (o npm run db:seed:dev)
-- ---------------------------------------------------------------------

-- Idempotencia: limpiar antes de insertar (o usar UPSERT)
DELETE FROM payments      WHERE user_id = '00000000-0000-0000-0000-000000000100';
DELETE FROM payment_methods WHERE user_id = '00000000-0000-0000-0000-000000000100';
DELETE FROM users         WHERE id = '00000000-0000-0000-0000-000000000100';

-- Usuario de prueba con rol cliente
INSERT INTO users (id, name, email, role)
VALUES ('00000000-0000-0000-0000-000000000100', 'Usuario Prueba', 'test@ejemplo.com', 'cliente');

-- Método de pago de prueba (token de TEST del proveedor, nunca real)
INSERT INTO payment_methods (id, user_id, provider_token, is_default)
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000100', 'tok_visa', true);

-- Algunos pagos en distintos estados para revisión visual
INSERT INTO payments (id, user_id, amount, currency, status)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000100', 2500, 'EUR', 'completed'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000100', 1000, 'EUR', 'pending'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000100',  500, 'EUR', 'refunded');


-- ---------------------------------------------------------------------
-- EJEMPLO: SEED DE TEST
-- Tipo: test | datos deterministas y reproducibles
-- Ejecutar: make seed-test   (antes de la suite)
-- Requisito: vivir en transacción con rollback o BD efímera.
-- ---------------------------------------------------------------------

INSERT INTO users (id, name, email, role)
VALUES ('usr_test_01', 'Test User 01', 'usr01@test.local', 'cliente');

INSERT INTO payments (id, user_id, amount, currency, status)
VALUES
  ('pay_0001', 'usr_test_01', 1000, 'EUR', 'completed'),
  ('pay_0002', 'usr_test_01', 2500, 'EUR', 'pending');
