import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-4xl mb-4">🔍</div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
        Poll not found
      </h1>
      <p className="text-muted mb-6">
        This link may have expired or the poll was removed.
      </p>
      <Link
        href="/"
        className="inline-block bg-coral text-white font-bold text-sm px-5 py-3 rounded-[var(--radius-sm)] no-underline hover:bg-coral-dark"
      >
        Create a new poll
      </Link>
    </div>
  );
}
