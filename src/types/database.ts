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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          company_name: string | null
          vat_number: string | null
          role: 'buyer' | 'seller' | 'dealer' | 'admin' | null
          avatar_url: string | null
          bio: string | null
          location_country: string | null
          location_region: string | null
          is_verified: boolean | null
          is_dealer: boolean | null
          rating_avg: number | null
          rating_count: number | null
          listings_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string
          full_name?: string | null
          phone?: string | null
          company_name?: string | null
          vat_number?: string | null
          role?: 'buyer' | 'seller' | 'dealer' | 'admin' | null
          avatar_url?: string | null
          bio?: string | null
          location_country?: string | null
          location_region?: string | null
          is_verified?: boolean | null
          is_dealer?: boolean | null
          rating_avg?: number | null
          rating_count?: number | null
          listings_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          company_name?: string | null
          vat_number?: string | null
          role?: 'buyer' | 'seller' | 'dealer' | 'admin' | null
          avatar_url?: string | null
          bio?: string | null
          location_country?: string | null
          location_region?: string | null
          is_verified?: boolean | null
          is_dealer?: boolean | null
          rating_avg?: number | null
          rating_count?: number | null
          listings_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      listing_reports: {
        Row: {
          id: string
          listing_id: string
          user_id: string | null
          reason: string
          description: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id?: string | null
          reason: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string | null
          reason?: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          manufacturer_id: string | null
          title: string
          title_de: string | null
          title_fr: string | null
          title_es: string | null
          description: string | null
          description_de: string | null
          description_fr: string | null
          description_es: string | null
          listing_type: 'sale' | 'rent' | 'lease' | null
          price: number | null
          price_type: 'fixed' | 'negotiable' | 'on_request' | 'auction' | null
          currency: string | null
          price_history: any | null
          year: number | null
          hours: number | null
          mileage: number | null
          power_hp: number | null
          engine_type: string | null
          transmission: string | null
          weight_kg: number | null
          condition: 'new' | 'used' | 'refurbished' | null
          status: 'draft' | 'active' | 'pending' | 'sold' | 'archived' | 'deleted' | null
          is_featured: boolean | null
          is_highlighted: boolean | null
          views_count: number | null
          inquiries_count: number | null
          favorites_count: number | null
          location_country: string | null
          location_region: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          images: Json | null
          specs: Json | null
          videos: Json | null
          documents: Json | null
          expires_at: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          manufacturer_id?: string | null
          title: string
          title_de?: string | null
          title_fr?: string | null
          title_es?: string | null
          description?: string | null
          description_de?: string | null
          description_fr?: string | null
          description_es?: string | null
          listing_type?: 'sale' | 'rent' | 'lease' | null
          price?: number | null
          price_type?: 'fixed' | 'negotiable' | 'on_request' | 'auction' | null
          currency?: string | null
          price_history?: any | null
          year?: number | null
          hours?: number | null
          mileage?: number | null
          power_hp?: number | null
          engine_type?: string | null
          transmission?: string | null
          weight_kg?: number | null
          condition?: 'new' | 'used' | 'refurbished' | null
          status?: 'draft' | 'active' | 'pending' | 'sold' | 'archived' | 'deleted' | null
          is_featured?: boolean | null
          is_highlighted?: boolean | null
          views_count?: number | null
          inquiries_count?: number | null
          favorites_count?: number | null
          location_country?: string | null
          location_region?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          images?: Json | null
          specs?: Json | null
          videos?: Json | null
          documents?: Json | null
          expires_at?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          manufacturer_id?: string | null
          title?: string
          title_de?: string | null
          title_fr?: string | null
          title_es?: string | null
          description?: string | null
          description_de?: string | null
          description_fr?: string | null
          description_es?: string | null
          listing_type?: 'sale' | 'rent' | 'lease' | null
          price?: number | null
          price_type?: 'fixed' | 'negotiable' | 'on_request' | 'auction' | null
          currency?: string | null
          price_history?: any | null
          year?: number | null
          hours?: number | null
          mileage?: number | null
          power_hp?: number | null
          engine_type?: string | null
          transmission?: string | null
          weight_kg?: number | null
          condition?: 'new' | 'used' | 'refurbished' | null
          status?: 'draft' | 'active' | 'pending' | 'sold' | 'archived' | 'deleted' | null
          is_featured?: boolean | null
          is_highlighted?: boolean | null
          views_count?: number | null
          inquiries_count?: number | null
          favorites_count?: number | null
          location_country?: string | null
          location_region?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          images?: Json | null
          specs?: Json | null
          videos?: Json | null
          documents?: Json | null
          expires_at?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          name_de: string | null
          name_fr: string | null
          name_es: string | null
          name_pl: string | null
          name_ro: string | null
          icon: string | null
          description: string | null
          parent_id: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          name_de?: string | null
          name_fr?: string | null
          name_es?: string | null
          name_pl?: string | null
          name_ro?: string | null
          icon?: string | null
          description?: string | null
          parent_id?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          name_de?: string | null
          name_fr?: string | null
          name_es?: string | null
          name_pl?: string | null
          name_ro?: string | null
          icon?: string | null
          description?: string | null
          parent_id?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      manufacturers: {
        Row: {
          id: string
          slug: string
          name: string
          country: string | null
          logo_url: string | null
          website: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          country?: string | null
          logo_url?: string | null
          website?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          country?: string | null
          logo_url?: string | null
          website?: string | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          listing_id: string | null
          buyer_id: string
          seller_id: string
          last_message_preview: string | null
          last_message_at: string | null
          buyer_unread: number | null
          seller_unread: number | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          buyer_id: string
          seller_id: string
          last_message_preview?: string | null
          last_message_at?: string | null
          buyer_unread?: number | null
          seller_unread?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string | null
          buyer_id?: string
          seller_id?: string
          last_message_preview?: string | null
          last_message_at?: string | null
          buyer_unread?: number | null
          seller_unread?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          status: 'unread' | 'read' | 'archived' | null
          is_system: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          status?: 'unread' | 'read' | 'archived' | null
          is_system?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          status?: 'unread' | 'read' | 'archived' | null
          is_system?: boolean | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string | null
          rating: number
          title: string | null
          content: string | null
          is_verified_purchase: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewed_id: string
          listing_id?: string | null
          rating: number
          title?: string | null
          content?: string | null
          is_verified_purchase?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewed_id?: string
          listing_id?: string | null
          rating?: number
          title?: string | null
          content?: string | null
          is_verified_purchase?: boolean | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: Json | null
          is_read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          data?: Json | null
          is_read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          data?: Json | null
          is_read?: boolean | null
          created_at?: string
        }
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string | null
          keyword: string | null
          category_id: string | null
          country: string | null
          condition: string | null
          price_min: number | null
          price_max: number | null
          year_min: number | null
          year_max: number | null
          manufacturer_id: string | null
          listing_type: string | null
          notify_email: boolean | null
          last_notified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          keyword?: string | null
          category_id?: string | null
          country?: string | null
          condition?: string | null
          price_min?: number | null
          price_max?: number | null
          year_min?: number | null
          year_max?: number | null
          manufacturer_id?: string | null
          listing_type?: string | null
          notify_email?: boolean | null
          last_notified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          keyword?: string | null
          category_id?: string | null
          country?: string | null
          condition?: string | null
          price_min?: number | null
          price_max?: number | null
          year_min?: number | null
          year_max?: number | null
          manufacturer_id?: string | null
          listing_type?: string | null
          notify_email?: boolean | null
          last_notified_at?: string | null
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string | null
          query: string
          filters: Json | null
          results_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          query: string
          filters?: Json | null
          results_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          query?: string
          filters?: Json | null
          results_count?: number | null
          created_at?: string
        }
      },

      subscriptions: {
        Row: {
          id: string
          profile_id: string
          plan_type: 'free' | 'seller' | 'dealer' | 'enterprise'
          status: 'active' | 'cancelled' | 'expired'
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          plan_type: 'free' | 'seller' | 'dealer' | 'enterprise'
          status?: 'active' | 'cancelled' | 'expired'
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          plan_type?: 'free' | 'seller' | 'dealer' | 'enterprise'
          status?: 'active' | 'cancelled' | 'expired'
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
        }
      },

      listing_boosts: {
        Row: {
          id: string
          listing_id: string
          profile_id: string | null
          boost_type: 'featured_7d' | 'featured_14d' | 'top_position'
          quantity: number
          stripe_payment_intent_id: string | null
          starts_at: string
          expires_at: string
          status: 'active' | 'expired' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          profile_id?: string | null
          boost_type: 'featured_7d' | 'featured_14d' | 'top_position'
          quantity?: number
          stripe_payment_intent_id?: string | null
          starts_at: string
          expires_at: string
          status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          profile_id?: string | null
          boost_type?: 'featured_7d' | 'featured_14d' | 'top_position'
          quantity?: number
          stripe_payment_intent_id?: string | null
          starts_at?: string
          expires_at?: string
          status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
}
