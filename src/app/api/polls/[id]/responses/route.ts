import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateEditToken } from "@/lib/ids";
import { serializeResponse } from "@/lib/poll";
import type { VoteValue } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

interface SubmitBody {
  name: string;
  votes: Record<string, VoteValue>;
  editToken?: string;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as SubmitBody;
    const name = body.name?.trim() || "Guest";

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: { slots: true },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.closedAt) {
      return NextResponse.json(
        { error: "This poll is closed — no new responses accepted" },
        { status: 403 },
      );
    }

    const slotIds = new Set(poll.slots.map((s) => s.id));
    const voteEntries = poll.slots.map((slot) => ({
      slotId: slot.id,
      value: (body.votes?.[slot.id] ?? "no") as VoteValue,
    }));

    for (const v of voteEntries) {
      if (!slotIds.has(v.slotId)) {
        return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
      }
    }

    if (body.editToken) {
      const existing = await prisma.response.findFirst({
        where: { pollId: id, editToken: body.editToken },
        include: { votes: true },
      });

      if (existing) {
        await prisma.$transaction([
          prisma.vote.deleteMany({ where: { responseId: existing.id } }),
          prisma.response.update({
            where: { id: existing.id },
            data: { name },
          }),
          prisma.vote.createMany({
            data: voteEntries.map((v) => ({
              responseId: existing.id,
              slotId: v.slotId,
              value: v.value,
            })),
          }),
        ]);

        const updated = await prisma.response.findUniqueOrThrow({
          where: { id: existing.id },
          include: { votes: true },
        });

        return NextResponse.json(serializeResponse(updated));
      }
    }

    const editToken = generateEditToken();
    const response = await prisma.response.create({
      data: {
        pollId: id,
        name,
        editToken,
        votes: {
          create: voteEntries,
        },
      },
      include: { votes: true },
    });

    return NextResponse.json(serializeResponse(response), { status: 201 });
  } catch (error) {
    console.error("Submit response error:", error);
    const message =
      error instanceof Error &&
      (error.message.includes("does not exist in the current database") ||
        error.message.includes("column"))
        ? "Database schema out of date — run npm run db:push"
        : "Failed to submit response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
