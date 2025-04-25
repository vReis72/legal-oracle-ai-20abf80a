export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      crypto_exchanges: {
        Row: {
          api_docs_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          api_docs_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          api_docs_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          admin: boolean
          aprovado: boolean
          cargo: string
          id: string
          nome: string
        }
        Insert: {
          admin?: boolean
          aprovado?: boolean
          cargo: string
          id: string
          nome: string
        }
        Update: {
          admin?: boolean
          aprovado?: boolean
          cargo?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      trading_bots: {
        Row: {
          coin_id: string
          coin_name: string
          created_at: string | null
          deposit_amount: number
          exchange_integration_id: string | null
          id: string
          initial_investment: number
          interval: string
          investment_profile: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          number_of_deposits: number
          profit: number | null
          strategy: string
          total_invested: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coin_id: string
          coin_name: string
          created_at?: string | null
          deposit_amount: number
          exchange_integration_id?: string | null
          id?: string
          initial_investment: number
          interval: string
          investment_profile: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          number_of_deposits: number
          profit?: number | null
          strategy: string
          total_invested: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coin_id?: string
          coin_name?: string
          created_at?: string | null
          deposit_amount?: number
          exchange_integration_id?: string | null
          id?: string
          initial_investment?: number
          interval?: string
          investment_profile?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          number_of_deposits?: number
          profit?: number | null
          strategy?: string
          total_invested?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_bots_exchange_integration_id_fkey"
            columns: ["exchange_integration_id"]
            isOneToOne: false
            referencedRelation: "user_exchange_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_history: {
        Row: {
          action: string
          amount: number
          bot_id: string
          coin_id: string
          coin_name: string
          error_message: string | null
          id: string
          price: number
          status: string | null
          timestamp: string | null
          transaction_id: string | null
        }
        Insert: {
          action: string
          amount: number
          bot_id: string
          coin_id: string
          coin_name: string
          error_message?: string | null
          id?: string
          price: number
          status?: string | null
          timestamp?: string | null
          transaction_id?: string | null
        }
        Update: {
          action?: string
          amount?: number
          bot_id?: string
          coin_id?: string
          coin_name?: string
          error_message?: string | null
          id?: string
          price?: number
          status?: string | null
          timestamp?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_history_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "trading_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exchange_integrations: {
        Row: {
          api_key: string
          api_secret: string
          created_at: string | null
          exchange_id: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          api_secret: string
          created_at?: string | null
          exchange_id: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          api_secret?: string
          created_at?: string | null
          exchange_id?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exchange_integrations_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "crypto_exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_auto_confirm_email_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_auto_confirm_email_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_handle_new_user_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_on_auth_user_created_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
