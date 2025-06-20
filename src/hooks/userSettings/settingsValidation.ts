
export class SettingsValidation {
  static hasValidApiKey(apiKey?: string | null): boolean {
    console.log('🔑 SettingsValidation: Validando chave API:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length,
      startsWithSk: apiKey?.startsWith('sk-'),
      isNotPlaceholder: apiKey !== 'sk-adicione-uma-chave-valida-aqui'
    });

    const isValid = apiKey !== null && 
           apiKey !== undefined &&
           apiKey.trim() !== '' && 
           apiKey.startsWith('sk-') && 
           apiKey.length > 20 &&
           apiKey !== 'sk-adicione-uma-chave-valida-aqui';

    console.log('🔑 SettingsValidation: Resultado da validação:', isValid);
    return isValid;
  }

  static getUserName(settings: any, profile: any): string {
    return settings?.user_name || profile?.full_name || '';
  }

  static getUserEmail(settings: any, user: any): string {
    return settings?.contact_email || user?.email || '';
  }
}
