"use client";

import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";

const HEIGHTS: Record<string, string> = {
  "h-40": "160px",
  "h-44": "176px",
};

interface LocationMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}

export default function LocationMap({
  lat,
  lng,
  zoom = 15,
  className = "h-44",
}: LocationMapProps) {
  const height = HEIGHTS[className] ?? "176px";

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      className="w-full z-0"
      style={{ height }}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[lat, lng]}
        radius={10}
        pathOptions={{
          color: "#E85A3C",
          fillColor: "#E85A3C",
          fillOpacity: 1,
          weight: 2,
        }}
      />
    </MapContainer>
  );
}
