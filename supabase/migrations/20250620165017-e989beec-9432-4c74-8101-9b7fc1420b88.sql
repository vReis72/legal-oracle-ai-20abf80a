
-- Criar tabela user_settings para armazenar configurações do usuário
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_name TEXT,
    user_name TEXT,
    user_oab TEXT,
    contact_email TEXT,
    openai_api_key TEXT,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para user_id para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Adicionar política RLS (Row Level Security)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias configurações
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (true);

-- Política para permitir que usuários insiram suas próprias configurações
CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (true);

-- Política para permitir que usuários atualizem suas próprias configurações
CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (true);

-- Política para permitir que usuários deletem suas próprias configurações
CREATE POLICY "Users can delete own settings" ON public.user_settings
    FOR DELETE USING (true);
