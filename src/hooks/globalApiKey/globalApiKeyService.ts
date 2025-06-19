
import { supabase } from '@/integrations/supabase/client';

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testando conexão com Supabase...');
    const { data, error } = await supabase.from('system_settings').select('count').limit(1);
    if (error) {
      console.error('Erro de conexão com Supabase:', error);
      return false;
    }
    console.log('Conexão com Supabase OK');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
};

export const fetchGlobalApiKeyFromDb = async (): Promise<string | null> => {
  console.log('Buscando chave global do banco...');
  
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar chave global:', error);
    if (error.code === '42P01') {
      console.log('Tabela system_settings não existe');
    }
    return null;
  }

  const apiKey = data?.openai_api_key || null;
  console.log('Chave global encontrada:', apiKey ? 'SIM' : 'NÃO');
  return apiKey;
};

export const saveGlobalApiKeyToDb = async (key: string, userId: string): Promise<boolean> => {
  console.log('Salvando chave global...');
  
  const { data: existing } = await supabase
    .from('system_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  let result;
  
  if (existing) {
    result = await supabase
      .from('system_settings')
      .update({
        openai_api_key: key,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    result = await supabase
      .from('system_settings')
      .insert({
        openai_api_key: key,
        updated_by: userId
      });
  }

  if (result.error) {
    console.error('Erro ao salvar chave global:', result.error);
    return false;
  }

  console.log('Chave global salva com sucesso');
  return true;
};
