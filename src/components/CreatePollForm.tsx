"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocationPicker } from "@/components/LocationPicker";
import {
  Button,
  Card,
  Eyebrow,
  Input,
  Label,
  PageTitle,
} from "@/components/ui";
import type { PlaceValue } from "@/lib/location";
import { hasCoordinates } from "@/lib/location";
import { saveOrganizerToken } from "@/lib/storage";
import type { CreatePollResponse, SlotInput } from "@/lib/types";

interface DraftSlot {
  id: string;
  date: string;
  endDate: string;
  time: string;
}

let slotCounter = 0;
function newSlot(): DraftSlot {
  return { id: `d${++slotCounter}`, date: "", endDate: "", time: "" };
}

export function CreatePollForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState<PlaceValue>({ label: "" });
  const [description, setDescription] = useState("");
  const [slots, setSlots] = useState<DraftSlot[]>([newSlot()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateSlot = (
    id: string,
    field: "date" | "endDate" | "time",
    value: string,
  ) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const addSlot = () => setSlots((prev) => [...prev, newSlot()]);

  const removeSlot = (id: string) => {
    setSlots((prev) =>
      prev.length > 1 ? prev.filter((s) => s.id !== id) : prev,
    );
  };

  const handleSubmit = async () => {
    setError("");
    const validSlots: SlotInput[] = [];
    for (const s of slots.filter((s) => s.date)) {
      if (s.endDate && s.endDate < s.date) {
        setError("End date must be on or after the start date.");
        return;
      }
      validSlots.push({
        date: s.date,
        endDate:
          s.endDate && s.endDate !== s.date ? s.endDate : undefined,
        time: s.time || "12:00",
      });
    }

    if (validSlots.length === 0) {
      setError("Add at least one date with a time.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled poll",
          location: place.label.trim() || undefined,
          locationLat: hasCoordinates(place) ? place.lat : undefined,
          locationLng: hasCoordinates(place) ? place.lng : undefined,
          description: description.trim() || undefined,
          slots: validSlots,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create poll");
      }

      const poll = (await res.json()) as CreatePollResponse;
      saveOrganizerToken(poll.id, poll.organizerToken);
      router.push(`/p/${poll.id}/share`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[640px] mx-auto">
      <Eyebrow>New poll</Eyebrow>
      <PageTitle>What are we planning?</PageTitle>

      <Card className="flex flex-col gap-4.5">
        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dinner with the crew"
          />
        </div>

        <div>
          <LocationPicker value={place} onChange={setPlace} />
        </div>

        <div>
          <Label optional>Notes</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bring a dish, dress casual…"
            rows={2}
            className="w-full px-4 py-3 border border-border-input rounded-[var(--radius-md)] bg-white text-[15px] text-ink resize-none"
          />
        </div>

        <div>
          <Label>Proposed times</Label>
          <div className="flex flex-col gap-2">
            {slots.map((s) => (
              <div key={s.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) => updateSlot(s.id, "date", e.target.value)}
                    aria-label="Start date"
                    className="flex-1 min-w-0 px-3 py-2.5 border border-border-input rounded-[var(--radius-md)] text-sm text-ink bg-white"
                  />
                  <input
                    type="time"
                    value={s.time}
                    onChange={(e) => updateSlot(s.id, "time", e.target.value)}
                    aria-label="Time"
                    className="w-[120px] px-3 py-2.5 border border-border-input rounded-[var(--radius-md)] text-sm text-ink bg-white"
                  />
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(s.id)}
                      className="flex-none w-[38px] h-[38px] rounded-[var(--radius-sm)] border border-border-input bg-white text-placeholder cursor-pointer text-lg hover:border-coral hover:text-coral"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={s.endDate}
                  min={s.date || undefined}
                  onChange={(e) => updateSlot(s.id, "endDate", e.target.value)}
                  aria-label="End date (optional)"
                  placeholder="End date (optional)"
                  className="w-full px-3 py-2 border border-border-input rounded-[var(--radius-md)] text-sm text-muted bg-white"
                />
                <span className="text-[11px] text-ghost -mt-0.5 pl-0.5">
                  End date (optional) — for multi-day events
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="mt-2.5 w-full bg-add-slot border border-dashed border-add-slot-border text-add-slot-text font-semibold text-sm py-2.5 px-3.5 rounded-[var(--radius-sm)] cursor-pointer hover:bg-border"
          >
            ＋ Add another time
          </button>
        </div>
      </Card>

      {error && (
        <p className="mt-3 text-sm text-coral-deep font-medium">{error}</p>
      )}

      <Button
        variant="primary"
        fullWidth
        className="mt-4.5 text-[15px] py-4"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creating…" : "Create poll & get link"}
      </Button>
    </div>
  );
}
