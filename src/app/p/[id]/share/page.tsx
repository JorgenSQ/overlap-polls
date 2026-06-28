import { notFound } from "next/navigation";
import { SharePanel } from "@/components/SharePanel";
import { prisma } from "@/lib/db";
import { serializePoll } from "@/lib/poll";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({ where: { id } });
  if (!poll) return { title: "Poll not found" };
  return { title: `Share · ${poll.title}` };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { slots: true, responses: { include: { votes: true } } },
  });
  if (!poll) notFound();

  const data = serializePoll(poll);

  return (
    <SharePanel
      pollId={poll.id}
      title={poll.title}
      closedAt={data.closedAt}
      selectedSlot={data.selectedSlot}
    />
  );
}
