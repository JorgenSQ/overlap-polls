const PREFIX = "overlap-edit-";
const ORGANIZER_PREFIX = "overlap-organizer-";

export function saveEditToken(pollId: string, editToken: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + pollId, editToken);
  } catch {
    /* quota */
  }
}

export function getEditToken(pollId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PREFIX + pollId);
  } catch {
    return null;
  }
}

export function clearEditToken(pollId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PREFIX + pollId);
  } catch {
    /* ignore */
  }
}

export function saveOrganizerToken(pollId: string, token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORGANIZER_PREFIX + pollId, token);
  } catch {
    /* quota */
  }
}

export function getOrganizerToken(pollId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ORGANIZER_PREFIX + pollId);
  } catch {
    return null;
  }
}
