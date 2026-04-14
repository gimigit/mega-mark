'use client'

import { createClient } from './supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Upload a listing image to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The authenticated user's ID
 * @returns The public URL of the uploaded image, or an error message
 */
export async function uploadListingImage(
  file: File,
  userId: string
): Promise<{ url: string; error: string | null }> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      url: '',
      error: `Tip de fișier invalid. Se acceptă doar: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}`,
    }
  }

  // Validate file size (5MB limit)
  if (file.size > MAX_FILE_SIZE) {
    return {
      url: '',
      error: 'Fișierul este prea mare. Limita este de 5MB.',
    }
  }

  const supabase = createClient()

  // Generate unique filename
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}-${sanitizedName}`
  const filepath = `${userId}/${filename}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('listings')
    .upload(filepath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return {
      url: '',
      error: error.message || 'Eroare la încărcarea imaginii.',
    }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('listings')
    .getPublicUrl(filepath)

  return {
    url: urlData.publicUrl,
    error: null,
  }
}

/**
 * Delete a listing image from Supabase Storage
 * @param imageUrl - The full public URL of the image
 * @param userId - The authenticated user's ID
 * @returns Success or error
 */
export async function deleteListingImage(
  imageUrl: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  // Extract filepath from URL
  // URL format: {supabaseUrl}/storage/v1/object/public/listings/{path}
  const storagePath = '/storage/v1/object/public/listings/'
  const filepath = imageUrl.split(storagePath)[1]

  if (!filepath) {
    return {
      success: false,
      error: 'URL de imagine invalid.',
    }
  }

  // Verify the file belongs to the user
  const userFolder = filepath.split('/')[0]
  if (userFolder !== userId) {
    return {
      success: false,
      error: 'Nu aveți permisiunea să ștergeți această imagine.',
    }
  }

  const supabase = createClient()
  const { error } = await supabase.storage.from('listings').remove([filepath])

  if (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error.message || 'Eroare la ștergerea imaginii.',
    }
  }

  return {
    success: true,
    error: null,
  }
}
