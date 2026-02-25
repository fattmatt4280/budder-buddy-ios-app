export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      photos: {
        Row: {
          caption: string | null
          created_at: string
          day_number: number
          id: string
          photo_date: string
          storage_path: string
          tattoo_id: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          day_number: number
          id?: string
          photo_date?: string
          storage_path: string
          tattoo_id: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          day_number?: number
          id?: string
          photo_date?: string
          storage_path?: string
          tattoo_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          apple_original_transaction_id: string | null
          apple_transaction_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          original_purchase_date: string | null
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apple_original_transaction_id?: string | null
          apple_transaction_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          original_purchase_date?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apple_original_transaction_id?: string | null
          apple_transaction_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          original_purchase_date?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tattoo_wishlist: {
        Row: {
          artist_name: string | null
          body_location: string | null
          budget: number | null
          created_at: string
          id: string
          notes: string | null
          reference_url: string | null
          shop_name: string | null
          sort_order: number
          style: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name?: string | null
          body_location?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          reference_url?: string | null
          shop_name?: string | null
          sort_order?: number
          style?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string | null
          body_location?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          reference_url?: string | null
          shop_name?: string | null
          sort_order?: number
          style?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_checkins: {
        Row: {
          checkin_date: string
          checklist: Json
          created_at: string | null
          day_number: number
          id: string
          observations: string[] | null
          tattoo_local_id: string
          user_id: string
          user_notes: string | null
        }
        Insert: {
          checkin_date: string
          checklist: Json
          created_at?: string | null
          day_number: number
          id?: string
          observations?: string[] | null
          tattoo_local_id: string
          user_id: string
          user_notes?: string | null
        }
        Update: {
          checkin_date?: string
          checklist?: Json
          created_at?: string | null
          day_number?: number
          id?: string
          observations?: string[] | null
          tattoo_local_id?: string
          user_id?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tattoos: {
        Row: {
          artist_name: string | null
          body_location: string
          created_at: string | null
          healed_date: string | null
          id: string
          ink_type: string
          is_healed: boolean | null
          local_id: string
          name: string | null
          notes: string | null
          referred_by_artist_code: string | null
          shop_name: string | null
          size_tier: string
          tattoo_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artist_name?: string | null
          body_location: string
          created_at?: string | null
          healed_date?: string | null
          id?: string
          ink_type: string
          is_healed?: boolean | null
          local_id: string
          name?: string | null
          notes?: string | null
          referred_by_artist_code?: string | null
          shop_name?: string | null
          size_tier: string
          tattoo_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artist_name?: string | null
          body_location?: string
          created_at?: string | null
          healed_date?: string | null
          id?: string
          ink_type?: string
          is_healed?: boolean | null
          local_id?: string
          name?: string | null
          notes?: string | null
          referred_by_artist_code?: string | null
          shop_name?: string | null
          size_tier?: string
          tattoo_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
