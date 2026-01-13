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
      call_history: {
        Row: {
          call_id: string
          call_type: string
          callee_id: string
          caller_id: string
          conversation_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          call_id: string
          call_type?: string
          callee_id: string
          caller_id: string
          conversation_id: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status: string
        }
        Update: {
          call_id?: string
          call_type?: string
          callee_id?: string
          caller_id?: string
          conversation_id?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_history_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "video_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant1_id: string
          participant2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id: string
          participant2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id?: string
          participant2_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          is_super_like: boolean | null
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          is_super_like?: boolean | null
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          is_super_like?: boolean | null
          to_user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          matched_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          id?: string
          matched_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          id?: string
          matched_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          media_type: string | null
          media_url: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          conversation_id: string | null
          created_at: string
          description: string
          from_user_id: string | null
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          description: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          description?: string
          from_user_id?: string | null
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      preferences: {
        Row: {
          created_at: string
          exclude_gotra: boolean | null
          gotra: string | null
          id: string
          max_age: number | null
          min_age: number | null
          preferred_communities: string[] | null
          preferred_dietary: string[] | null
          preferred_gender: string | null
          preferred_locations: string[] | null
          preferred_sects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exclude_gotra?: boolean | null
          gotra?: string | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          preferred_communities?: string[] | null
          preferred_dietary?: string[] | null
          preferred_gender?: string | null
          preferred_locations?: string[] | null
          preferred_sects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exclude_gotra?: boolean | null
          gotra?: string | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          preferred_communities?: string[] | null
          preferred_dietary?: string[] | null
          preferred_gender?: string | null
          preferred_locations?: string[] | null
          preferred_sects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          chauvihar_level: string | null
          community: string | null
          created_at: string
          date_of_birth: string | null
          dietary_preference: string | null
          education: string | null
          email: string | null
          gender: string | null
          gotra: string | null
          height: string | null
          id: string
          interests: string[] | null
          is_verified: boolean | null
          jain_rating: number | null
          location: string | null
          main_photo_index: number | null
          name: string
          occupation: string | null
          onboarding_completed: boolean | null
          password_updated_at: string | null
          photos: string[] | null
          prompts: Json | null
          sect: string | null
          temple_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          chauvihar_level?: string | null
          community?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preference?: string | null
          education?: string | null
          email?: string | null
          gender?: string | null
          gotra?: string | null
          height?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          jain_rating?: number | null
          location?: string | null
          main_photo_index?: number | null
          name: string
          occupation?: string | null
          onboarding_completed?: boolean | null
          password_updated_at?: string | null
          photos?: string[] | null
          prompts?: Json | null
          sect?: string | null
          temple_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          chauvihar_level?: string | null
          community?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preference?: string | null
          education?: string | null
          email?: string | null
          gender?: string | null
          gotra?: string | null
          height?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          jain_rating?: number | null
          location?: string | null
          main_photo_index?: number | null
          name?: string
          occupation?: string | null
          onboarding_completed?: boolean | null
          password_updated_at?: string | null
          photos?: string[] | null
          prompts?: Json | null
          sect?: string | null
          temple_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      saved_profiles: {
        Row: {
          created_at: string
          id: string
          saved_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          saved_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          saved_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      skipped_profiles: {
        Row: {
          created_at: string
          id: string
          skipped_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skipped_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skipped_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      video_calls: {
        Row: {
          answer: Json | null
          call_type: string | null
          callee_id: string
          caller_id: string
          conversation_id: string
          created_at: string
          ended_at: string | null
          ice_candidates: Json[] | null
          id: string
          offer: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          answer?: Json | null
          call_type?: string | null
          callee_id: string
          caller_id: string
          conversation_id: string
          created_at?: string
          ended_at?: string | null
          ice_candidates?: Json[] | null
          id?: string
          offer?: Json | null
          started_at?: string | null
          status: string
        }
        Update: {
          answer?: Json | null
          call_type?: string | null
          callee_id?: string
          caller_id?: string
          conversation_id?: string
          created_at?: string
          ended_at?: string | null
          ice_candidates?: Json[] | null
          id?: string
          offer?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_match_score: {
        Args: { target_id: string; viewer_id: string }
        Returns: number
      }
      get_recommended_profiles: {
        Args: { current_user_id: string; limit_count?: number }
        Returns: {
          bio: string
          date_of_birth: string
          dietary_preference: string
          education: string
          gender: string
          interests: string[]
          is_verified: boolean
          jain_rating: number
          location: string
          match_score: number
          name: string
          occupation: string
          photos: string[]
          profile_id: string
          prompts: Json
          sect: string
          user_id: string
        }[]
      }
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
