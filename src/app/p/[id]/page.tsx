import { notFound } from "next/navigation";
import { RespondForm } from "@/components/RespondForm";
import { prisma } from "@/lib/db";
import { serializePoll } from "@/lib/poll";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({ where: { id } });
  if (!poll) return { title: "Poll not found" };
  return {
    title: poll.title,
    description: poll.location
      ? `When can you make it? ${poll.location}`
      : "When can you make it?",
  };
}

export default async function RespondPage({ params }: PageProps) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    include: {
      slots: true,
      responses: { include: { votes: true } },
    },
  });
  if (!poll) notFound();

  return <RespondForm poll={serializePoll(poll)} />;
}
