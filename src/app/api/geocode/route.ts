import { NextResponse } from "next/server";
import type { GeocodeResult } from "@/lib/location";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

interface NominatimItem {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
}

function shortLabel(item: NominatimItem): string {
  if (item.name) return item.name;
  const parts = item.display_name.split(",");
  return parts.slice(0, 2).join(",").trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = new URL(NOMINATIM);
    url.searchParams.set("format", "json");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "6");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Overlap-Scheduling-App/1.0 (scheduling poll)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Search failed" }, { status: 502 });
    }

    const data = (await res.json()) as NominatimItem[];
    const results: GeocodeResult[] = data.map((item) => ({
      label: shortLabel(item),
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
