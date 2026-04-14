'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row']
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapViewProps {
  listings: Listing[]
  center?: [number, number]
  zoom?: number
}

function FlyToListing({ listings }: { listings: Listing[] }) {
  const map = useMap()

  useEffect(() => {
    const listingsWithCoords = listings.filter(l => l.location_lat && l.location_lng)
    if (listingsWithCoords.length === 1) {
      const { location_lat, location_lng } = listingsWithCoords[0]
      map.flyTo([location_lat!, location_lng!], 10, { duration: 1 })
    } else if (listingsWithCoords.length > 1) {
      const bounds = L.latLngBounds(
        listingsWithCoords.map(l => [l.location_lat!, l.location_lng!])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [listings, map])

  return null
}

export default function MapView({ listings, center, zoom }: MapViewProps) {
  const listingsWithCoords = listings.filter(l => l.location_lat && l.location_lng)

  const defaultCenter: [number, number] = center || [48.5, 10.5]
  const defaultZoom = zoom || 4

  const formatPrice = (price: number | null, currency: string | null) => {
    if (price == null) return 'Price on request'
    return `${currency === 'EUR' ? '€' : currency}${price.toLocaleString()}`
  }

  if (listingsWithCoords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center text-gray-500">
          <span className="text-4xl block mb-2">📍</span>
          <p className="font-medium">No listings with location data</p>
          <p className="text-sm mt-1">Add coordinates to listings to show them on the map</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToListing listings={listingsWithCoords} />
        {listingsWithCoords.map(listing => (
          <Marker
            key={listing.id}
            position={[listing.location_lat!, listing.location_lng!]}
            icon={markerIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <Link href={`/listings/${listing.id}`} className="block hover:opacity-80">
                  {listing.images && (listing.images as string[]).length > 0 ? (
                    <img
                      src={(listing.images as string[])[0]}
                      alt={listing.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <span className="text-3xl opacity-50">{listing.categories?.icon || '🚜'}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{listing.title}</h3>
                  <p className="text-green-700 font-black text-base mt-1">
                    {formatPrice(listing.price, listing.currency)}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    {listing.year && <span>{listing.year}</span>}
                    {listing.hours && <span>{listing.hours}h</span>}
                    {listing.location_country && <span>📍 {listing.location_country}</span>}
                  </div>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
