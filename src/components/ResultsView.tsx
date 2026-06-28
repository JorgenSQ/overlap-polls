"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { LocationCard } from "@/components/LocationCard";
import { avatarColor, fmtDateRange, fmtTime, pollUrl } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import {
  computeSlotScores,
  findBestSlotIndex,
  voteCellClass,
  voteMark,
} from "@/lib/scoring";
import { getEditToken, getOrganizerToken } from "@/lib/storage";
import type { PollData, VoteValue } from "@/lib/types";

interface ResultsViewProps {
  poll: PollData;
}

export function ResultsView({ poll: initialPoll }: ResultsViewProps) {
  const router = useRouter();
  const [poll, setPoll] = useState(initialPoll);
  const [copied, setCopied] = useState(false);
  const shareUrl = pollUrl(poll.id);
  const responses = poll.responses;
  const n = responses.length;
  const scores = computeSlotScores(poll.slots, responses);
  const bestIdx = findBestSlotIndex(scores, n);
  const best = bestIdx >= 0 ? poll.slots[bestIdx] : null;
  const bestScore = bestIdx >= 0 ? scores[bestIdx] : null;
  const [myToken, setMyToken] = useState<string | null>(null);
  const [organizerToken, setOrganizerToken] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");

  const isClosed = poll.closedAt != null;
  const finalSlot = poll.selectedSlot ?? best;

  useEffect(() => {
    setPoll(initialPoll);
  }, [initialPoll]);

  useEffect(() => {
    setMyToken(getEditToken(poll.id));
    setOrganizerToken(getOrganizerToken(poll.id));
  }, [poll.id]);

  useEffect(() => {
    if (poll.selectedSlotId) {
      setSelectedSlotId(poll.selectedSlotId);
    } else if (best) {
      setSelectedSlotId(best.id);
    } else if (poll.slots.length > 0) {
      setSelectedSlotId(poll.slots[0].id);
    }
  }, [poll.selectedSlotId, poll.slots, best]);

  const gridCols =
    n > 0
      ? `minmax(120px,1.4fr) repeat(${n}, minmax(42px,1fr))`
      : "minmax(120px,1.4fr)";

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* fallback ignored */
    }
  };

  const handleClosePoll = async () => {
    if (!organizerToken || !selectedSlotId) return;
    setCloseError("");
    setClosing(true);
    try {
      const res = await fetch(`/api/polls/${poll.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerToken,
          selectedSlotId,
          close: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to close poll");
      }
      setPoll(data);
      router.refresh();
    } catch (e) {
      setCloseError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setClosing(false);
    }
  };

  return (
    <div>
      <div className="mb-5.5">
        <div className="text-xs font-bold text-coral tracking-[0.12em] uppercase mb-2">
          Results
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight tracking-[-0.02em] m-0 mb-2.5">
          {poll.title}
        </h1>
        <div className="flex gap-4.5 flex-wrap items-center text-muted text-[15px]">
          {poll.location && (poll.locationLat == null || poll.locationLng == null) && (
            <LocationCard
              location={poll.location}
              variant="compact"
            />
          )}
          <span>
            {n} {n === 1 ? "person" : "people"} responded
          </span>
          {isClosed && (
            <span className="text-xs font-bold text-coral-deep uppercase tracking-wide">
              Closed
            </span>
          )}
        </div>
        {poll.location && poll.locationLat != null && poll.locationLng != null && (
          <LocationCard
            location={poll.location}
            locationLat={poll.locationLat}
            locationLng={poll.locationLng}
            className="mt-4"
          />
        )}
        {poll.description && (
          <p className="text-muted text-[15px] mt-2">{poll.description}</p>
        )}
      </div>

      {isClosed && finalSlot && (
        <div className="flex items-center justify-between gap-4.5 flex-wrap bg-best border border-best-border rounded-[var(--radius-lg)] px-6 py-5 mb-6">
          <div>
            <div className="text-xs font-bold text-coral-deep uppercase tracking-wide mb-2">
              Poll closed — final time
            </div>
            <div className="font-[family-name:var(--font-display)] text-[25px] font-bold tracking-tight leading-tight">
              {fmtDateRange(finalSlot.date, finalSlot.endDate)} · {fmtTime(finalSlot.time)}
            </div>
          </div>
          <Button
            onClick={() =>
              downloadIcs(finalSlot, poll.title, poll.location, poll.durationMin)
            }
            className="whitespace-nowrap"
          >
            ＋ Add to calendar
          </Button>
        </div>
      )}

      {!isClosed && (
        <div className="flex items-center gap-2 flex-wrap bg-white border border-border rounded-[var(--radius-md)] py-1.5 pl-4 pr-1.5 mb-6">
          <span className="text-xs font-bold text-coral tracking-[0.08em] uppercase shrink-0">
            Share this poll
          </span>
          <span className="flex-1 min-w-[120px] text-left text-sm text-muted-dark truncate">
            {shareUrl}
          </span>
          <Button onClick={copyShareLink} className="flex-none py-2.5 px-4">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}

      {!isClosed && best && bestScore && (
        <div className="flex items-center justify-between gap-4.5 flex-wrap bg-best border border-best-border rounded-[var(--radius-lg)] px-6 py-5 mb-6">
          <div>
            <div className="text-xs font-bold text-coral-deep uppercase tracking-wide mb-2">
              ★ Best time so far
            </div>
            <div className="font-[family-name:var(--font-display)] text-[25px] font-bold tracking-tight leading-tight">
              {fmtDateRange(best.date, best.endDate)} · {fmtTime(best.time)}
            </div>
            <div className="text-best-text text-sm mt-1">
              {bestScore.yes} of {n} fully available · {bestScore.maybe} maybe
            </div>
          </div>
          <Button
            onClick={() =>
              downloadIcs(best, poll.title, poll.location, poll.durationMin)
            }
            className="whitespace-nowrap"
          >
            ＋ Add to calendar
          </Button>
        </div>
      )}

      {organizerToken && !isClosed && (
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-5 mb-6">
          <div className="text-xs font-bold text-coral tracking-[0.1em] uppercase mb-3">
            Organizer
          </div>
          <p className="text-muted text-sm m-0 mb-4">
            Pick the final time and close the poll. No one will be able to add
            or change responses after that.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {poll.slots.map((slot) => {
              const isBest = slot.id === best?.id;
              return (
                <label
                  key={slot.id}
                  className={`flex items-center gap-3 cursor-pointer border rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                    selectedSlotId === slot.id
                      ? "border-coral bg-best/40"
                      : "border-border hover:border-border-input"
                  }`}
                >
                  <input
                    type="radio"
                    name="final-slot"
                    value={slot.id}
                    checked={selectedSlotId === slot.id}
                    onChange={() => setSelectedSlotId(slot.id)}
                    className="accent-[var(--color-coral)]"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm">
                      {fmtDateRange(slot.date, slot.endDate)}
                      {isBest && (
                        <span className="text-[11px] text-coral ml-1.5">
                          ★ best
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-muted">{fmtTime(slot.time)}</div>
                  </div>
                </label>
              );
            })}
          </div>
          {closeError && (
            <p className="text-sm text-coral-deep font-medium mb-3">{closeError}</p>
          )}
          <Button
            onClick={handleClosePoll}
            disabled={closing || !selectedSlotId}
            variant="primary"
          >
            {closing ? "Closing…" : "Confirm & close poll"}
          </Button>
        </div>
      )}

      {n > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {responses.map((r, i) => {
              const isYou = myToken && r.editToken === myToken;
              const color = avatarColor(i);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-2 bg-white border border-border rounded-[var(--radius-sm)] py-1 pl-1 pr-3 text-[13px] font-semibold"
                >
                  <div
                    className="w-[22px] h-[22px] rounded-full text-white flex items-center justify-center font-bold text-[11px]"
                    style={{ background: color }}
                  >
                    {(r.name[0] || "?").toUpperCase()}
                  </div>
                  <span>{isYou ? `${r.name} (you)` : r.name}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4.5 overflow-x-auto">
            <div className="flex flex-col gap-1.5 min-w-fit">
              <div
                className="grid gap-1.5 items-center"
                style={{ gridTemplateColumns: gridCols }}
              >
                <div />
                {responses.map((r, i) => (
                  <div key={r.id} className="flex justify-center">
                    <div
                      className="w-[34px] h-[34px] rounded-full text-white flex items-center justify-center font-bold text-sm"
                      style={{ background: avatarColor(i) }}
                      title={r.name}
                    >
                      {(r.name[0] || "?").toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>

              {poll.slots.map((slot, i) => {
                const isBest = !isClosed && i === bestIdx;
                const isFinal = isClosed && slot.id === poll.selectedSlotId;
                return (
                  <div
                    key={slot.id}
                    className={`grid gap-1.5 items-center ${isBest || isFinal ? "bg-best rounded-[var(--radius-md)]" : ""}`}
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    <div className="py-1.5 pl-2 pr-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        {fmtDateRange(slot.date, slot.endDate)}
                        {isBest && (
                          <span className="text-[11px] text-coral">★</span>
                        )}
                        {isFinal && (
                          <span className="text-[11px] text-coral-deep">✓</span>
                        )}
                      </div>
                      <div className="text-[13px] text-muted mt-px">
                        {fmtTime(slot.time)}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          downloadIcs(
                            slot,
                            poll.title,
                            poll.location,
                            poll.durationMin,
                          )
                        }
                        className="mt-1 bg-transparent border-none p-0 cursor-pointer text-[11px] font-semibold text-ghost hover:text-coral"
                      >
                        ＋ calendar
                      </button>
                    </div>
                    {responses.map((r) => {
                      const v = r.votes[slot.id] as VoteValue | undefined;
                      return (
                        <div
                          key={r.id}
                          className={`flex items-center justify-center h-[42px] rounded-[var(--radius-sm)] text-[15px] font-bold ${voteCellClass(v, isBest || isFinal)}`}
                          title={`${r.name}: ${v || "no"}`}
                        >
                          {voteMark(v)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4.5 flex-wrap mt-4 text-[13px] text-muted">
            <Legend mark="✓" className="bg-coral text-white" label="Available" />
            <Legend
              mark="?"
              className="bg-maybe text-maybe-text"
              label="If need be"
            />
            <Legend
              mark="·"
              className="bg-no text-no-text border border-no-border"
              label="Can't"
            />
          </div>

          <div className="mt-6.5 flex gap-2.5 flex-wrap">
            {!isClosed && (
              <Link href={`/p/${poll.id}`}>
                <Button variant="primary">
                  {myToken ? "Edit my availability" : "Add my availability"}
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="secondary">Make my own poll</Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center bg-white border border-dashed border-border-input rounded-[var(--radius-lg)] py-14 px-6">
          <div className="text-[34px] mb-2.5">🗓️</div>
          <div className="font-[family-name:var(--font-display)] text-xl font-bold mb-1.5">
            No responses yet
          </div>
          <div className="text-muted text-[15px] mb-5">
            {isClosed
              ? "This poll was closed before anyone responded."
              : "Share the link, then watch availability roll in."}
          </div>
          {!isClosed && (
            <Link href={`/p/${poll.id}`}>
              <Button>Be the first to respond</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Legend({
  mark,
  className,
  label,
}: {
  mark: string;
  className: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[11px] font-bold ${className}`}
      >
        {mark}
      </span>
      {label}
    </span>
  );
}
