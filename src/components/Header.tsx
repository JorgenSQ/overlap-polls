"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Create" },
  { href: "/demo", label: "Demo" },
] as const;

export function Header() {
  const pathname = usePathname();
  const isPoll = pathname.startsWith("/p/");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3.5 flex-wrap px-5 py-3.5 bg-cream/90 backdrop-blur-[8px] border-b border-border">
      <Link href="/" className="flex items-center gap-2.5 no-underline text-ink">
        <Image
          src="/logo.svg"
          alt=""
          width={30}
          height={30}
          className="rounded-[7px]"
          priority
        />
        <span className="font-[family-name:var(--font-display)] font-extrabold text-[19px] tracking-[-0.02em]">
          Overlap
        </span>
      </Link>

      {!isPoll && (
        <nav className="flex gap-0.5 bg-white border border-border rounded-[var(--radius-md)] p-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-none cursor-pointer font-bold text-sm px-4 py-1.5 rounded-[var(--radius-sm)] no-underline transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "bg-transparent text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {isPoll && (
        <nav className="flex gap-0.5 bg-white border border-border rounded-[var(--radius-md)] p-1 text-sm">
          <PollNavLink pathname={pathname} segment="results" label="Results" />
          <PollNavLink pathname={pathname} segment="" label="Respond" />
        </nav>
      )}
    </header>
  );
}

function PollNavLink({
  pathname,
  segment,
  label,
}: {
  pathname: string;
  segment: "" | "results" | "share";
  label: string;
}) {
  const pollId = pathname.match(/^\/p\/([^/]+)/)?.[1];
  if (!pollId) return null;

  const href =
    segment === ""
      ? `/p/${pollId}`
      : segment === "results"
        ? `/p/${pollId}/results`
        : `/p/${pollId}/share`;

  const active =
    segment === ""
      ? pathname === `/p/${pollId}` || pathname === `/p/${pollId}/`
      : pathname.endsWith(`/${segment}`);

  return (
    <Link
      href={href}
      className={`border-none cursor-pointer font-bold text-sm px-4 py-1.5 rounded-[var(--radius-sm)] no-underline transition-colors ${
        active ? "bg-ink text-white" : "bg-transparent text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
