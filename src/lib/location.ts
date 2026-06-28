export interface GeocodeResult {
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export interface PlaceValue {
  label: string;
  lat?: number;
  lng?: number;
}

export function mapsUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export function googleMapsUrl(lat: number, lng: number, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function hasCoordinates(
  place: Pick<PlaceValue, "lat" | "lng"> | null | undefined,
): place is PlaceValue & { lat: number; lng: number } {
  return place?.lat != null && place?.lng != null;
}
