import { createClient } from '@supabase/supabase-js'
import { config, validateConfig } from './config'

/**
 * Create a Supabase admin client with service role key
 * 
 * WARNING: This client bypasses RLS and should only be used server-side
 * for admin operations. Never expose the service role key to the client.
 * 
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 */
export function createAdminClient() {
  // Validate configuration
  try {
    validateConfig({ requireServiceRole: true })
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Supabase Admin] Configuration error:', error.message)
      throw error
    }
  }

  const serviceRoleKey = config.serviceRoleKey
  
  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
      'This is required for admin operations.\n' +
      'Add it to your .env.local or Vercel environment variables.'
    )
  }

  return createClient(
    config.url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
