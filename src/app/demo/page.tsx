import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function DemoPage() {
  return (
    <div className="max-w-[640px] mx-auto text-center py-8">
      <Image
        src="/logo.svg"
        alt=""
        width={48}
        height={48}
        className="mx-auto mb-4 rounded-[var(--radius-md)]"
      />
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.02em] mb-3">
        Try Overlap
      </h1>
      <p className="text-muted text-[15px] mb-8 leading-relaxed">
        Overlap is a free Doodle alternative. Create a poll, share a unique
        link, and see when everyone can meet — no accounts, no friction.
      </p>
      <div className="flex flex-col gap-3 text-left bg-white border border-border rounded-[var(--radius-lg)] p-6 mb-8">
        <Feature n="1" title="Create a poll">
          Add a title, optional location, and proposed date/time slots.
        </Feature>
        <Feature n="2" title="Share the link">
          Copy one URL and send it to your group via text, email, or Slack.
        </Feature>
        <Feature n="3" title="Collect availability">
          Each person picks Yes, Maybe, or No for every time slot.
        </Feature>
        <Feature n="4" title="Find the best time">
          Results highlight the slot with the most availability. Export to
          calendar with one click.
        </Feature>
      </div>
      <Link href="/">
        <Button variant="primary" className="text-[15px] py-3.5 px-8">
          Create your first poll →
        </Button>
      </Link>
    </div>
  );
}

function Feature({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-none w-7 h-7 rounded-[var(--radius-sm)] bg-best text-coral-deep font-bold text-sm flex items-center justify-center">
        {n}
      </div>
      <div>
        <div className="font-bold text-[15px] mb-0.5">{title}</div>
        <div className="text-muted text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
