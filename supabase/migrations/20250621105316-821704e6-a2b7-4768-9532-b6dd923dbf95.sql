
-- Primeiro, remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Only admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can delete system settings" ON public.system_settings;

-- Criar políticas RLS para system_settings
CREATE POLICY "Only admins can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can insert system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can delete system settings" 
ON public.system_settings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Verificar se RLS está habilitado para system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas para outras tabelas apenas se não existirem
DO $$
BEGIN
    -- Habilitar RLS em todas as tabelas se não estiver habilitado
    ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
    
    -- Políticas para chat_conversations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can view own conversations') THEN
        EXECUTE 'CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can create own conversations') THEN
        EXECUTE 'CREATE POLICY "Users can create own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can update own conversations') THEN
        EXECUTE 'CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can delete own conversations') THEN
        EXECUTE 'CREATE POLICY "Users can delete own conversations" ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id)';
    END IF;
    
    -- Políticas para documents
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view own documents') THEN
        EXECUTE 'CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can create own documents') THEN
        EXECUTE 'CREATE POLICY "Users can create own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can update own documents') THEN
        EXECUTE 'CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can delete own documents') THEN
        EXECUTE 'CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id)';
    END IF;
    
    -- Políticas para legal_documents
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legal_documents' AND policyname = 'Users can view own legal documents') THEN
        EXECUTE 'CREATE POLICY "Users can view own legal documents" ON public.legal_documents FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legal_documents' AND policyname = 'Users can create own legal documents') THEN
        EXECUTE 'CREATE POLICY "Users can create own legal documents" ON public.legal_documents FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legal_documents' AND policyname = 'Users can update own legal documents') THEN
        EXECUTE 'CREATE POLICY "Users can update own legal documents" ON public.legal_documents FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'legal_documents' AND policyname = 'Users can delete own legal documents') THEN
        EXECUTE 'CREATE POLICY "Users can delete own legal documents" ON public.legal_documents FOR DELETE USING (auth.uid() = user_id)';
    END IF;
    
    -- Políticas para user_settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can view own settings') THEN
        EXECUTE 'CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid()::text = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can insert own settings') THEN
        EXECUTE 'CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid()::text = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can update own settings') THEN
        EXECUTE 'CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid()::text = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can delete own settings') THEN
        EXECUTE 'CREATE POLICY "Users can delete own settings" ON public.user_settings FOR DELETE USING (auth.uid()::text = user_id)';
    END IF;
    
END $$;
