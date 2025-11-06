export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      additional_services: {
        Row: {
          availability: Database["public"]["Enums"]["service_availability"]
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          max_quantity: number | null
          min_quantity: number
          name: string
          org_id: string
          price_cents: number
          price_type: Database["public"]["Enums"]["service_price_type"]
          requires_approval: boolean
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["service_availability"]
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_quantity?: number | null
          min_quantity?: number
          name: string
          org_id: string
          price_cents: number
          price_type: Database["public"]["Enums"]["service_price_type"]
          requires_approval?: boolean
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["service_availability"]
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_quantity?: number | null
          min_quantity?: number
          name?: string
          org_id?: string
          price_cents?: number
          price_type?: Database["public"]["Enums"]["service_price_type"]
          requires_approval?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "additional_services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string
          id: string
          org_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id: string
          id?: string
          org_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string
          id?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          capacity: number
          created_at: string
          day_of_week: number | null
          ends_at: string | null
          ends_time: string | null
          facility_id: string
          id: string
          org_id: string
          recurring: boolean
          starts_at: string | null
          starts_time: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string
          day_of_week?: number | null
          ends_at?: string | null
          ends_time?: string | null
          facility_id: string
          id?: string
          org_id: string
          recurring?: boolean
          starts_at?: string | null
          starts_time?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string
          day_of_week?: number | null
          ends_at?: string | null
          ends_time?: string | null
          facility_id?: string
          id?: string
          org_id?: string
          recurring?: boolean
          starts_at?: string | null
          starts_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      blackouts: {
        Row: {
          created_at: string
          ends_at: string
          facility_id: string
          id: string
          org_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          facility_id: string
          id?: string
          org_id: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          facility_id?: string
          id?: string
          org_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blackouts_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blackouts_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blackouts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_additional_services: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string
          created_at: string
          currency: string
          id: string
          notes: string | null
          price_cents: number
          quantity: number
          service_id: string
          status: string
          total_price_cents: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          price_cents: number
          quantity?: number
          service_id: string
          status?: string
          total_price_cents: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          price_cents?: number
          quantity?: number
          service_id?: string
          status?: string
          total_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_additional_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_additional_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "additional_services"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_group_invitations: {
        Row: {
          email: string
          expires_at: string
          group_id: string
          id: string
          invited_at: string
          invited_by: string
          responded_at: string | null
          status: string
        }
        Insert: {
          email: string
          expires_at?: string
          group_id: string
          id?: string
          invited_at?: string
          invited_by: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          email?: string
          expires_at?: string
          group_id?: string
          id?: string
          invited_at?: string
          invited_by?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "booking_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_group_members: {
        Row: {
          booking_count: number
          group_id: string
          is_active: boolean
          joined_at: string
          last_active_at: string | null
          role: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Insert: {
          booking_count?: number
          group_id: string
          is_active?: boolean
          joined_at?: string
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Update: {
          booking_count?: number
          group_id?: string
          is_active?: boolean
          joined_at?: string
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["group_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "booking_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_groups: {
        Row: {
          allow_member_bookings: boolean
          created_at: string
          description: string | null
          id: string
          max_bookings_per_member: number
          name: string
          notify_cancellations: boolean
          notify_member_changes: boolean
          notify_new_bookings: boolean
          org_id: string
          owner_id: string
          require_approval: boolean
          updated_at: string
        }
        Insert: {
          allow_member_bookings?: boolean
          created_at?: string
          description?: string | null
          id?: string
          max_bookings_per_member?: number
          name: string
          notify_cancellations?: boolean
          notify_member_changes?: boolean
          notify_new_bookings?: boolean
          org_id: string
          owner_id: string
          require_approval?: boolean
          updated_at?: string
        }
        Update: {
          allow_member_bookings?: boolean
          created_at?: string
          description?: string | null
          id?: string
          max_bookings_per_member?: number
          name?: string
          notify_cancellations?: boolean
          notify_member_changes?: boolean
          notify_new_bookings?: boolean
          org_id?: string
          owner_id?: string
          require_approval?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_groups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          currency: string
          ends_at: string
          facility_id: string
          group_id: string | null
          id: string
          is_recurring: boolean
          notes: string | null
          org_id: string
          price_breakdown: Json | null
          recurring_booking_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          total_cents: number
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          ends_at: string
          facility_id: string
          group_id?: string | null
          id?: string
          is_recurring?: boolean
          notes?: string | null
          org_id: string
          price_breakdown?: Json | null
          recurring_booking_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cents: number
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          ends_at?: string
          facility_id?: string
          group_id?: string | null
          id?: string
          is_recurring?: boolean
          notes?: string | null
          org_id?: string
          price_breakdown?: Json | null
          recurring_booking_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cents?: number
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "booking_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_recurring_booking_id_fkey"
            columns: ["recurring_booking_id"]
            isOneToOne: false
            referencedRelation: "recurring_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      error_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload: Json | null
          ref: string | null
          retry_after: string | null
          scope: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          ref?: string | null
          retry_after?: string | null
          scope: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          ref?: string | null
          retry_after?: string | null
          scope?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          accessibility_features: Json | null
          address: string | null
          amenities: Json | null
          area_description: string | null
          capacity: number
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          facility_type: string
          id: string
          images: Json | null
          location: unknown
          name: string
          org_id: string
          postal_code: string | null
          rating: number | null
          review_count: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          accessibility_features?: Json | null
          address?: string | null
          amenities?: Json | null
          area_description?: string | null
          capacity: number
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          facility_type: string
          id?: string
          images?: Json | null
          location?: unknown
          name: string
          org_id: string
          postal_code?: string | null
          rating?: number | null
          review_count?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accessibility_features?: Json | null
          address?: string | null
          amenities?: Json | null
          area_description?: string | null
          capacity?: number
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          facility_type?: string
          id?: string
          images?: Json | null
          location?: unknown
          name?: string
          org_id?: string
          postal_code?: string | null
          rating?: number | null
          review_count?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_additional_services: {
        Row: {
          created_at: string
          facility_id: string
          is_included: boolean
          override_availability:
            | Database["public"]["Enums"]["service_availability"]
            | null
          override_price_cents: number | null
          service_id: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          is_included?: boolean
          override_availability?:
            | Database["public"]["Enums"]["service_availability"]
            | null
          override_price_cents?: number | null
          service_id: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          is_included?: boolean
          override_availability?:
            | Database["public"]["Enums"]["service_availability"]
            | null
          override_price_cents?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_additional_services_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_additional_services_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_additional_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "additional_services"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_availability: {
        Row: {
          created_at: string
          day_of_week: number
          ends_time: string
          facility_id: string
          id: string
          starts_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          ends_time: string
          facility_id: string
          id?: string
          starts_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          ends_time?: string
          facility_id?: string
          id?: string
          starts_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_availability_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_availability_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_tags: {
        Row: {
          facility_id: string
          tag_id: string
        }
        Insert: {
          facility_id: string
          tag_id: string
        }
        Update: {
          facility_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_tags_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_tags_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          facility_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      group_booking_cost_shares: {
        Row: {
          group_booking_id: string
          paid: boolean
          paid_at: string | null
          payment_id: string | null
          share_cents: number
          user_id: string
        }
        Insert: {
          group_booking_id: string
          paid?: boolean
          paid_at?: string | null
          payment_id?: string | null
          share_cents: number
          user_id: string
        }
        Update: {
          group_booking_id?: string
          paid?: boolean
          paid_at?: string | null
          payment_id?: string | null
          share_cents?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_booking_cost_shares_group_booking_id_fkey"
            columns: ["group_booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_booking_cost_shares_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      group_bookings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string
          cost_per_member_cents: number
          created_at: string
          created_by: string
          currency: string
          group_id: string
          id: string
          rejection_reason: string | null
          requires_approval: boolean
          total_cost_cents: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id: string
          cost_per_member_cents: number
          created_at?: string
          created_by: string
          currency?: string
          group_id: string
          id?: string
          rejection_reason?: string | null
          requires_approval?: boolean
          total_cost_cents: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          cost_per_member_cents?: number
          created_at?: string
          created_by?: string
          currency?: string
          group_id?: string
          id?: string
          rejection_reason?: string | null
          requires_approval?: boolean
          total_cost_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_bookings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "booking_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          file_name: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string
          variables: string[]
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string
          variables?: string[]
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string
          variables?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_thread_participants: {
        Row: {
          is_active: boolean
          joined_at: string
          last_read_at: string | null
          participant_type: string
          thread_id: string
          user_id: string
        }
        Insert: {
          is_active?: boolean
          joined_at?: string
          last_read_at?: string | null
          participant_type: string
          thread_id: string
          user_id: string
        }
        Update: {
          is_active?: boolean
          joined_at?: string
          last_read_at?: string | null
          participant_type?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          org_id: string
          priority: string
          related_booking_id: string | null
          related_facility_id: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          org_id: string
          priority?: string
          related_booking_id?: string | null
          related_facility_id?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          org_id?: string
          priority?: string
          related_booking_id?: string | null
          related_facility_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_related_facility_id_fkey"
            columns: ["related_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_related_facility_id_fkey"
            columns: ["related_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          sender_type: string
          status: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          sender_type: string
          status?: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          status?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_log: {
        Row: {
          attempted_at: string
          channel: string
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_id: string
          status: string
        }
        Insert: {
          attempted_at?: string
          channel: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id: string
          status: string
        }
        Update: {
          attempted_at?: string
          channel?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          clicked_at: string | null
          created_at: string
          dismissed_at: string | null
          id: string
          image_url: string | null
          meta: Json | null
          metadata: Json | null
          notification_type: string | null
          priority: string
          read_at: string | null
          send_at: string
          sent_at: string | null
          subject: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          clicked_at?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          image_url?: string | null
          meta?: Json | null
          metadata?: Json | null
          notification_type?: string | null
          priority?: string
          read_at?: string | null
          send_at?: string
          sent_at?: string | null
          subject: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          clicked_at?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          image_url?: string | null
          meta?: Json | null
          metadata?: Json | null
          notification_type?: string | null
          priority?: string
          read_at?: string | null
          send_at?: string
          sent_at?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          intent_id: string
          provider: string
          raw: Json | null
          status: string
        }
        Insert: {
          amount_cents: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          intent_id: string
          provider: string
          raw?: Json | null
          status: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          intent_id?: string
          provider?: string
          raw?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string
          currency: string
          facility_id: string
          id: string
          min_hours: number
          org_id: string
          peak_ends: string | null
          peak_multiplier: number
          peak_starts: string | null
          price_per_hour_cents: number
          weekend_multiplier: number
          zone_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          facility_id: string
          id?: string
          min_hours?: number
          org_id: string
          peak_ends?: string | null
          peak_multiplier?: number
          peak_starts?: string | null
          price_per_hour_cents: number
          weekend_multiplier?: number
          zone_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          facility_id?: string
          id?: string
          min_hours?: number
          org_id?: string
          peak_ends?: string | null
          peak_multiplier?: number
          peak_starts?: string | null
          price_per_hour_cents?: number
          weekend_multiplier?: number
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          default_org: string | null
          display_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_org?: string | null
          display_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_org?: string | null
          display_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_org_fkey"
            columns: ["default_org"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_booking_occurrences: {
        Row: {
          booking_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          currency: string
          id: string
          occurrence_date: string
          price_cents: number
          recurring_booking_id: string
          status: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          occurrence_date: string
          price_cents: number
          recurring_booking_id: string
          status?: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          occurrence_date?: string
          price_cents?: number
          recurring_booking_id?: string
          status?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_booking_occurrences_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_booking_occurrences_recurring_booking_id_fkey"
            columns: ["recurring_booking_id"]
            isOneToOne: false
            referencedRelation: "recurring_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_bookings: {
        Row: {
          activity_type: string
          actor_type: string
          additional_info: string | null
          attendees: number
          base_price_cents: number
          created_at: string
          currency: string
          discount_cents: number
          ends_date: string | null
          facility_id: string
          id: string
          max_occurrences: number | null
          org_id: string
          purpose: string
          recurrence_day_of_month: number | null
          recurrence_days: number[]
          recurrence_frequency: Database["public"]["Enums"]["recurrence_frequency"]
          recurrence_interval: number
          starts_date: string
          status: string
          time_slots: Json
          total_price_cents: number
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          activity_type: string
          actor_type: string
          additional_info?: string | null
          attendees?: number
          base_price_cents: number
          created_at?: string
          currency?: string
          discount_cents?: number
          ends_date?: string | null
          facility_id: string
          id?: string
          max_occurrences?: number | null
          org_id: string
          purpose: string
          recurrence_day_of_month?: number | null
          recurrence_days?: number[]
          recurrence_frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          recurrence_interval?: number
          starts_date: string
          status?: string
          time_slots: Json
          total_price_cents: number
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          activity_type?: string
          actor_type?: string
          additional_info?: string | null
          attendees?: number
          base_price_cents?: number
          created_at?: string
          currency?: string
          discount_cents?: number
          ends_date?: string | null
          facility_id?: string
          id?: string
          max_occurrences?: number | null
          org_id?: string
          purpose?: string
          recurrence_day_of_month?: number | null
          recurrence_days?: number[]
          recurrence_frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          recurrence_interval?: number
          starts_date?: string
          status?: string
          time_slots?: Json
          total_price_cents?: number
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_bookings_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          facility_id: string
          id: string
          org_id: string
          rating: number
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          facility_id: string
          id?: string
          org_id: string
          rating: number
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          facility_id?: string
          id?: string
          org_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      support_ticket_activity: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_activity_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_attachments: {
        Row: {
          file_name: string
          file_size: number
          file_type: string
          id: string
          reply_id: string | null
          storage_path: string
          ticket_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: string
          id?: string
          reply_id?: string | null
          storage_path: string
          ticket_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          reply_id?: string | null
          storage_path?: string
          ticket_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "support_ticket_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_replies: {
        Row: {
          author_id: string
          author_type: string
          content: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id: string
          author_type: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          author_type?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_sla: {
        Row: {
          breach_count: number
          created_at: string
          first_response_at: string | null
          is_breached: boolean
          resolution_due_at: string
          response_due_at: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          breach_count?: number
          created_at?: string
          first_response_at?: string | null
          is_breached?: boolean
          resolution_due_at: string
          response_due_at: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          breach_count?: number
          created_at?: string
          first_response_at?: string | null
          is_breached?: boolean
          resolution_due_at?: string
          response_due_at?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_sla_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string
          description: string
          id: string
          org_id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          related_booking_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description: string
          id?: string
          org_id: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          related_booking_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          org_id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          related_booking_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          booking_reminder_hours: number
          browser_booking_reminder: boolean
          browser_enabled: boolean
          browser_group_activity: boolean
          browser_messages: boolean
          created_at: string
          daily_digest: boolean
          digest_day: number | null
          digest_time: string | null
          email_booking_cancellation: boolean
          email_booking_changes: boolean
          email_booking_confirmation: boolean
          email_booking_reminder: boolean
          email_group_activity: boolean
          email_group_invitations: boolean
          email_marketing: boolean
          email_messages: boolean
          email_system_updates: boolean
          sms_booking_confirmation: boolean
          sms_booking_reminder: boolean
          sms_enabled: boolean
          sms_urgent_only: boolean
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          booking_reminder_hours?: number
          browser_booking_reminder?: boolean
          browser_enabled?: boolean
          browser_group_activity?: boolean
          browser_messages?: boolean
          created_at?: string
          daily_digest?: boolean
          digest_day?: number | null
          digest_time?: string | null
          email_booking_cancellation?: boolean
          email_booking_changes?: boolean
          email_booking_confirmation?: boolean
          email_booking_reminder?: boolean
          email_group_activity?: boolean
          email_group_invitations?: boolean
          email_marketing?: boolean
          email_messages?: boolean
          email_system_updates?: boolean
          sms_booking_confirmation?: boolean
          sms_booking_reminder?: boolean
          sms_enabled?: boolean
          sms_urgent_only?: boolean
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          booking_reminder_hours?: number
          browser_booking_reminder?: boolean
          browser_enabled?: boolean
          browser_group_activity?: boolean
          browser_messages?: boolean
          created_at?: string
          daily_digest?: boolean
          digest_day?: number | null
          digest_time?: string | null
          email_booking_cancellation?: boolean
          email_booking_changes?: boolean
          email_booking_confirmation?: boolean
          email_booking_reminder?: boolean
          email_group_activity?: boolean
          email_group_invitations?: boolean
          email_marketing?: boolean
          email_messages?: boolean
          email_system_updates?: boolean
          sms_booking_confirmation?: boolean
          sms_booking_reminder?: boolean
          sms_enabled?: boolean
          sms_urgent_only?: boolean
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      zone_availability: {
        Row: {
          created_at: string
          day_of_week: number
          ends_time: string
          id: string
          starts_time: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          ends_time: string
          id?: string
          starts_time: string
          zone_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          ends_time?: string
          id?: string
          starts_time?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_availability_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          amenities: Json | null
          area_sqm: number | null
          capacity: number
          created_at: string
          description: string | null
          facility_id: string
          id: string
          name: string
          org_id: string
          price_per_hour_cents: number
          status: string
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          area_sqm?: number | null
          capacity?: number
          created_at?: string
          description?: string | null
          facility_id: string
          id?: string
          name: string
          org_id: string
          price_per_hour_cents: number
          status?: string
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          area_sqm?: number | null
          capacity?: number
          created_at?: string
          description?: string | null
          facility_id?: string
          id?: string
          name?: string
          org_id?: string
          price_per_hour_cents?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zones_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      facilities_public: {
        Row: {
          address: string | null
          amenities: Json | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: Json | null
          location: unknown
          org_id: string | null
          org_slug: string | null
          postal_code: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      accept_group_invitation: {
        Args: { p_invitation_id: string }
        Returns: string
      }
      add_group_member: {
        Args: {
          p_group_id: string
          p_role?: Database["public"]["Enums"]["group_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      app_jwt: { Args: never; Returns: Json }
      audit: {
        Args: {
          _action: string
          _actor: string
          _details: Json
          _entity: string
          _entity_id: string
          _org: string
        }
        Returns: undefined
      }
      calculate_ticket_sla: {
        Args: {
          p_priority: Database["public"]["Enums"]["ticket_priority"]
          p_ticket_id: string
        }
        Returns: undefined
      }
      cancel_booking: {
        Args: { p_booking: string; p_reason?: string }
        Returns: undefined
      }
      click_notification: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      compute_price_cents: {
        Args: { p_ends: string; p_facility: string; p_starts: string }
        Returns: number
      }
      confirm_payment: {
        Args: {
          p_amount: number
          p_booking: string
          p_intent: string
          p_provider: string
          p_raw: Json
        }
        Returns: undefined
      }
      confirm_recurring_occurrence: {
        Args: { p_occurrence_id: string }
        Returns: string
      }
      create_booking: {
        Args: {
          p_ends: string
          p_facility: string
          p_notes?: string
          p_starts: string
        }
        Returns: string
      }
      create_message_thread: {
        Args: {
          p_initial_message: string
          p_org_id: string
          p_priority?: string
          p_recipient_id: string
          p_related_booking_id?: string
          p_subject: string
        }
        Returns: string
      }
      create_user_notification: {
        Args: {
          p_action_label?: string
          p_action_url?: string
          p_body: string
          p_metadata?: Json
          p_notification_type: string
          p_priority?: string
          p_send_at?: string
          p_subject: string
          p_user_id: string
        }
        Returns: string
      }
      disablelongtransactions: { Args: never; Returns: string }
      dismiss_notification: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      expire_stale_holds: { Args: { p_ttl_minutes?: number }; Returns: number }
      generate_recurring_occurrences: {
        Args: { p_max_occurrences?: number; p_recurring_booking_id: string }
        Returns: number
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_facility_services: {
        Args: { p_facility_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["service_availability"]
          category: Database["public"]["Enums"]["service_category"]
          description: string
          is_included: boolean
          name: string
          price_cents: number
          price_type: Database["public"]["Enums"]["service_price_type"]
          service_id: string
        }[]
      }
      get_unread_message_count: {
        Args: { p_user_id?: string }
        Returns: number
      }
      get_zone_availability: {
        Args: { p_date: string; p_zone_id: string }
        Returns: {
          ends_time: string
          starts_time: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      has_overlap: {
        Args: {
          p_ends: string
          p_facility: string
          p_starts: string
          p_zone_id?: string
        }
        Returns: boolean
      }
      is_org_admin: { Args: { p_org: string }; Returns: boolean }
      is_org_member: {
        Args: {
          p_min_role?: Database["public"]["Enums"]["org_role"]
          p_org: string
        }
        Returns: boolean
      }
      is_org_staff: { Args: { p_org: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_zone_available: {
        Args: { p_ends: string; p_starts: string; p_zone_id: string }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      me: { Args: never; Returns: string }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      search_availability: {
        Args: { p_date: string; p_facility: string; p_slot_minutes?: number }
        Returns: {
          slot_end: string
          slot_start: string
        }[]
      }
      should_send_notification: {
        Args: {
          p_channel?: string
          p_notification_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      update_facility_rating: {
        Args: { p_facility_id: string }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "awaiting_payment"
        | "paid"
        | "cancelled"
        | "expired"
        | "completed"
        | "refunded"
      group_role: "owner" | "admin" | "member"
      notification_channel: "email" | "sms" | "none"
      org_role: "owner" | "admin" | "staff" | "customer" | "case_handler" | "editor" | "read_only"
      platform_role: "platform_admin" | "user"
      recurrence_frequency:
        | "daily"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "custom"
      service_availability: "available" | "on-request" | "unavailable"
      service_category:
        | "equipment"
        | "catering"
        | "technical"
        | "cleaning"
        | "security"
        | "other"
      service_price_type: "per-hour" | "per-day" | "per-booking" | "flat-rate"
      ticket_category:
        | "booking"
        | "technical"
        | "billing"
        | "feedback"
        | "other"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status:
        | "open"
        | "in-progress"
        | "waiting-user"
        | "resolved"
        | "closed"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: [
        "pending",
        "awaiting_payment",
        "paid",
        "cancelled",
        "expired",
        "completed",
        "refunded",
      ],
      group_role: ["owner", "admin", "member"],
      notification_channel: ["email", "sms", "none"],
      org_role: ["owner", "admin", "staff", "customer", "case_handler", "editor", "read_only"],
      platform_role: ["platform_admin", "user"],
      recurrence_frequency: [
        "daily",
        "weekly",
        "biweekly",
        "monthly",
        "custom",
      ],
      service_availability: ["available", "on-request", "unavailable"],
      service_category: [
        "equipment",
        "catering",
        "technical",
        "cleaning",
        "security",
        "other",
      ],
      service_price_type: ["per-hour", "per-day", "per-booking", "flat-rate"],
      ticket_category: ["booking", "technical", "billing", "feedback", "other"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: [
        "open",
        "in-progress",
        "waiting-user",
        "resolved",
        "closed",
      ],
    },
  },
} as const

