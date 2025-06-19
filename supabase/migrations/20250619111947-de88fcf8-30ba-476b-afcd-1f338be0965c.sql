
-- Primeiro, vamos verificar e corrigir as políticas RLS na tabela profiles
-- Remover todas as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recriar políticas básicas e funcionais
-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política simples para admins verem todos os perfis (sem recursão)
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Política para admins atualizarem perfis
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
