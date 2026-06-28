import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateEditToken, generateOrganizerToken, generatePollId } from "@/lib/ids";
import { serializePoll } from "@/lib/poll";
import type { CreatePollInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePollInput;

    const slots = (body.slots ?? []).filter((s) => s.date?.trim());
    if (slots.length === 0) {
      return NextResponse.json(
        { error: "At least one date is required" },
        { status: 400 },
      );
    }

    for (const s of slots) {
      const end = s.endDate?.trim();
      if (end && end < s.date) {
        return NextResponse.json(
          { error: "End date must be on or after start date" },
          { status: 400 },
        );
      }
    }

    const id = generatePollId();
    const organizerToken = generateOrganizerToken();
    const poll = await prisma.poll.create({
      data: {
        id,
        title: body.title?.trim() || "Untitled poll",
        location: body.location?.trim() || null,
        locationLat: body.locationLat ?? null,
        locationLng: body.locationLng ?? null,
        description: body.description?.trim() || null,
        durationMin: body.durationMin ?? 90,
        organizerToken,
        slots: {
          create: slots.map((s, i) => {
            const end = s.endDate?.trim();
            return {
              date: s.date,
              endDate: end && end !== s.date ? end : null,
              time: s.time?.trim() || "12:00",
              sortOrder: i,
            };
          }),
        },
      },
      include: {
        slots: true,
        responses: { include: { votes: true } },
      },
    });

    return NextResponse.json(
      { ...serializePoll(poll), organizerToken },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create poll error:", error);
    const message =
      error instanceof Error &&
      (error.message.includes("does not exist in the current database") ||
        error.message.includes("column"))
        ? "Database schema out of date — run npm run db:push"
        : "Failed to create poll";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
