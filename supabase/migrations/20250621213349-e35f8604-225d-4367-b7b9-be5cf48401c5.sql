
-- Verificar e corrigir as políticas RLS para system_settings
-- Primeiro, vamos garantir que a função is_admin_user está funcionando corretamente
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = user_id LIMIT 1), 
    false
  );
$$;

-- Remover todas as políticas existentes para recriar corretamente
DROP POLICY IF EXISTS "Only admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can delete system settings" ON public.system_settings;

-- Recriar as políticas usando a função segura
CREATE POLICY "Admins can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete system settings" 
ON public.system_settings 
FOR DELETE 
USING (public.is_admin_user(auth.uid()));

-- Garantir que RLS está habilitado
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Verificar se o usuário atual é realmente admin
-- (Esta query retornará o status do usuário atual)
SELECT 
  id,
  email,
  is_admin,
  status
FROM profiles 
WHERE id = auth.uid();
