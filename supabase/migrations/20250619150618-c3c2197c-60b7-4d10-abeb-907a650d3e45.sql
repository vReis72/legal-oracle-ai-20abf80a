
-- Atualizar a função admin_delete_user para excluir do auth.users também
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
  
  -- Excluir do perfil primeiro (por causa do CASCADE)
  DELETE FROM profiles WHERE id = target_user_id;
  
  GET DIAGNOSTICS delete_count = ROW_COUNT;
  
  IF delete_count = 0 THEN
    RAISE EXCEPTION 'Usuário não encontrado ou já foi excluído';
  END IF;
  
  -- Excluir do sistema de autenticação
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN true;
END;
$$;
