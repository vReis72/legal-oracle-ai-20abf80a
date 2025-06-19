
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  oab_number: string | null;
  status: 'pending' | 'active' | 'blocked' | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
  blocked_at: string | null;
  blocked_by: string | null;
  blocked_reason: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}
