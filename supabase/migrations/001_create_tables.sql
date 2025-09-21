-- Crear tabla de meses
CREATE TABLE months (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  total_credit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de semanas
CREATE TABLE weeks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  credit_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de proveedores
CREATE TABLE providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_info TEXT,
  total_credit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pagos
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_weeks_month_id ON weeks(month_id);
CREATE INDEX idx_payments_provider_id ON payments(provider_id);
CREATE INDEX idx_payments_week_id ON payments(week_id);
CREATE INDEX idx_months_year ON months(year);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE months ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para permitir acceso completo a usuarios autenticados
CREATE POLICY "Allow all operations for authenticated users" ON months
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON weeks
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON providers
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON payments
  FOR ALL USING (true);

-- Permitir acceso a usuarios anónimos también (para desarrollo)
CREATE POLICY "Allow all operations for anonymous users" ON months
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for anonymous users" ON weeks
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for anonymous users" ON providers
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for anonymous users" ON payments
  FOR ALL USING (true);

-- Conceder permisos a los roles anon y authenticated
GRANT ALL PRIVILEGES ON months TO anon, authenticated;
GRANT ALL PRIVILEGES ON weeks TO anon, authenticated;
GRANT ALL PRIVILEGES ON providers TO anon, authenticated;
GRANT ALL PRIVILEGES ON payments TO anon, authenticated;

-- Conceder permisos de uso en las secuencias
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insertar datos de ejemplo
INSERT INTO months (name, year, total_credit) VALUES
  ('Enero', 2024, 1500.00),
  ('Febrero', 2024, 2000.00),
  ('Marzo', 2024, 1800.00);

INSERT INTO providers (name, contact_info, total_credit) VALUES
  ('Proveedor A', 'contacto@proveedora.com', 800.00),
  ('Proveedor B', 'info@proveedorb.com', 1200.00),
  ('Proveedor C', 'ventas@proveedorc.com', 950.00);

-- Insertar semanas de ejemplo para Enero 2024
INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  1,
  '2024-01-01'::date,
  '2024-01-07'::date,
  400.00
FROM months m WHERE m.name = 'Enero' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  2,
  '2024-01-08'::date,
  '2024-01-14'::date,
  350.00
FROM months m WHERE m.name = 'Enero' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  3,
  '2024-01-15'::date,
  '2024-01-21'::date,
  450.00
FROM months m WHERE m.name = 'Enero' AND m.year = 2024;

INSERT INTO weeks (month_id, week_number, start_date, end_date, credit_amount)
SELECT 
  m.id,
  4,
  '2024-01-22'::date,
  '2024-01-31'::date,
  300.00
FROM months m WHERE m.name = 'Enero' AND m.year = 2024;