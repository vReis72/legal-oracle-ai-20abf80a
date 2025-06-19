
-- Excluir usuários órfãos que existem em auth.users mas não têm perfil correspondente
DELETE FROM auth.users 
WHERE id NOT IN (
  SELECT id FROM public.profiles
);
