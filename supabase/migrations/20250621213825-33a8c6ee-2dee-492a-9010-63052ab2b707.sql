
-- Inserir configurações padrão para todos os usuários existentes na tabela profiles
INSERT INTO public.user_settings (
  user_id,
  user_name,
  contact_email,
  company_name,
  user_oab,
  theme,
  created_at,
  updated_at
)
SELECT 
  p.id::text as user_id,
  COALESCE(p.full_name, '') as user_name,
  COALESCE(p.email, '') as contact_email,
  COALESCE(p.company_name, '') as company_name,
  COALESCE(p.oab_number, '') as user_oab,
  'light' as theme,
  NOW() as created_at,
  NOW() as updated_at
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_settings us 
  WHERE us.user_id = p.id::text
);

-- Verificar os dados inseridos
SELECT 
  us.user_id,
  us.user_name,
  us.contact_email,
  us.company_name,
  us.user_oab,
  us.theme,
  p.is_admin
FROM public.user_settings us
JOIN public.profiles p ON p.id::text = us.user_id
ORDER BY p.is_admin DESC, us.user_name;
