/**
 * Supabase Configuration
 * 
 * Environment-specific settings for Supabase connections.
 * Handles IPv4/IPv6 compatibility via connection pooling on Vercel.
 * 
 * @link https://supabase.com/docs/guides/database/connecting-to-postgres/connection-pooler
 */

/**
 * Detect if running on Vercel
 */
export function isVercel(): boolean {
  return (
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true' ||
    !!process.env.VERCEL_ENV
  )
}

/**
 * Detect if running during build phase
 */
export function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL)
  )
}

/**
 * Get Supabase project reference from URL
 */
export function getProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  
  // Extract project ref from: https://xxx.supabase.co
  const match = url.match(/(?:\/\/|\.)?([a-z0-9]+)\.supabase\.co/)
  return match ? match[1] : null
}

/**
 * Default pooler configuration for Vercel IPv4 compatibility
 */
export const POOLER_CONFIG = {
  host: process.env.SUPABASE_POOLER_HOST || 'aws-0-eu-west-2.pooler.supabase.com',
  port: parseInt(process.env.SUPABASE_POOLER_PORT || '6543', 10),
  mode: process.env.SUPABASE_POOLER_MODE || 'transaction',
} as const

/**
 * Get pooled connection string for Vercel
 * 
 * @throws Error if required variables are missing
 */
export function getPooledConnectionString(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const projectRef = getProjectRef()
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY
  const host = process.env.SUPABASE_POOLER_HOST || POOLER_CONFIG.host
  const port = POOLER_CONFIG.port

  if (!password) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL required for pooled connection'
    )
  }

  return `postgresql://postgres:${encodeURIComponent(password)}@${host}:${port}/postgres?pgbouncer=true&connection_limit=1`
}

/**
 * Get direct connection string for local development
 * 
 * @throws Error if required variables are missing
 */
export function getDirectConnectionString(): string {
  if (process.env.DIRECT_URL) {
    return process.env.DIRECT_URL
  }

  const projectRef = getProjectRef()
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!projectRef || !password) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL required for direct connection'
    )
  }

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres?connection_limit=1`
}

/**
 * Get appropriate database URL based on environment
 * - Vercel: Uses pooled connection (IPv4 compatible)
 * - Local: Uses direct connection (faster, no pooling overhead)
 * - Build time: Prefers direct connection if available
 */
export function getDatabaseUrl(): string {
  // During build, try to use direct connection to avoid pooler startup issues
  if (isBuildTime()) {
    try {
      return getDirectConnectionString()
    } catch {
      // Fall through to normal logic
    }
  }

  // On Vercel, use pooled connection
  if (isVercel()) {
    return getPooledConnectionString()
  }

  // Local development
  try {
    return getDirectConnectionString()
  } catch {
    // Fallback to pooled if direct fails
    return getPooledConnectionString()
  }
}

/**
 * Supabase configuration object
 * Export this for use throughout the app
 */
export const config = {
  /**
   * Supabase HTTP API URL
   */
  get url(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) {
      if (isBuildTime()) return 'https://placeholder.supabase.co'
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL is required.\n' +
        'Add it to your .env.local file or Vercel environment variables.'
      )
    }
    return url
  },

  /**
   * Anon key for client-side operations
   */
  get anonKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!key) {
      if (isBuildTime()) return 'placeholder-anon-key'
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_ANON_KEY is required.\n' +
        'Add it to your .env.local file or Vercel environment variables.'
      )
    }
    return key
  },

  /**
   * Service role key for admin operations (server-only)
   */
  get serviceRoleKey(): string | null {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || null
  },

  /**
   * Connection pooling configuration for Vercel
   */
  pooler: POOLER_CONFIG,

  /**
   * Get database connection URLs
   */
  get urls() {
    return {
      /**
       * DATABASE_URL - uses pooled connection on Vercel, direct otherwise
       */
      get database(): string {
        return getDatabaseUrl()
      },
      
      /**
       * DIRECT_URL - direct PostgreSQL connection
       */
      get direct(): string {
        return getDirectConnectionString()
      },
      
      /**
       * POOLED_URL - always uses pooler
       */
      get pooled(): string {
        return getPooledConnectionString()
      },
    }
  },
} as const

/**
 * Validate that required environment variables are set
 * 
 * @param options - Validation options
 * @param options.requireServiceRole - Require SUPABASE_SERVICE_ROLE_KEY (default: false)
 * @param options.requireDirectUrl - Require DIRECT_URL or DB config (default: false)
 * @throws Error if any required variable is missing
 */
export function validateConfig(
  options: {
    requireServiceRole?: boolean
    requireDirectUrl?: boolean
  } = {}
): { valid: true } | never {
  const { requireServiceRole = false, requireDirectUrl = false } = options
  
  // Skip validation at build time — env vars may not be available
  if (isBuildTime()) return { valid: true }

  const missing: string[] = []

  // Always required
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // Required when explicitly requested
  if (requireServiceRole && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  // Required for direct DB connections on Vercel
  if (requireDirectUrl && isVercel()) {
    if (!process.env.DATABASE_URL) {
      missing.push('DATABASE_URL')
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Supabase configuration error:\n\n` +
      `Missing required environment variables:\n` +
      missing.map(name => `  - ${name}`).join('\n') +
      `\n\n` +
      `Please add these variables to:\n` +
      `  - .env.local for local development\n` +
      `  - Vercel Dashboard > Project Settings > Environment Variables for production\n\n` +
      `See .env.example for the full configuration template.`
    )
  }

  return { valid: true }
}
