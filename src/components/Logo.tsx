import { cn } from "../lib/cn";

/** Знак-листок із макета - використовується і в логотипі, і як декоративний елемент. */
export function LeafMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-[0.65rem] bg-linear-to-br from-leaf-100 to-leaf-200/70 ring-1 ring-leaf-200/80",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" aria-hidden="true">
        <path
          d="M19.5 4.2c-6.1-.5-10.4 1.4-12.6 4.4-1.9 2.6-1.8 5.8.2 7.7.4.4.9.7 1.4 1l-1.9 2.4a.9.9 0 0 0 1.4 1.1l2-2.5c2.6.9 5.6.3 7.7-1.9 2.8-2.9 3.7-7.4 1.8-12.2Z"
          fill="url(#leaf-mark-grad)"
        />
        <path
          d="M8.6 17.4C10 13 13.2 9.4 17.4 7.3"
          stroke="#f2f6ec"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <defs>
          <linearGradient id="leaf-mark-grad" x1="4" y1="4" x2="20" y2="20">
            <stop offset="0%" stopColor="#91b06c" />
            <stop offset="100%" stopColor="#4b6532" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

interface LogoProps {
  className?: string;
  /** compact - для шапки квізу, full - для герою */
  size?: "compact" | "full";
}

export function Logo({ className, size = "compact" }: LogoProps) {
  const compact = size === "compact";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LeafMark className={compact ? "size-8" : "size-11"} />
      <div className="leading-none">
        <div
          className={cn(
            "font-display font-extrabold uppercase text-ink",
            compact
              ? "text-[0.6875rem] tracking-[0.1em]"
              : "text-sm tracking-[0.08em]",
          )}
        >
          AI-діагностика
          <br />
          потенціалу
        </div>
        {!compact && (
          <div className="mt-1 text-xs text-ink-muted">від Олени Філатової</div>
        )}
      </div>
    </div>
  );
}
