// AgroMark EU - Shared CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export const handleCors = (Deno: typeof import('@supabase/functions-js')) => {
  if (Deno.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};
