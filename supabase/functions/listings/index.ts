// AgroMark EU - Listings API
// Handles listing CRUD operations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

interface ListingFilters {
  category?: string;
  manufacturer?: string;
  country?: string;
  price_min?: number;
  price_max?: number;
  year_min?: number;
  year_max?: number;
  type?: 'sale' | 'rent' | 'lease';
  condition?: 'new' | 'used' | 'refurbished';
  query?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  limit?: number;
  offset?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { globalHeaders: { Authorization: req.headers.get('Authorization') ?? '' } }
    );

    const { method } = req;
    const url = new URL(req.url);

    // GET /listings - List active listings
    if (method === 'GET') {
      const filters: ListingFilters = {
        category: url.searchParams.get('category') ?? undefined,
        manufacturer: url.searchParams.get('manufacturer') ?? undefined,
        country: url.searchParams.get('country') ?? undefined,
        price_min: url.searchParams.get('price_min') ? Number(url.searchParams.get('price_min')) : undefined,
        price_max: url.searchParams.get('price_max') ? Number(url.searchParams.get('price_max')) : undefined,
        year_min: url.searchParams.get('year_min') ? Number(url.searchParams.get('year_min')) : undefined,
        year_max: url.searchParams.get('year_max') ? Number(url.searchParams.get('year_max')) : undefined,
        type: url.searchParams.get('type') as ListingFilters['type'] ?? undefined,
        condition: url.searchParams.get('condition') as ListingFilters['condition'] ?? undefined,
        query: url.searchParams.get('q') ?? undefined,
        sort: (url.searchParams.get('sort') as ListingFilters['sort']) ?? 'newest',
        limit: Math.min(Number(url.searchParams.get('limit') ?? '20'), 100),
        offset: Number(url.searchParams.get('offset') ?? '0'),
      };

      let query = supabaseClient
        .from('listings')
        .select(`
          id, title, title_de, title_fr, title_es,
          price, currency, year, hours, power_hp,
          location_country, location_region, location_city,
          listing_type, status, condition,
          images, is_featured, is_highlighted,
          views_count, favorites_count, created_at,
          category:categories(id, name, slug, icon),
          manufacturer:manufacturers(id, name, slug),
          seller:profiles!seller_id(id, full_name, company_name, rating_avg, is_verified, avatar_url)
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters.manufacturer) {
        query = query.eq('manufacturer_id', filters.manufacturer);
      }
      if (filters.country) {
        query = query.eq('location_country', filters.country);
      }
      if (filters.price_min) {
        query = query.gte('price', filters.price_min);
      }
      if (filters.price_max) {
        query = query.lte('price', filters.price_max);
      }
      if (filters.year_min) {
        query = query.gte('year', filters.year_min);
      }
      if (filters.year_max) {
        query = query.lte('year', filters.year_max);
      }
      if (filters.type) {
        query = query.eq('listing_type', filters.type);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      // Sorting
      switch (filters.sort) {
        case 'price_asc':
          query = query.order('price', { ascending: true, nullsFirst: false });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false, nullsFirst: false });
          break;
        case 'popular':
          query = query.order('views_count', { ascending: false });
          break;
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      query = query.range(filters.offset!, filters.offset! + filters.limit! - 1);

      const { data, error, count } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ data, count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /listings - Create new listing
    if (method === 'POST') {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      const {
        title, description, category_id, manufacturer_id,
        listing_type, price, price_type, currency,
        year, hours, power_hp, condition,
        location_country, location_region, location_city,
        images, specs
      } = body;

      const { data, error } = await supabaseClient
        .from('listings')
        .insert({
          seller_id: user.id,
          title,
          description,
          category_id,
          manufacturer_id,
          listing_type: listing_type ?? 'sale',
          price,
          price_type: price_type ?? 'fixed',
          currency: currency ?? 'EUR',
          year,
          hours,
          power_hp,
          condition: condition ?? 'used',
          location_country,
          location_region,
          location_city,
          images: images ?? [],
          specs: specs ?? {},
          status: 'active',
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
