"use client";

import { LocationMapLazy } from "@/components/LocationMapLazy";
import { googleMapsUrl, hasCoordinates } from "@/lib/location";

interface LocationCardProps {
  location: string;
  locationLat?: number | null;
  locationLng?: number | null;
  /** compact = inline text only in headers; full = map + link */
  variant?: "compact" | "full";
  className?: string;
}

export function LocationCard({
  location,
  locationLat,
  locationLng,
  variant = "full",
  className = "",
}: LocationCardProps) {
  if (!location) return null;

  const place = { label: location, lat: locationLat ?? undefined, lng: locationLng ?? undefined };
  const withMap = hasCoordinates(place);

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        📍{" "}
        {withMap ? (
          <a
            href={googleMapsUrl(place.lat, place.lng, location)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-coral underline-offset-2 hover:underline"
          >
            {location}
          </a>
        ) : (
          location
        )}
      </span>
    );
  }

  return (
    <div
      className={`bg-white border border-border rounded-[var(--radius-md)] overflow-hidden ${className}`}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold text-coral uppercase tracking-wide mb-1">
            Where
          </div>
          <div className="font-semibold text-[15px] text-ink leading-snug">
            {location}
          </div>
        </div>
        {withMap && (
          <a
            href={googleMapsUrl(place.lat, place.lng, location)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none text-xs font-bold text-coral hover:text-coral-dark whitespace-nowrap no-underline"
          >
            Open in maps ↗
          </a>
        )}
      </div>
      {withMap && (
        <div className="border-t border-border">
          <LocationMapLazy lat={place.lat} lng={place.lng} className="h-40" />
        </div>
      )}
    </div>
  );
}
