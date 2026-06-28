import type { PollResponse, PollSlot, SlotScore, VoteValue } from "./types";

export function computeSlotScores(
  slots: PollSlot[],
  responses: PollResponse[],
): SlotScore[] {
  return slots.map((slot) => {
    let yes = 0;
    let maybe = 0;
    let no = 0;
    for (const r of responses) {
      const v = r.votes[slot.id];
      if (v === "yes") yes++;
      else if (v === "maybe") maybe++;
      else no++;
    }
    return { yes, maybe, no, score: yes + maybe * 0.5 };
  });
}

export function findBestSlotIndex(scores: SlotScore[], responseCount: number): number {
  if (responseCount === 0) return -1;
  let bestIdx = -1;
  let bestScore = -1;
  scores.forEach((s, i) => {
    if (s.score > bestScore) {
      bestScore = s.score;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export function voteMark(v: VoteValue | undefined): string {
  if (v === "yes") return "✓";
  if (v === "maybe") return "?";
  return "·";
}

export function voteCellClass(
  v: VoteValue | undefined,
  isBestRow = false,
): string {
  if (v === "yes") return "bg-coral text-white";
  if (v === "maybe") return "bg-maybe text-maybe-text";
  if (isBestRow) {
    return "bg-no-best text-no-best-text border border-no-best-border";
  }
  return "bg-no text-no-text border border-no-border";
}
