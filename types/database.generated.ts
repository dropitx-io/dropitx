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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          share_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          share_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          share_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          reset_at: string
        }
        Insert: {
          count?: number
          key: string
          reset_at: string
        }
        Update: {
          count?: number
          key?: string
          reset_at?: string
        }
        Relationships: []
      }
      share_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          share_slug: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          share_slug: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          share_slug?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "share_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_comments_share_slug_fkey"
            columns: ["share_slug"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["slug"]
          },
        ]
      }
      share_groups: {
        Row: {
          created_at: string
          id: string
          slug: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      share_versions: {
        Row: {
          content_text: string | null
          created_at: string
          id: string
          share_slug: string
          storage_path: string | null
          version_num: number
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          id?: string
          share_slug: string
          storage_path?: string | null
          version_num: number
        }
        Update: {
          content_text?: string | null
          created_at?: string
          id?: string
          share_slug?: string
          storage_path?: string | null
          version_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "share_versions_share_slug_fkey"
            columns: ["share_slug"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["slug"]
          },
        ]
      }
      share_views: {
        Row: {
          country_code: string | null
          id: number
          is_unique: boolean | null
          referrer: string | null
          referrer_source: string | null
          share_id: string
          viewed_at: string | null
          visitor_hash: string | null
        }
        Insert: {
          country_code?: string | null
          id?: number
          is_unique?: boolean | null
          referrer?: string | null
          referrer_source?: string | null
          share_id: string
          viewed_at?: string | null
          visitor_hash?: string | null
        }
        Update: {
          country_code?: string | null
          id?: number
          is_unique?: boolean | null
          referrer?: string | null
          referrer_source?: string | null
          share_id?: string
          viewed_at?: string | null
          visitor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_views_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          burn_after_reading: boolean | null
          burned: boolean
          content_text: string | null
          created_at: string | null
          custom_slug: string | null
          delete_token: string
          download_count: number | null
          encrypted: boolean | null
          encryption_iv: string | null
          encryption_salt: string | null
          expires_at: string | null
          file_size: number | null
          filename: string
          group_id: string | null
          id: string
          is_private: boolean
          language: string | null
          max_downloads: number | null
          mime_type: string | null
          one_time_download: boolean | null
          password_hash: string | null
          search_vec: unknown
          slug: string
          source: string
          storage_path: string
          title: string | null
          updated_at: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          burn_after_reading?: boolean | null
          burned?: boolean
          content_text?: string | null
          created_at?: string | null
          custom_slug?: string | null
          delete_token: string
          download_count?: number | null
          encrypted?: boolean | null
          encryption_iv?: string | null
          encryption_salt?: string | null
          expires_at?: string | null
          file_size?: number | null
          filename: string
          group_id?: string | null
          id?: string
          is_private?: boolean
          language?: string | null
          max_downloads?: number | null
          mime_type?: string | null
          one_time_download?: boolean | null
          password_hash?: string | null
          search_vec?: unknown
          slug: string
          source?: string
          storage_path: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          burn_after_reading?: boolean | null
          burned?: boolean
          content_text?: string | null
          created_at?: string | null
          custom_slug?: string | null
          delete_token?: string
          download_count?: number | null
          encrypted?: boolean | null
          encryption_iv?: string | null
          encryption_salt?: string | null
          expires_at?: string | null
          file_size?: number | null
          filename?: string
          group_id?: string | null
          id?: string
          is_private?: boolean
          language?: string | null
          max_downloads?: number | null
          mime_type?: string | null
          one_time_download?: boolean | null
          password_hash?: string | null
          search_vec?: unknown
          slug?: string
          source?: string
          storage_path?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      team_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          target_user_id: string | null
          team_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          target_user_id?: string | null
          team_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          target_user_id?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          status: string
          team_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: string
          status?: string
          team_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          invited_at: string | null
          joined_at: string | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          invited_at?: string | null
          joined_at?: string | null
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          invited_at?: string | null
          joined_at?: string | null
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_shares: {
        Row: {
          created_at: string | null
          share_id: string
          shared_by: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          share_id: string
          shared_by: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          share_id?: string
          shared_by?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_shares_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_shares_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
          plan: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          plan?: string
          slug: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          plan?: string
          slug?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_team_invite: {
        Args: { p_token: string; p_user_email: string }
        Returns: {
          already_member: boolean
          role: string
          team_id: string
          team_slug: string
        }[]
      }
      change_member_role: {
        Args: { p_new_role: string; p_team_id: string; p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { p_key: string; p_max_attempts: number; p_window_secs: number }
        Returns: {
          remaining: number
          reset_at: string
          success: boolean
        }[]
      }
      clean_expired_invites: { Args: never; Returns: number }
      clean_old_share_views: { Args: { p_days?: number }; Returns: number }
      create_team_invite: {
        Args: { p_email: string; p_role?: string; p_team_id: string }
        Returns: {
          expires_at: string
          invite_id: string
          rate_limited: boolean
          token: string
        }[]
      }
      current_user_has_team_role: {
        Args: { p_roles: string[]; p_team_id: string }
        Returns: boolean
      }
      current_user_is_team_member: {
        Args: { p_team_id: string }
        Returns: boolean
      }
      decline_team_invite: {
        Args: { p_token: string; p_user_email: string }
        Returns: {
          declined: boolean
          team_id: string
          team_slug: string
        }[]
      }
      emit_team_event: {
        Args: {
          p_actor_id: string
          p_event_type: string
          p_metadata?: Json
          p_target_user_id?: string
          p_team_id: string
        }
        Returns: string
      }
      get_share_analytics: {
        Args: { p_days?: number; p_share_id: string }
        Returns: {
          avg_daily_views: number
          total_views: number
          unique_views: number
          views_7d: number
          views_today: number
        }[]
      }
      get_share_geo: {
        Args: { p_days?: number; p_limit?: number; p_share_id: string }
        Returns: {
          country_code: string
          views: number
        }[]
      }
      get_share_referrers: {
        Args: { p_days?: number; p_limit?: number; p_share_id: string }
        Returns: {
          referrer_source: string
          views: number
        }[]
      }
      get_share_view_timeseries: {
        Args: { p_days?: number; p_share_id: string }
        Returns: {
          date: string
          unique_views: number
          views: number
        }[]
      }
      get_team_role: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: string
      }
      get_user_top_shares: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          share_id: string
          slug: string
          title: string
          total_views: number
          unique_views: number
        }[]
      }
      has_min_team_role: {
        Args: { p_min_role: string; p_team_id: string; p_user_id: string }
        Returns: boolean
      }
      increment_view_count: { Args: { share_slug: string }; Returns: number }
      record_and_increment_share_view: {
        Args: {
          p_country_code?: string
          p_referrer?: string
          p_referrer_source?: string
          p_share_slug: string
          p_visitor_hash?: string
        }
        Returns: {
          id: number
          is_unique: boolean
          share_id: string
          tracking_token: string
        }[]
      }
      remove_team_member: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: boolean
      }
      revoke_team_invite: { Args: { p_invite_id: string }; Returns: boolean }
      search_shares: {
        Args: {
          query_term: string
          result_limit?: number
          result_offset?: number
        }
        Returns: {
          created_at: string
          expires_at: string
          filename: string
          rank: number
          slug: string
          snippet: string
          view_count: number
        }[]
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
