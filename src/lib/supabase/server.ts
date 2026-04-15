import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config, validateConfig } from './config'

/**
 * Create a Supabase server client
 * 
 * Uses pooler-compatible configuration for Vercel IPv4 compatibility.
 * This client is for HTTP API calls from Next.js server components.
 * 
 * For direct database connection with Prisma/pg, use getDatabaseUrl() from ./config
 * @see https://supabase.com/docs/guides/database/connecting-to-postgres/connection-pooler
 */
export async function createClient() {
  const cookieStore = await cookies()

  // Validate required configuration
  try {
    validateConfig()
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Supabase Server] Configuration error:', error.message)
      throw error
    }
  }

  return createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
