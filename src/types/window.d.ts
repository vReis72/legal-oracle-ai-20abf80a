
interface Window {
  env?: {
    OPENAI_API_KEY?: string;
    [key: string]: string | undefined;
  };
}
