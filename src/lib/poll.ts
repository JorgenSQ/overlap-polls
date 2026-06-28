import type { Poll, Response, Slot, Vote } from "@prisma/client";
import type { PollData, PollResponse, VoteValue } from "./types";

type PollWithRelations = Poll & {
  slots: Slot[];
  responses: (Response & { votes: Vote[] })[];
};

function serializeSlot(s: Slot) {
  return {
    id: s.id,
    date: s.date,
    endDate: s.endDate,
    time: s.time,
    sortOrder: s.sortOrder,
  };
}

export function serializePoll(poll: PollWithRelations): PollData {
  const slots = poll.slots
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(serializeSlot);
  const selectedSlot = poll.selectedSlotId
    ? (slots.find((s) => s.id === poll.selectedSlotId) ?? null)
    : null;

  return {
    id: poll.id,
    title: poll.title,
    location: poll.location,
    locationLat: poll.locationLat,
    locationLng: poll.locationLng,
    description: poll.description,
    durationMin: poll.durationMin,
    createdAt: poll.createdAt.toISOString(),
    closedAt: poll.closedAt?.toISOString() ?? null,
    selectedSlotId: poll.selectedSlotId,
    selectedSlot,
    slots,
    responses: poll.responses.map((r) => serializeResponse(r)),
  };
}

export function serializeResponse(
  r: Response & { votes: Vote[] },
): PollResponse {
  const votes: Record<string, VoteValue> = {};
  for (const v of r.votes) {
    votes[v.slotId] = v.value as VoteValue;
  }
  return {
    id: r.id,
    name: r.name,
    editToken: r.editToken,
    votes,
    createdAt: r.createdAt.toISOString(),
  };
}
