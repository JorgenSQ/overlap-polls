"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { fmtDateRange, fmtTime, pollUrl } from "@/lib/format";
import type { PollSlot } from "@/lib/types";

interface SharePanelProps {
  pollId: string;
  title: string;
  closedAt?: string | null;
  selectedSlot?: PollSlot | null;
}

export function SharePanel({ pollId, title, closedAt, selectedSlot }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const url = pollUrl(pollId);
  const isClosed = closedAt != null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* fallback ignored */
    }
  };

  return (
    <div className="max-w-[540px] mx-auto mt-6 text-center">
      <div className="w-[60px] h-[60px] rounded-[var(--radius-lg)] bg-best text-coral flex items-center justify-center text-[30px] mx-auto mb-4.5">
        ✓
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-[30px] leading-tight tracking-[-0.02em] m-0 mb-2">
        {isClosed ? "Poll closed" : "Your poll is live"}
      </h1>
      <p className="text-muted text-[15px] m-0 mb-6.5">
        {isClosed && selectedSlot ? (
          <>
            Final time:{" "}
            <strong className="text-ink">
              {fmtDateRange(selectedSlot.date, selectedSlot.endDate)} ·{" "}
              {fmtTime(selectedSlot.time)}
            </strong>
          </>
        ) : (
          <>
            Send this link to anyone — no account needed. Each person just picks
            the times that work for <strong className="text-ink">{title}</strong>.
          </>
        )}
      </p>

      {!isClosed && (
        <div className="flex items-center gap-2 bg-white border border-border rounded-[var(--radius-md)] py-1.5 pl-4 pr-1.5 mb-3.5">
          <span className="flex-1 text-left text-sm text-muted-dark truncate">
            {url}
          </span>
          <Button onClick={copy} className="flex-none py-2.5 px-4">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}

      <div className="flex gap-2.5 justify-center flex-wrap">
        {!isClosed && (
          <Link href={`/p/${pollId}`}>
            <Button variant="secondary">Preview as participant</Button>
          </Link>
        )}
        <Link href={`/p/${pollId}/results`}>
          <Button variant="primary">View results →</Button>
        </Link>
      </div>
    </div>
  );
}
