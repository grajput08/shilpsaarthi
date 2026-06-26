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
      addresses: {
        Row: {
          address_line: string | null
          address_type: string
          artisan_id: string
          block: string | null
          captured_by: string | null
          created_at: string
          district: string | null
          gps_accuracy_m: number | null
          gps_captured_at: string | null
          gram_panchayat: string | null
          hamlet: string | null
          id: string
          landmark: string | null
          latitude: number | null
          longitude: number | null
          pin_code: string | null
          state: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          address_line?: string | null
          address_type?: string
          artisan_id: string
          block?: string | null
          captured_by?: string | null
          created_at?: string
          district?: string | null
          gps_accuracy_m?: number | null
          gps_captured_at?: string | null
          gram_panchayat?: string | null
          hamlet?: string | null
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          pin_code?: string | null
          state?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          address_line?: string | null
          address_type?: string
          artisan_id?: string
          block?: string | null
          captured_by?: string | null
          created_at?: string
          district?: string | null
          gps_accuracy_m?: number | null
          gps_captured_at?: string | null
          gram_panchayat?: string | null
          hamlet?: string | null
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          pin_code?: string | null
          state?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_captured_by_fkey"
            columns: ["captured_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artisans: {
        Row: {
          alternate_phone: string | null
          artisan_code: string | null
          assigned_verifier: string | null
          block: string | null
          consent_status: Database["public"]["Enums"]["consent_status"]
          created_at: string
          created_by: string | null
          data_completeness: number
          date_of_birth: string | null
          district: string | null
          duplicate_risk: string
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          notes: string | null
          phone: string | null
          preferred_language: string
          primary_craft: Database["public"]["Enums"]["craft_category"] | null
          priority: Database["public"]["Enums"]["priority_level"]
          registration_source: Database["public"]["Enums"]["registration_source"]
          state: string | null
          status: Database["public"]["Enums"]["artisan_status"]
          tribe_community: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          alternate_phone?: string | null
          artisan_code?: string | null
          assigned_verifier?: string | null
          block?: string | null
          consent_status?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          created_by?: string | null
          data_completeness?: number
          date_of_birth?: string | null
          district?: string | null
          duplicate_risk?: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_language?: string
          primary_craft?: Database["public"]["Enums"]["craft_category"] | null
          priority?: Database["public"]["Enums"]["priority_level"]
          registration_source?: Database["public"]["Enums"]["registration_source"]
          state?: string | null
          status?: Database["public"]["Enums"]["artisan_status"]
          tribe_community?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          alternate_phone?: string | null
          artisan_code?: string | null
          assigned_verifier?: string | null
          block?: string | null
          consent_status?: Database["public"]["Enums"]["consent_status"]
          created_at?: string
          created_by?: string | null
          data_completeness?: number
          date_of_birth?: string | null
          district?: string | null
          duplicate_risk?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_language?: string
          primary_craft?: Database["public"]["Enums"]["craft_category"] | null
          priority?: Database["public"]["Enums"]["priority_level"]
          registration_source?: Database["public"]["Enums"]["registration_source"]
          state?: string | null
          status?: Database["public"]["Enums"]["artisan_status"]
          tribe_community?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artisans_assigned_verifier_fkey"
            columns: ["assigned_verifier"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artisans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          artisan_id: string
          assigned_by: string | null
          created_at: string
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["assignment_status"]
          supervisor_note: string | null
          updated_at: string
          verifier_id: string
        }
        Insert: {
          artisan_id: string
          assigned_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["assignment_status"]
          supervisor_note?: string | null
          updated_at?: string
          verifier_id: string
        }
        Update: {
          artisan_id?: string
          assigned_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["assignment_status"]
          supervisor_note?: string | null
          updated_at?: string
          verifier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          actor_role: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          source: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          source?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      craft_profiles: {
        Row: {
          artisan_id: string
          craft_category: Database["public"]["Enums"]["craft_category"] | null
          created_at: string
          experience_years: number | null
          group_name: string | null
          id: string
          learned_from: string | null
          monthly_capacity: number | null
          raw_materials: string | null
          seasonal_availability: string | null
          sub_category: string | null
          tools_used: string | null
          training_needs: string | null
          updated_at: string
          works_in_group: boolean | null
        }
        Insert: {
          artisan_id: string
          craft_category?: Database["public"]["Enums"]["craft_category"] | null
          created_at?: string
          experience_years?: number | null
          group_name?: string | null
          id?: string
          learned_from?: string | null
          monthly_capacity?: number | null
          raw_materials?: string | null
          seasonal_availability?: string | null
          sub_category?: string | null
          tools_used?: string | null
          training_needs?: string | null
          updated_at?: string
          works_in_group?: boolean | null
        }
        Update: {
          artisan_id?: string
          craft_category?: Database["public"]["Enums"]["craft_category"] | null
          created_at?: string
          experience_years?: number | null
          group_name?: string | null
          id?: string
          learned_from?: string | null
          monthly_capacity?: number | null
          raw_materials?: string | null
          seasonal_availability?: string | null
          sub_category?: string | null
          tools_used?: string | null
          training_needs?: string | null
          updated_at?: string
          works_in_group?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "craft_profiles_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: true
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          artisan_id: string
          checked_by: string | null
          created_at: string
          doc_type: Database["public"]["Enums"]["document_type"]
          file_path: string | null
          id: string
          reference_masked: string | null
          status: Database["public"]["Enums"]["doc_status"]
          unavailable_reason: string | null
          updated_at: string
        }
        Insert: {
          artisan_id: string
          checked_by?: string | null
          created_at?: string
          doc_type: Database["public"]["Enums"]["document_type"]
          file_path?: string | null
          id?: string
          reference_masked?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          unavailable_reason?: string | null
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          checked_by?: string | null
          created_at?: string
          doc_type?: Database["public"]["Enums"]["document_type"]
          file_path?: string | null
          id?: string
          reference_masked?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          unavailable_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      duplicate_candidates: {
        Row: {
          artisan_id: string
          created_at: string
          id: string
          master_artisan_id: string | null
          match_artisan_id: string
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          score: number
          signal: Database["public"]["Enums"]["duplicate_signal"]
          status: Database["public"]["Enums"]["duplicate_state"]
          updated_at: string
        }
        Insert: {
          artisan_id: string
          created_at?: string
          id?: string
          master_artisan_id?: string | null
          match_artisan_id: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          score?: number
          signal: Database["public"]["Enums"]["duplicate_signal"]
          status?: Database["public"]["Enums"]["duplicate_state"]
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          created_at?: string
          id?: string
          master_artisan_id?: string | null
          match_artisan_id?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          score?: number
          signal?: Database["public"]["Enums"]["duplicate_signal"]
          status?: Database["public"]["Enums"]["duplicate_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "duplicate_candidates_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duplicate_candidates_master_artisan_id_fkey"
            columns: ["master_artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duplicate_candidates_match_artisan_id_fkey"
            columns: ["match_artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duplicate_candidates_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          artisan_id: string
          buyers: string[]
          can_ship: boolean | null
          category: Database["public"]["Enums"]["craft_category"] | null
          created_at: string
          description: string | null
          dimensions: string | null
          id: string
          materials: string | null
          min_order_qty: number | null
          monthly_capacity: number | null
          name: string
          packaging_available: boolean | null
          photo_paths: string[]
          price_max: number | null
          price_min: number | null
          product_code: string | null
          production_time: string | null
          quality_notes: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          artisan_id: string
          buyers?: string[]
          can_ship?: boolean | null
          category?: Database["public"]["Enums"]["craft_category"] | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          materials?: string | null
          min_order_qty?: number | null
          monthly_capacity?: number | null
          name: string
          packaging_available?: boolean | null
          photo_paths?: string[]
          price_max?: number | null
          price_min?: number | null
          product_code?: string | null
          production_time?: string | null
          quality_notes?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          artisan_id?: string
          buyers?: string[]
          can_ship?: boolean | null
          category?: Database["public"]["Enums"]["craft_category"] | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          materials?: string | null
          min_order_qty?: number | null
          monthly_capacity?: number | null
          name?: string
          packaging_available?: boolean | null
          photo_paths?: string[]
          price_max?: number | null
          price_min?: number | null
          product_code?: string | null
          production_time?: string | null
          quality_notes?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          state: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          artisan_id: string
          assignment_id: string | null
          client_generated_id: string | null
          consent_captured: boolean
          consent_mode: string | null
          consent_timestamp: string | null
          craft_verified: boolean
          created_at: string
          decision: Database["public"]["Enums"]["verification_decision"] | null
          documents_checked: boolean
          duplicate_checked: boolean
          gps_accuracy_m: number | null
          id: string
          identity_verified: boolean
          latitude: number | null
          location_verified: boolean
          longitude: number | null
          market_ready: boolean
          notes: string | null
          photo_paths: string[]
          products_captured: boolean
          reason: string | null
          sync_status: Database["public"]["Enums"]["sync_status"]
          updated_at: string
          verifier_id: string | null
          visit_date: string
        }
        Insert: {
          artisan_id: string
          assignment_id?: string | null
          client_generated_id?: string | null
          consent_captured?: boolean
          consent_mode?: string | null
          consent_timestamp?: string | null
          craft_verified?: boolean
          created_at?: string
          decision?: Database["public"]["Enums"]["verification_decision"] | null
          documents_checked?: boolean
          duplicate_checked?: boolean
          gps_accuracy_m?: number | null
          id?: string
          identity_verified?: boolean
          latitude?: number | null
          location_verified?: boolean
          longitude?: number | null
          market_ready?: boolean
          notes?: string | null
          photo_paths?: string[]
          products_captured?: boolean
          reason?: string | null
          sync_status?: Database["public"]["Enums"]["sync_status"]
          updated_at?: string
          verifier_id?: string | null
          visit_date?: string
        }
        Update: {
          artisan_id?: string
          assignment_id?: string | null
          client_generated_id?: string | null
          consent_captured?: boolean
          consent_mode?: string | null
          consent_timestamp?: string | null
          craft_verified?: boolean
          created_at?: string
          decision?: Database["public"]["Enums"]["verification_decision"] | null
          documents_checked?: boolean
          duplicate_checked?: boolean
          gps_accuracy_m?: number | null
          id?: string
          identity_verified?: boolean
          latitude?: number | null
          location_verified?: boolean
          longitude?: number | null
          market_ready?: boolean
          notes?: string | null
          photo_paths?: string[]
          products_captured?: boolean
          reason?: string | null
          sync_status?: Database["public"]["Enums"]["sync_status"]
          updated_at?: string
          verifier_id?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "verifications_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          artisan_id: string | null
          body: string
          campaign_id: string | null
          created_at: string
          delivered_at: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          id: string
          language: string
          provider_message_id: string | null
          read_at: string | null
          reply_body: string | null
          sent_at: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["whatsapp_status"]
          template_key: string | null
          to_phone: string | null
          updated_at: string
          variables: Json
        }
        Insert: {
          artisan_id?: string | null
          body: string
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          id?: string
          language?: string
          provider_message_id?: string | null
          read_at?: string | null
          reply_body?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["whatsapp_status"]
          template_key?: string | null
          to_phone?: string | null
          updated_at?: string
          variables?: Json
        }
        Update: {
          artisan_id?: string | null
          body?: string
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          id?: string
          language?: string
          provider_message_id?: string | null
          read_at?: string | null
          reply_body?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["whatsapp_status"]
          template_key?: string | null
          to_phone?: string | null
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_template_key_fkey"
            columns: ["template_key"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["template_key"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          is_approved: boolean
          language: string
          name: string
          template_key: string
          updated_at: string
          variables: string[]
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          id?: string
          is_approved?: boolean
          language?: string
          name: string
          template_key: string
          updated_at?: string
          variables?: string[]
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          language?: string
          name?: string
          template_key?: string
          updated_at?: string
          variables?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_geo: {
        Args: { p_district: string; p_state: string }
        Returns: boolean
      }
      can_read_artisan: {
        Args: { p_artisan: string }
        Returns: boolean
      }
      can_view_artisan: {
        Args: { p_artisan: string; p_district: string; p_state: string }
        Returns: boolean
      }
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      current_app_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_assigned_verifier: {
        Args: { p_artisan: string }
        Returns: boolean
      }
      is_district_officer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_operator: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_verifier: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      profile_district: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      profile_state: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      storage_artisan_id: {
        Args: { object_name: string }
        Returns: string
      }
      try_uuid: {
        Args: { t: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "verifier" | "district_officer"
      artisan_status:
        | "lead_created"
        | "contacted"
        | "registration_started"
        | "registration_submitted"
        | "pending_verification"
        | "assigned"
        | "verification_in_progress"
        | "verified"
        | "needs_correction"
        | "revisit_required"
        | "rejected"
        | "duplicate"
        | "market_ready"
      assignment_status:
        | "assigned"
        | "in_progress"
        | "completed"
        | "reassigned"
        | "cancelled"
      audit_action:
        | "created"
        | "updated"
        | "deleted"
        | "status_changed"
        | "consent_captured"
        | "verifier_assigned"
        | "whatsapp_sent"
        | "verification_submitted"
        | "approved"
        | "rejected"
        | "duplicate_merged"
        | "export_downloaded"
        | "form_submitted"
      consent_status: "not_captured" | "granted" | "declined"
      craft_category:
        | "textile"
        | "painting"
        | "jewellery"
        | "metal_craft"
        | "cane_bamboo"
        | "pottery"
        | "wood_craft"
        | "natural_products"
        | "tribal_food"
        | "other"
      doc_status: "available" | "not_available" | "not_asked" | "not_required"
      document_type:
        | "id_proof"
        | "address_proof"
        | "caste_tribe_certificate"
        | "bank_passbook"
        | "pan"
        | "gst"
        | "shg_membership"
        | "training_certificate"
        | "artisan_card"
        | "other"
      duplicate_signal:
        | "same_phone"
        | "same_name_village"
        | "same_id_ref"
        | "same_gps_name"
        | "same_group"
      duplicate_state: "open" | "confirmed" | "dismissed" | "merged"
      gender_type: "male" | "female" | "other" | "undisclosed"
      message_direction: "outbound" | "inbound"
      priority_level: "high" | "normal" | "revisit" | "correction"
      registration_source:
        | "whatsapp_self"
        | "call_center"
        | "admin_manual"
        | "csv_import"
        | "ngo"
        | "campaign"
      sync_status: "synced" | "pending" | "failed"
      verification_decision:
        | "verified"
        | "needs_correction"
        | "revisit_required"
        | "rejected"
        | "duplicate"
      whatsapp_status:
        | "queued"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
        | "replied"
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
      app_role: ["admin", "operator", "verifier", "district_officer"],
      artisan_status: [
        "lead_created",
        "contacted",
        "registration_started",
        "registration_submitted",
        "pending_verification",
        "assigned",
        "verification_in_progress",
        "verified",
        "needs_correction",
        "revisit_required",
        "rejected",
        "duplicate",
        "market_ready",
      ],
      assignment_status: [
        "assigned",
        "in_progress",
        "completed",
        "reassigned",
        "cancelled",
      ],
      audit_action: [
        "created",
        "updated",
        "deleted",
        "status_changed",
        "consent_captured",
        "verifier_assigned",
        "whatsapp_sent",
        "verification_submitted",
        "approved",
        "rejected",
        "duplicate_merged",
        "export_downloaded",
        "form_submitted",
      ],
      consent_status: ["not_captured", "granted", "declined"],
      craft_category: [
        "textile",
        "painting",
        "jewellery",
        "metal_craft",
        "cane_bamboo",
        "pottery",
        "wood_craft",
        "natural_products",
        "tribal_food",
        "other",
      ],
      doc_status: ["available", "not_available", "not_asked", "not_required"],
      document_type: [
        "id_proof",
        "address_proof",
        "caste_tribe_certificate",
        "bank_passbook",
        "pan",
        "gst",
        "shg_membership",
        "training_certificate",
        "artisan_card",
        "other",
      ],
      duplicate_signal: [
        "same_phone",
        "same_name_village",
        "same_id_ref",
        "same_gps_name",
        "same_group",
      ],
      duplicate_state: ["open", "confirmed", "dismissed", "merged"],
      gender_type: ["male", "female", "other", "undisclosed"],
      message_direction: ["outbound", "inbound"],
      priority_level: ["high", "normal", "revisit", "correction"],
      registration_source: [
        "whatsapp_self",
        "call_center",
        "admin_manual",
        "csv_import",
        "ngo",
        "campaign",
      ],
      sync_status: ["synced", "pending", "failed"],
      verification_decision: [
        "verified",
        "needs_correction",
        "revisit_required",
        "rejected",
        "duplicate",
      ],
      whatsapp_status: [
        "queued",
        "sent",
        "delivered",
        "read",
        "failed",
        "replied",
      ],
    },
  },
} as const

