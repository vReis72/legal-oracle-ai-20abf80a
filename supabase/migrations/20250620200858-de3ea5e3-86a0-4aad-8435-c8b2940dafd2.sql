
-- Verificar se há dados na tabela system_settings
SELECT 
  id,
  openai_api_key,
  CASE 
    WHEN openai_api_key IS NULL THEN 'VAZIO'
    WHEN openai_api_key = '' THEN 'STRING VAZIA'
    WHEN LENGTH(openai_api_key) < 20 THEN 'MUITO CURTO'
    WHEN NOT openai_api_key LIKE 'sk-%' THEN 'FORMATO INVÁLIDO'
    ELSE 'VÁLIDO'
  END as status_chave,
  LENGTH(openai_api_key) as tamanho_chave,
  created_at,
  updated_at
FROM system_settings;

-- Se não houver registros, inserir um registro de teste
INSERT INTO system_settings (openai_api_key) 
SELECT 'sk-test-key-for-debugging-purposes-only-replace-with-real-key'
WHERE NOT EXISTS (SELECT 1 FROM system_settings);
