'use client'

import { useState, useRef } from 'react'
import { Upload, Search, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Listing = {
  id: string
  title: string
  price: number
  images: string[]
  category_slug: string
  manufacturer_slug: string
  model: string
  year: number
  location_region: string
}

interface ImageSearchProps {}

export default function ImageSearch({}: ImageSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setSelectedImage(objectUrl)

    // For MVP: just search recent listings (actual image matching would need CLIP embeddings)
    await searchSimilar(objectUrl)
  }

  const searchSimilar = async (imageUrl: string) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = await createClient()

      // MVP: just get recent listings - in production would use CLIP embeddings
      const { data, error: queryError } = await supabase
        .from('listings')
        .select('id, title, price, images, category_slug, manufacturer_slug, model, year, location_region')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .not('images', 'eq', '{}')
        .order('created_at', { ascending: false })
        .limit(20)

      if (queryError) throw queryError

      // Shuffle and take 5
      const shuffled = (data || [])
        .filter(l => l.images && l.images.length > 0)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)

      setResults(shuffled)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Caută cu imagine</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background">
          <h2 className="text-xl font-bold">Caută cu imagine</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedImage ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Încarcă o imagine</p>
                <p className="text-sm text-muted-foreground">
                  Găsește anunțuri similare cu utilajul din poză
                </p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="object-contain w-full h-full"
                />
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Cautăm...</span>
                </div>
              )}

              {error && (
                <p className="text-center text-red-500">{error}</p>
              )}

              {!loading && results.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {results.map((listing) => (
                    <a
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="block bg-card rounded-lg overflow-hidden border hover:border-primary transition-colors"
                    >
                      <div className="aspect-[4/3] relative bg-muted">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium truncate text-sm">{listing.title}</h3>
                        <p className="text-sm font-bold text-primary">
                          {new Intl.NumberFormat('ro-RO', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(listing.price)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {!loading && results.length === 0 && !error && selectedImage && (
                <p className="text-center text-muted-foreground py-8">
                  Nu am găsit anunțuri similare
                </p>
              )}

              <button
                onClick={() => {
                  setSelectedImage(null)
                  setResults([])
                  fileInputRef.current?.click()
                }}
                className="w-full py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Încarcă altă imagine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}