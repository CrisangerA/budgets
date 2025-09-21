-- Migración 002: Agregar datos mock adicionales para el sistema de gestión de créditos
-- Esta migración agrega más datos de prueba para poblar todas las vistas

-- Agregar más proveedores
INSERT INTO providers (name, contact_info, total_credit) VALUES
('Proveedor D', 'proveedord@email.com - Calle Principal 456 - +1-555-0104', 0.00),
('Proveedor E', 'proveedore@email.com - Avenida Central 789 - +1-555-0105', 0.00),
('Proveedor F', 'proveedorf@email.com - Boulevard Norte 321 - +1-555-0106', 0.00),
('Proveedor G', 'proveedorg@email.com - Plaza Sur 654 - +1-555-0107', 0.00);

-- Agregar más meses
INSERT INTO months (name, year, total_credit) VALUES
('Abril', 2024, 16500.00),
('Mayo', 2024, 17200.00),
('Junio', 2024, 15800.00);

-- Agregar semanas para los nuevos meses
-- Semanas para Abril 2024
INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  1,
  '2024-04-01'::date,
  '2024-04-07'::date,
  4100.00
FROM months m WHERE m.name = 'Abril' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  2,
  '2024-04-08'::date,
  '2024-04-14'::date,
  4200.00
FROM months m WHERE m.name = 'Abril' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  3,
  '2024-04-15'::date,
  '2024-04-21'::date,
  4000.00
FROM months m WHERE m.name = 'Abril' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  4,
  '2024-04-22'::date,
  '2024-04-30'::date,
  4200.00
FROM months m WHERE m.name = 'Abril' AND m.year = 2024;

-- Semanas para Mayo 2024
INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  1,
  '2024-05-01'::date,
  '2024-05-07'::date,
  4300.00
FROM months m WHERE m.name = 'Mayo' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  2,
  '2024-05-08'::date,
  '2024-05-14'::date,
  4400.00
FROM months m WHERE m.name = 'Mayo' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  3,
  '2024-05-15'::date,
  '2024-05-21'::date,
  4250.00
FROM months m WHERE m.name = 'Mayo' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  4,
  '2024-05-22'::date,
  '2024-05-31'::date,
  4250.00
FROM months m WHERE m.name = 'Mayo' AND m.year = 2024;

-- Semanas para Junio 2024
INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  1,
  '2024-06-01'::date,
  '2024-06-07'::date,
  3950.00
FROM months m WHERE m.name = 'Junio' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  2,
  '2024-06-08'::date,
  '2024-06-14'::date,
  3900.00
FROM months m WHERE m.name = 'Junio' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  3,
  '2024-06-15'::date,
  '2024-06-21'::date,
  3950.00
FROM months m WHERE m.name = 'Junio' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  4,
  '2024-06-22'::date,
  '2024-06-30'::date,
  4000.00
FROM months m WHERE m.name = 'Junio' AND m.year = 2024;

-- Agregar pagos de ejemplo para las semanas existentes de Enero
INSERT INTO payments (week_id, provider_id, amount, description, payment_date)
SELECT 
  w.id,
  p.id,
  250.00,
  'Compra de materiales de oficina',
  '2024-01-03'::date
FROM weeks w 
JOIN months m ON w.month_id = m.id
JOIN providers p ON p.name = 'Proveedor A'
WHERE m.name = 'Enero' AND m.year = 2024 AND w.week_number = 1
LIMIT 1;

INSERT INTO payments (week_id, provider_id, amount, description, payment_date)
SELECT 
  w.id,
  p.id,
  180.00,
  'Suministros de limpieza',
  '2024-01-05'::date
FROM weeks w 
JOIN months m ON w.month_id = m.id
JOIN providers p ON p.name = 'Proveedor B'
WHERE m.name = 'Enero' AND m.year = 2024 AND w.week_number = 1
LIMIT 1;

-- Agregar pagos para las nuevas semanas de Abril
INSERT INTO payments (week_id, provider_id, amount, description, payment_date)
SELECT 
  w.id,
  p.id,
  1200.00,
  'Equipos de oficina',
  '2024-04-02'::date
FROM weeks w 
JOIN months m ON w.month_id = m.id
JOIN providers p ON p.name = 'Proveedor D'
WHERE m.name = 'Abril' AND m.year = 2024 AND w.week_number = 1
LIMIT 1;

INSERT INTO payments (week_id, provider_id, amount, description, payment_date)
SELECT 
  w.id,
  p.id,
  800.00,
  'Servicios de consultoría',
  '2024-04-10'::date
FROM weeks w 
JOIN months m ON w.month_id = m.id
JOIN providers p ON p.name = 'Proveedor E'
WHERE m.name = 'Abril' AND m.year = 2024 AND w.week_number = 2
LIMIT 1;

-- Agregar pagos para Mayo
INSERT INTO payments (week_id, provider_id, amount, description, payment_date)
SELECT 
  w.id,
  p.id,
  950.00,
  'Mantenimiento de equipos',
  '2024-05-03'::date
FROM weeks w 
JOIN months m ON w.month_id = m.id
JOIN providers p ON p.name = 'Proveedor F'
WHERE m.name = 'Mayo' AND m.year = 2024 AND w.week_number = 1
LIMIT 1;

-- Crear índices adicionales para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_week_provider ON payments(week_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_weeks_month_week ON weeks(month_id, week_number);

-- Comentario final
-- Esta migración agrega datos mock para:
-- - 4 proveedores adicionales
-- - 3 meses adicionales (Abril, Mayo, Junio 2024)
-- - 12 semanas adicionales (4 por mes)
-- - Varios pagos de ejemplo para testing
-- - Índices adicionales para optimizar consultas