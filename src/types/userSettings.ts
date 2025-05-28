
export interface UserSettings {
  id: string;
  user_id: string;
  openai_api_key?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsInsert {
  user_id: string;
  openai_api_key?: string;
}

export interface UserSettingsUpdate {
  openai_api_key?: string;
  updated_at?: string;
}
