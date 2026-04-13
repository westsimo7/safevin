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
      analyses: {
        Row: {
          analysis_result: Json
          analysis_type: string
          brand: string
          categoria: string
          colore: string
          condizioni: string
          created_at: string
          descrizione: string
          first_image_url: string | null
          id: string
          origin: string
          prezzo: string
          studio_creation_id: string | null
          taglia: string
          tempo_caricamento: string
          titolo: string
          user_id: string | null
        }
        Insert: {
          analysis_result: Json
          analysis_type?: string
          brand?: string
          categoria?: string
          colore?: string
          condizioni?: string
          created_at?: string
          descrizione?: string
          first_image_url?: string | null
          id?: string
          origin?: string
          prezzo?: string
          studio_creation_id?: string | null
          taglia?: string
          tempo_caricamento?: string
          titolo?: string
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          brand?: string
          categoria?: string
          colore?: string
          condizioni?: string
          created_at?: string
          descrizione?: string
          first_image_url?: string | null
          id?: string
          origin?: string
          prezzo?: string
          studio_creation_id?: string | null
          taglia?: string
          tempo_caricamento?: string
          titolo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_studio_creation_id_fkey"
            columns: ["studio_creation_id"]
            isOneToOne: false
            referencedRelation: "studio_creations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cognome: string
          created_at: string
          email: string
          id: string
          nome: string
          telefono: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cognome?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefono?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cognome?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefono?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      studio_creations: {
        Row: {
          categoria: string
          created_at: string
          first_image_url: string | null
          id: string
          images: Json
          incomplete_data: Json | null
          incomplete_phase: string | null
          keyword_list: Json | null
          origin: string
          output: Json | null
          questions_answers: Json
          semantic_fingerprint: string | null
          status: string
          structural_blocks: Json | null
          studio_version: string
          titolo_generato: string | null
          user_id: string | null
          vision_report: string | null
        }
        Insert: {
          categoria?: string
          created_at?: string
          first_image_url?: string | null
          id?: string
          images?: Json
          incomplete_data?: Json | null
          incomplete_phase?: string | null
          keyword_list?: Json | null
          origin?: string
          output?: Json | null
          questions_answers?: Json
          semantic_fingerprint?: string | null
          status?: string
          structural_blocks?: Json | null
          studio_version?: string
          titolo_generato?: string | null
          user_id?: string | null
          vision_report?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string
          first_image_url?: string | null
          id?: string
          images?: Json
          incomplete_data?: Json | null
          incomplete_phase?: string | null
          keyword_list?: Json | null
          origin?: string
          output?: Json | null
          questions_answers?: Json
          semantic_fingerprint?: string | null
          status?: string
          structural_blocks?: Json | null
          studio_version?: string
          titolo_generato?: string | null
          user_id?: string | null
          vision_report?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
