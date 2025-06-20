
export class SettingsValidation {
  static hasValidApiKey(apiKey?: string | null): boolean {
    if (!apiKey) {
      console.log('🔑 SettingsValidation: Chave não fornecida ou nula');
      return false;
    }

    const trimmedKey = apiKey.trim();
    
    // Validação mais robusta
    const isValid = trimmedKey.length > 0 && 
           trimmedKey.startsWith('sk-') && 
           trimmedKey.length >= 40 && // Chaves OpenAI têm pelo menos 40 caracteres
           trimmedKey !== 'sk-adicione-uma-chave-valida-aqui' &&
           !trimmedKey.includes('placeholder') &&
           !trimmedKey.includes('example');

    console.log('🔑 SettingsValidation: Validando chave:', {
      hasKey: !!apiKey,
      keyLength: trimmedKey.length,
      startsWithSk: trimmedKey.startsWith('sk-'),
      isNotPlaceholder: trimmedKey !== 'sk-adicione-uma-chave-valida-aqui',
      isValid
    });

    return isValid;
  }

  static getUserName(settings: any, profile: any): string {
    return settings?.user_name || profile?.full_name || '';
  }

  static getUserEmail(settings: any, user: any): string {
    return settings?.contact_email || user?.email || '';
  }
}
