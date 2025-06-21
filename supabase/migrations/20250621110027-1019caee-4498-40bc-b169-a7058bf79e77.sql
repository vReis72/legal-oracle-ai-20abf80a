
-- Criar função de segurança para verificar se o usuário é admin
-- Isso evita recursão infinita nas políticas RLS
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

-- Remover políticas problemáticas e recriar com a função
DROP POLICY IF EXISTS "Only admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can delete system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recriar políticas para system_settings usando a função
CREATE POLICY "Only admins can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Only admins can insert system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Only admins can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Only admins can delete system settings" 
ON public.system_settings 
FOR DELETE 
USING (public.is_admin_user(auth.uid()));

-- Política corrigida para profiles (evita auto-referência)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin_user(auth.uid()));
