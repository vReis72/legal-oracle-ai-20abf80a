
export interface OpenAIKeyInputProps {
  onKeySubmit?: (key: string) => void;
  forceOpen?: boolean;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}
