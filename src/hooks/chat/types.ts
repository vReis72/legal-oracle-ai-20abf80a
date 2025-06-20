
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
}
