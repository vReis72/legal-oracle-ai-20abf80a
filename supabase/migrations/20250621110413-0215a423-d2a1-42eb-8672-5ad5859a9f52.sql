
-- Remover a coluna openai_api_key da tabela user_settings
ALTER TABLE public.user_settings DROP COLUMN IF EXISTS openai_api_key;
