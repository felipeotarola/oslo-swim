"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface GoogleMapProps {
  center: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    position: { lat: number; lng: number }
    title: string
    info?: string
  }>
  className?: string
  onClick?: (coordinates: { lat: number; lng: number }) => void
}

declare global {
  interface Window {
    google: any
  }
}

export function GoogleMap({ center, zoom = 13, markers = [], className = "", onClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: "weekly",
          libraries: ["places"],
        })

        await loader.load()

        if (mapRef.current && window.google) {
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center,
            zoom,
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#0ea5e9" }],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f0f9ff" }],
              },
            ],
          })

          setMap(mapInstance)
          setIsLoaded(true)
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err)
        setError("Failed to load Google Maps")
      }
    }

    initMap()
  }, [center, zoom])

  useEffect(() => {
    if (map && isLoaded && window.google) {
      // Add click listener to map
      if (onClick) {
        map.addListener("click", (event: any) => {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          onClick({ lat, lng })
        })
      }

      // Clear existing markers by creating new ones (simple approach)
      markers.forEach((marker) => {
        const mapMarker = new window.google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#0ea5e9" stroke="white" strokeWidth="3"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          },
        })

        if (marker.info) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: marker.info,
          })

          mapMarker.addListener("click", () => {
            infoWindow.open(map, mapMarker)
          })
        }
      })
    }
  }, [map, markers, isLoaded, onClick])

  if (error) {
    return (
      <div
        className={`w-full h-full min-h-[400px] rounded-lg bg-gray-100 flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please check your Google Maps API configuration.</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={`w-full h-full min-h-[400px] rounded-lg ${className}`} />
}
