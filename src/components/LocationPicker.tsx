"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui";
import { LocationMapLazy } from "@/components/LocationMapLazy";
import type { GeocodeResult, PlaceValue } from "@/lib/location";
import { hasCoordinates } from "@/lib/location";

interface LocationPickerProps {
  value: PlaceValue;
  onChange: (place: PlaceValue) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [query, setQuery] = useState(value.label);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value.label);
  }, [value.label]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = (await res.json()) as GeocodeResult[];
        setResults(data);
        setHighlight(0);
        setOpen(data.length > 0);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (text: string) => {
    setQuery(text);
    onChange({ label: text, lat: undefined, lng: undefined });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 400);
  };

  const selectResult = (result: GeocodeResult) => {
    setQuery(result.label);
    onChange({ label: result.address, lat: result.lat, lng: result.lng });
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    setQuery("");
    onChange({ label: "" });
    setResults([]);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectResult(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showMap = hasCoordinates(value);

  return (
    <div ref={containerRef}>
      <Label optional>Location</Label>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              📍
            </span>
            <input
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search an address or type a place…"
              autoComplete="off"
              className="w-full pl-10 pr-4 py-3 border border-border-input rounded-[var(--radius-md)] bg-white text-[15px] text-ink"
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                …
              </span>
            )}
          </div>
          {query && (
            <button
              type="button"
              onClick={clear}
              className="flex-none w-[42px] h-[42px] rounded-[var(--radius-md)] border border-border-input bg-white text-placeholder cursor-pointer text-lg hover:border-coral hover:text-coral"
              aria-label="Clear location"
            >
              ×
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-border rounded-[var(--radius-md)] shadow-sm overflow-hidden max-h-56 overflow-y-auto list-none m-0 p-0">
            {results.map((r, i) => (
              <li key={`${r.lat}-${r.lng}-${i}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectResult(r)}
                  className={`w-full text-left px-4 py-3 border-none cursor-pointer transition-colors ${
                    i === highlight ? "bg-best" : "bg-white hover:bg-cream"
                  }`}
                >
                  <div className="font-semibold text-sm text-ink">{r.label}</div>
                  <div className="text-xs text-muted mt-0.5 line-clamp-2">
                    {r.address}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted mt-1.5">
        Search for an address or type freely — e.g. Maria&apos;s place, Zoom
      </p>

      {showMap && (
        <div className="mt-3 border border-border rounded-[var(--radius-md)] overflow-hidden">
          <LocationMapLazy lat={value.lat} lng={value.lng} className="h-44" />
        </div>
      )}
    </div>
  );
}
