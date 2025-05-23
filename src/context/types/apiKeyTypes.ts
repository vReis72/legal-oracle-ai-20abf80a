
export interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isKeyConfigured: boolean;
  checkApiKey: () => boolean;
  resetApiKey: () => void;
  isPlaceholderKey: boolean;
  isEnvironmentKey: boolean;
}
