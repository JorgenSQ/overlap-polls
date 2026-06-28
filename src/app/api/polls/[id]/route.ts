import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializePoll } from "@/lib/poll";
import type { ClosePollInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        slots: true,
        responses: { include: { votes: true } },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(serializePoll(poll));
  } catch (error) {
    console.error("Get poll error:", error);
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as ClosePollInput;

    if (!body.organizerToken?.trim()) {
      return NextResponse.json(
        { error: "Organizer token required" },
        { status: 400 },
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: { slots: true },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.organizerToken !== body.organizerToken) {
      return NextResponse.json({ error: "Invalid organizer token" }, { status: 403 });
    }

    if (poll.closedAt) {
      return NextResponse.json({ error: "Poll is already closed" }, { status: 400 });
    }

    const slotIds = new Set(poll.slots.map((s) => s.id));
    const updates: { selectedSlotId?: string; closedAt?: Date } = {};

    if (body.selectedSlotId) {
      if (!slotIds.has(body.selectedSlotId)) {
        return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
      }
      updates.selectedSlotId = body.selectedSlotId;
    }

    if (body.close) {
      const slotId = body.selectedSlotId ?? poll.selectedSlotId;
      if (!slotId) {
        return NextResponse.json(
          { error: "Select a final time before closing" },
          { status: 400 },
        );
      }
      if (!slotIds.has(slotId)) {
        return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
      }
      updates.selectedSlotId = slotId;
      updates.closedAt = new Date();
    }

    if (!updates.selectedSlotId && !updates.closedAt) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.poll.update({
      where: { id },
      data: updates,
      include: {
        slots: true,
        responses: { include: { votes: true } },
      },
    });

    return NextResponse.json(serializePoll(updated));
  } catch (error) {
    console.error("Update poll error:", error);
    return NextResponse.json({ error: "Failed to update poll" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.poll.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }
}
