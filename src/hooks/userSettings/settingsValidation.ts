
export class SettingsValidation {
  static hasValidApiKey(apiKey?: string | null): boolean {
    if (!apiKey) {
      console.log('🔑 SettingsValidation: Chave não fornecida ou nula');
      return false;
    }

    const trimmedKey = apiKey.trim();
    const isValid = trimmedKey !== '' && 
           trimmedKey.startsWith('sk-') && 
           trimmedKey.length > 20 &&
           trimmedKey !== 'sk-adicione-uma-chave-valida-aqui';

    console.log('🔑 SettingsValidation: Validando chave:', {
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
