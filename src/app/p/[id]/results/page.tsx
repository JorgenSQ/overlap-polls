import { notFound } from "next/navigation";
import { ResultsView } from "@/components/ResultsView";
import { prisma } from "@/lib/db";
import { serializePoll } from "@/lib/poll";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { responses: true },
  });
  if (!poll) return { title: "Poll not found" };
  return {
    title: `Results · ${poll.title}`,
    description: `${poll.responses.length} responses so far`,
  };
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    include: {
      slots: true,
      responses: { include: { votes: true } },
    },
  });
  if (!poll) notFound();

  return <ResultsView poll={serializePoll(poll)} />;
}
