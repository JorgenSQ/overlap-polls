import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "coral" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-hover border-none",
  coral:
    "bg-coral text-white hover:bg-coral-dark border-none",
  secondary:
    "bg-white border border-border-input text-muted-dark hover:border-coral",
  ghost:
    "bg-transparent border-none text-ghost hover:text-coral",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "coral",
  children,
  fullWidth,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`cursor-pointer font-bold text-sm px-5 py-3 rounded-[var(--radius-sm)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Label({
  children,
  optional,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block text-[13px] font-bold text-muted-dark tracking-wide mb-1.5">
      {children}
      {optional && (
        <span className="text-placeholder font-medium"> · optional</span>
      )}
    </label>
  );
}

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-4 py-3 border border-border-input rounded-[var(--radius-md)] bg-white text-[15px] text-ink ${className}`}
      {...props}
    />
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold text-coral tracking-[0.12em] uppercase mb-2">
      {children}
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-[family-name:var(--font-display)] text-[32px] leading-tight tracking-[-0.02em] m-0 mb-6">
      {children}
    </h1>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-border rounded-[var(--radius-lg)] p-5.5 ${className}`}
    >
      {children}
    </div>
  );
}
