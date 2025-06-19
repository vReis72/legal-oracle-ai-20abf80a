
-- Remover políticas que causam recursão infinita
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Criar função auxiliar para verificar se usuário é admin sem causar recursão
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND is_admin = true
  );
$$;

-- Política corrigida para admins verem todos os perfis
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.check_is_admin(auth.uid()));

-- Política corrigida para admins atualizarem perfis
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.check_is_admin(auth.uid()));

-- Criar função para admin excluir usuários
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID,
  admin_user_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_check boolean;
  delete_count integer;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT is_admin INTO admin_check
  FROM profiles
  WHERE id = admin_user_id;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir usuários';
  END IF;
  
  -- Executar exclusão forçada
  DELETE FROM profiles WHERE id = target_user_id;
  
  GET DIAGNOSTICS delete_count = ROW_COUNT;
  
  IF delete_count = 0 THEN
    RAISE EXCEPTION 'Usuário não encontrado ou já foi excluído';
  END IF;
  
  RETURN true;
END;
$$;
