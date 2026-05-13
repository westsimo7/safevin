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
      bundle_purchases: {
        Row: {
          created_at: string
          quantity: number
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          quantity: number
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          quantity?: number
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      collaboration_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collaboration_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "collaboration_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_director_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creative_director_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_director_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "creative_director_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      device_login_history: {
        Row: {
          created_at: string
          device_fingerprint: string
          email: string | null
          id: string
          ip_address: string | null
          outcome: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          email?: string | null
          id?: string
          ip_address?: string | null
          outcome: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          email?: string | null
          id?: string
          ip_address?: string | null
          outcome?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      device_registrations: {
        Row: {
          device_fingerprint: string
          first_seen_at: string
          ip_address: string | null
          last_seen_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          device_fingerprint: string
          first_seen_at?: string
          ip_address?: string | null
          last_seen_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          device_fingerprint?: string
          first_seen_at?: string
          ip_address?: string | null
          last_seen_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_notification_state: {
        Row: {
          conversation_id: string
          conversation_type: string
          id: string
          last_notified_at: string
        }
        Insert: {
          conversation_id: string
          conversation_type: string
          id?: string
          last_notified_at?: string
        }
        Update: {
          conversation_id?: string
          conversation_type?: string
          id?: string
          last_notified_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
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
          avatar_url?: string | null
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
          avatar_url?: string | null
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
      purchase_gift_claims: {
        Row: {
          claimed_at: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
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
      support_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      upgrade_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upgrade_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upgrade_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "upgrade_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          bonus_credits: number
          created_at: string
          creative_director_used: number
          credits_total: number
          credits_used: number
          current_period_end: string
          current_period_start: string
          id: string
          period_end: string
          period_start: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          plan_type: string
          studio_used: number
          user_id: string
        }
        Insert: {
          bonus_credits?: number
          created_at?: string
          creative_director_used?: number
          credits_total?: number
          credits_used?: number
          current_period_end?: string
          current_period_start?: string
          id?: string
          period_end?: string
          period_start?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_type?: string
          studio_used?: number
          user_id: string
        }
        Update: {
          bonus_credits?: number
          created_at?: string
          creative_director_used?: number
          credits_total?: number
          credits_used?: number
          current_period_end?: string
          current_period_start?: string
          id?: string
          period_end?: string
          period_start?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_type?: string
          studio_used?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_purchase_gift: { Args: never; Returns: Json }
      cleanup_test_users: { Args: never; Returns: number }
      complete_creative_director_job: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      compute_period_for_plan: {
        Args: { p_plan: Database["public"]["Enums"]["subscription_plan"] }
        Returns: {
          period_end: string
          period_start: string
        }[]
      }
      consume_feature_credit: { Args: { p_feature: string }; Returns: Json }
      credit_bundle_purchase: {
        Args: { p_quantity: number; p_session_id: string; p_user_id: string }
        Returns: Json
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_user_credits: {
        Args: { p_user_id: string }
        Returns: {
          bonus_credits: number
          created_at: string
          creative_director_used: number
          credits_total: number
          credits_used: number
          current_period_end: string
          current_period_start: string
          id: string
          period_end: string
          period_start: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          plan_type: string
          studio_used: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_all_users_admin: {
        Args: never
        Returns: {
          analysis_count: number
          cd_limit: number
          cd_used: number
          cognome: string
          created_at: string
          email: string
          nome: string
          plan: string
          role: string
          studio_count: number
          studio_limit: number
          studio_used: number
          telefono: string
          user_id: string
        }[]
      }
      get_free_effective_limit: { Args: { p_user_id: string }; Returns: Json }
      get_plan_limits: {
        Args: { p_plan: Database["public"]["Enums"]["subscription_plan"] }
        Returns: Json
      }
      get_purchase_gift_status: { Args: never; Returns: Json }
      get_user_plan: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invoke_send_transactional_email: {
        Args: {
          p_idempotency_key: string
          p_recipient_email: string
          p_template_data?: Json
          p_template_name: string
        }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      notify_user_on_founder_reply: {
        Args: {
          p_chat_label: string
          p_chat_url: string
          p_conversation_id: string
          p_conversation_type: string
          p_recipient_user_id: string
        }
        Returns: undefined
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      recount_studio_used: { Args: { p_user_id: string }; Returns: undefined }
      register_or_check_device: {
        Args: { p_fingerprint: string; p_ip?: string; p_user_agent?: string }
        Returns: Json
      }
      set_user_plan: {
        Args: {
          p_new_plan: Database["public"]["Enums"]["subscription_plan"]
          p_target_user: string
        }
        Returns: Json
      }
      sync_user_plan_from_payment: {
        Args: {
          p_new_plan: Database["public"]["Enums"]["subscription_plan"]
          p_user_id: string
        }
        Returns: Json
      }
      test_age_test_user: {
        Args: { p_days: number; p_user_id: string }
        Returns: undefined
      }
      test_delete_studio_creation: {
        Args: { p_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "founder" | "admin" | "user"
      subscription_plan: "free" | "starter" | "pro" | "expert"
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
      app_role: ["founder", "admin", "user"],
      subscription_plan: ["free", "starter", "pro", "expert"],
    },
  },
} as const
