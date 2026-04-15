'use client'

import { createBrowserClient } from '@supabase/ssr'
import { config, validateConfig } from './config'

/**
 * Create a Supabase client for browser usage
 * 
 * Uses pooler-compatible configuration for Vercel IPv4 compatibility.
 * This client is for HTTP API calls (Auth, Database, Storage, Realtime).
 * 
 * For direct database connection, use the pooler config from ./config
 * @see https://supabase.com/docs/guides/database/connecting-to-postgres/connection-pooler
 */
export function createClient() {
  // Validate required configuration
  try {
    validateConfig()
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Supabase Client] Configuration error:', error.message)
      throw error
    }
  }

  // Create browser client with the Supabase HTTP API
  // Note: This uses the REST API, not direct PostgreSQL connection
  // The pooler is only needed for direct DB connections (Prisma, etc.)
  return createBrowserClient(
    config.url,
    config.anonKey
  )
}
