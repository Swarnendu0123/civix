import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  markerColor?: string;
  address?: string;
}

// Note: In production, this should be an environment variable
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiY2l2aXgtZGVtbyIsImEiOiJjbHl0ZXN0MTIwNjBoMm1wZnY2aHJzc3Z3In0.example'; // Demo token - replace with real token

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  latitude, 
  longitude, 
  zoom = 15,
  className = "w-full h-64 rounded-lg",
  markerColor = "#ef4444",
  address
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: zoom
    });

    // Add navigation control (zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker
    marker.current = new mapboxgl.Marker({ color: markerColor })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add popup if address is provided
    if (address) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<div class="text-sm font-medium">${address}</div>`);
      marker.current.setPopup(popup);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerColor, address]);

  // Handle case when Mapbox token is not available or invalid
  const handleMapError = () => {
    return (
      <div className={`bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">
            <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700 font-medium">Map Preview</p>
          <p className="text-xs text-gray-500">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
          {address && (
            <p className="text-xs text-gray-600 mt-1 max-w-48">{address}</p>
          )}
          <div className="mt-2">
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
            >
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  };

  // For demo purposes, show fallback map since we don't have a real Mapbox token
  if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN.includes('example')) {
    return handleMapError();
  }

  return (
    <div ref={mapContainer} className={className} />
  );
};

export default MapboxMap;