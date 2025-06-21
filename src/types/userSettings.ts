
export interface UserSettings {
  id: string;
  user_id: string;
  company_name?: string;
  user_name?: string;
  user_oab?: string;
  contact_email?: string;
  theme?: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface UserSettingsInsert {
  user_id: string;
  company_name?: string;
  user_name?: string;
  user_oab?: string;
  contact_email?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface UserSettingsUpdate {
  company_name?: string;
  user_name?: string;
  user_oab?: string;
  contact_email?: string;
  theme?: 'light' | 'dark' | 'system';
  updated_at?: string;
}
