
-- Adicionar enum para status do usuário se não existir
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('pending', 'active', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alterar a tabela profiles para incluir campos de controle administrativo
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Atualizar todos os usuários existentes para status 'active' se ainda não tiverem status
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

-- Criar função para admin gerenciar usuários
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  target_user_id UUID,
  new_status user_status,
  admin_user_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_check boolean;
BEGIN
  -- Verificar se o usuário atual é admin
  SELECT is_admin INTO admin_check
  FROM profiles
  WHERE id = admin_user_id;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar status de usuários';
  END IF;
  
  -- Atualizar o status do usuário
  CASE new_status
    WHEN 'active' THEN
      UPDATE profiles 
      SET status = new_status,
          approved_at = NOW(),
          approved_by = admin_user_id,
          blocked_at = NULL,
          blocked_by = NULL,
          blocked_reason = NULL,
          updated_at = NOW()
      WHERE id = target_user_id;
      
    WHEN 'blocked' THEN
      UPDATE profiles 
      SET status = new_status,
          blocked_at = NOW(),
          blocked_by = admin_user_id,
          blocked_reason = reason,
          updated_at = NOW()
      WHERE id = target_user_id;
      
    WHEN 'pending' THEN
      UPDATE profiles 
      SET status = new_status,
          approved_at = NULL,
          approved_by = NULL,
          updated_at = NOW()
      WHERE id = target_user_id;
  END CASE;
  
  RETURN true;
END;
$$;

-- Criar política RLS para permitir que admins vejam todos os usuários
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

-- Criar política RLS para permitir que admins atualizem perfis
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );
