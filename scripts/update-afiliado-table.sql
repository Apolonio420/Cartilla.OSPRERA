-- Agregar las columnas faltantes a la tabla Afiliado
ALTER TABLE "Afiliado" 
ADD COLUMN IF NOT EXISTS "nombre" TEXT,
ADD COLUMN IF NOT EXISTS "apellido" TEXT,
ADD COLUMN IF NOT EXISTS "domicilio" TEXT,
ADD COLUMN IF NOT EXISTS "provincia" TEXT,
ADD COLUMN IF NOT EXISTS "localidad" TEXT,
ADD COLUMN IF NOT EXISTS "plan" TEXT,
ADD COLUMN IF NOT EXISTS "estado" TEXT DEFAULT 'activo';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'Afiliado'
ORDER BY ordinal_position;
