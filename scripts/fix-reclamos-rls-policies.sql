-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'Reclamos';

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view own reclamos" ON "Reclamos";
DROP POLICY IF EXISTS "Users can insert own reclamos" ON "Reclamos";
DROP POLICY IF EXISTS "Users can update own reclamos" ON "Reclamos";

-- Crear nuevas políticas más permisivas para testing
CREATE POLICY "Enable read access for all users" ON "Reclamos"
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "Reclamos"
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON "Reclamos"
FOR UPDATE USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'Reclamos';
