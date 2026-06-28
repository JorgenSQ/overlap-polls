export type VoteValue = "yes" | "maybe" | "no";

export interface SlotInput {
  date: string;
  endDate?: string;
  time: string;
}

export interface CreatePollInput {
  title: string;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  description?: string;
  durationMin?: number;
  slots: SlotInput[];
}

export interface PollSlot {
  id: string;
  date: string;
  endDate: string | null;
  time: string;
  sortOrder: number;
}

export interface PollResponse {
  id: string;
  name: string;
  editToken: string;
  votes: Record<string, VoteValue>;
  createdAt: string;
}

export interface PollData {
  id: string;
  title: string;
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  description: string | null;
  durationMin: number;
  createdAt: string;
  closedAt: string | null;
  selectedSlotId: string | null;
  selectedSlot: PollSlot | null;
  slots: PollSlot[];
  responses: PollResponse[];
}

export interface CreatePollResponse extends PollData {
  organizerToken: string;
}

export interface ClosePollInput {
  organizerToken: string;
  selectedSlotId?: string;
  close?: boolean;
}

export interface SlotScore {
  yes: number;
  maybe: number;
  no: number;
  score: number;
}

export const AVATAR_COLORS = [
  "#E85A3C",
  "#4F9D69",
  "#3E78C2",
  "#5B8FD4",
  "#D4952F",
  "#2BB0A6",
  "#D6597B",
] as const;
