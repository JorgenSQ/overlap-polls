"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Eyebrow, Input, Label, PageTitle } from "@/components/ui";
import { LocationCard } from "@/components/LocationCard";
import { fmtDateRange, fmtTime } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import { getEditToken, saveEditToken } from "@/lib/storage";
import type { PollData, VoteValue } from "@/lib/types";

interface RespondFormProps {
  poll: PollData;
}

const VOTE_COLORS: Record<VoteValue, string> = {
  yes: "var(--color-vote-yes)",
  maybe: "var(--color-vote-maybe)",
  no: "var(--color-vote-no)",
};

const SEG_BASE =
  "cursor-pointer font-semibold text-[13px] py-2 w-16 rounded-[var(--radius-sm)] border transition-colors";

function voteBtn(
  active: boolean,
  vote: VoteValue,
  label: string,
  onClick: () => void,
) {
  const color = VOTE_COLORS[vote];
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? `${SEG_BASE} text-white border-transparent`
          : `${SEG_BASE} bg-white text-muted border-border-input hover:border-coral`
      }
      style={active ? { background: color, borderColor: color } : undefined}
    >
      {label}
    </button>
  );
}

export function RespondForm({ poll }: RespondFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [votes, setVotes] = useState<Record<string, VoteValue | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editToken, setEditToken] = useState<string | null>(null);

  const isClosed = poll.closedAt != null;
  const finalSlot = poll.selectedSlot;

  useEffect(() => {
    const token = getEditToken(poll.id);
    if (!token) return;

    setEditToken(token);
    const existing = poll.responses.find((r) => r.editToken === token);
    if (existing) {
      setName(existing.name);
      const v: Record<string, VoteValue | null> = {};
      for (const slot of poll.slots) {
        v[slot.id] = existing.votes[slot.id] ?? null;
      }
      setVotes(v);
    }
  }, [poll]);

  const setVote = useCallback((slotId: string, value: VoteValue) => {
    setVotes((prev) => ({
      ...prev,
      [slotId]: prev[slotId] === value ? null : value,
    }));
  }, []);

  const answered = poll.slots.filter((s) => votes[s.id]).length;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const votePayload: Record<string, VoteValue> = {};
    for (const slot of poll.slots) {
      votePayload[slot.id] = votes[slot.id] ?? "no";
    }

    try {
      const res = await fetch(`/api/polls/${poll.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Guest",
          votes: votePayload,
          editToken: editToken ?? undefined,
        }),
      });

      let data: { error?: string; editToken?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Server route not found — restart the dev server (npm run dev)"
              : `Server error (${res.status})`,
          );
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit");
      }

      if (!data?.editToken) {
        throw new Error("Invalid server response");
      }

      saveEditToken(poll.id, data.editToken);
      router.push(`/p/${poll.id}/results`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(
        msg === "Failed to fetch" || msg === "fetch failed"
          ? "Cannot reach server — make sure npm run dev is running"
          : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  if (isClosed) {
    return (
      <div className="max-w-[640px] mx-auto text-center">
        <Eyebrow>{poll.title}</Eyebrow>
        <PageTitle>Poll closed</PageTitle>
        {finalSlot ? (
          <>
            <p className="text-muted text-[15px] -mt-4 mb-5">
              The organizer picked a final time. New responses are no longer
              accepted.
            </p>
            <div className="bg-best border border-best-border rounded-[var(--radius-lg)] px-6 py-5 mb-6">
              <div className="text-xs font-bold text-coral-deep uppercase tracking-wide mb-2">
                Final time
              </div>
              <div className="font-[family-name:var(--font-display)] text-[25px] font-bold tracking-tight leading-tight">
                {fmtDateRange(finalSlot.date, finalSlot.endDate)} ·{" "}
                {fmtTime(finalSlot.time)}
              </div>
            </div>
            <Button
              onClick={() =>
                downloadIcs(
                  finalSlot,
                  poll.title,
                  poll.location,
                  poll.durationMin,
                )
              }
              className="mb-4"
            >
              ＋ Add to calendar
            </Button>
          </>
        ) : (
          <p className="text-muted text-[15px] -mt-4 mb-5">
            This poll is closed. New responses are no longer accepted.
          </p>
        )}
        <Link href={`/p/${poll.id}/results`}>
          <Button variant="secondary">View results</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <Eyebrow>{poll.title}</Eyebrow>
      <PageTitle>When can you make it?</PageTitle>

      {poll.description && (
        <p className="text-muted text-[15px] -mt-4 mb-5">{poll.description}</p>
      )}

      {poll.location && (
        <LocationCard
          location={poll.location}
          locationLat={poll.locationLat}
          locationLng={poll.locationLng}
          className="mb-5"
        />
      )}

      <div className="mb-5">
        <Label>Your name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {poll.slots.map((slot) => {
          const my = votes[slot.id] ?? null;
          return (
            <div
              key={slot.id}
              className="flex items-center justify-between gap-3.5 flex-wrap bg-white border border-border rounded-[var(--radius-md)] px-4 py-3.5"
            >
              <div>
                <div className="font-bold text-[15px]">
                  {fmtDateRange(slot.date, slot.endDate)}
                </div>
                <div className="text-[13px] text-muted">{fmtTime(slot.time)}</div>
              </div>
              <div className="flex gap-1.5">
                {voteBtn(my === "yes", "yes", "Yes", () =>
                  setVote(slot.id, "yes"),
                )}
                {voteBtn(my === "maybe", "maybe", "Maybe", () =>
                  setVote(slot.id, "maybe"),
                )}
                {voteBtn(my === "no", "no", "No", () =>
                  setVote(slot.id, "no"),
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-sm text-coral-deep font-medium">{error}</p>
      )}

      <div className="sticky bottom-0 mt-5.5 py-4 bg-cream/95 border-t border-border flex items-center justify-between gap-3.5 flex-wrap">
        <span className="text-sm text-muted">
          {answered} of {poll.slots.length} answered
        </span>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="text-[15px] py-3.5 px-6.5"
        >
          {loading ? "Submitting…" : "Submit availability →"}
        </Button>
      </div>
    </div>
  );
}
