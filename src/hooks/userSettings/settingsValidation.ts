
export class SettingsValidation {
  static hasValidApiKey(apiKey?: string | null): boolean {
    if (!apiKey) {
      return false;
    }

    const trimmedKey = apiKey.trim();
    
    // Validação robusta de chave OpenAI
    const isValid = trimmedKey.length > 0 && 
           trimmedKey.startsWith('sk-') && 
           trimmedKey.length >= 40 && // Chaves OpenAI têm pelo menos 40 caracteres
           trimmedKey !== 'sk-adicione-uma-chave-valida-aqui' &&
           !trimmedKey.includes('placeholder') &&
           !trimmedKey.includes('example') &&
           !trimmedKey.includes('your-api-key');

    return isValid;
  }

  static getUserName(settings: any, profile: any): string {
    return settings?.user_name || profile?.full_name || '';
  }

  static getUserEmail(settings: any, user: any): string {
    return settings?.contact_email || user?.email || '';
  }
}
