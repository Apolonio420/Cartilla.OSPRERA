-- Verificar si ya existe una política de UPDATE
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'Reclamos' AND cmd = 'UPDATE';

-- Crear política de UPDATE si no existe
CREATE POLICY "Enable update access for all users" ON "Reclamos"
FOR UPDATE USING (true);

-- Verificar que la política se creó correctamente
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'Reclamos' AND cmd = 'UPDATE';
