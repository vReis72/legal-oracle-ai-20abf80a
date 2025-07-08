-- Criar políticas RLS para a tabela system_settings
-- Permitir que qualquer usuário possa ler e escrever configurações do sistema

-- Política para SELECT (leitura)
DROP POLICY IF EXISTS "Allow read access to system_settings" ON system_settings;
CREATE POLICY "Allow read access to system_settings" 
ON system_settings 
FOR SELECT 
USING (true);

-- Política para INSERT (criação)
DROP POLICY IF EXISTS "Allow insert to system_settings" ON system_settings;
CREATE POLICY "Allow insert to system_settings" 
ON system_settings 
FOR INSERT 
WITH CHECK (true);

-- Política para UPDATE (atualização)
DROP POLICY IF EXISTS "Allow update to system_settings" ON system_settings;
CREATE POLICY "Allow update to system_settings" 
ON system_settings 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Política para DELETE (exclusão)
DROP POLICY IF EXISTS "Allow delete from system_settings" ON system_settings;
CREATE POLICY "Allow delete from system_settings" 
ON system_settings 
FOR DELETE 
USING (true);