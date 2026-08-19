import { formatClock } from '../hooks/useCountdown'
import { cn } from '../lib/cn'

interface CountdownRingProps {
  remainingMs: number
  totalMs: number
  className?: string
  size?: number
}

/** Кільцевий таймер із макета (05:00 у зеленому колі). */
export function CountdownRing({
  remainingMs,
  totalMs,
  className,
  size = 132,
}: CountdownRingProps) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const progress = totalMs > 0 ? remainingMs / totalMs : 0
  const dash = circumference * Math.max(0, Math.min(1, progress))

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="timer"
      aria-live="off"
    >
      <svg viewBox="0 0 110 110" className="size-full -rotate-90">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="var(--color-cream-300)"
          strokeWidth="7"
          opacity="0.7"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="url(#countdown-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-300 ease-linear"
        />
        <defs>
          <linearGradient id="countdown-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b0c992" />
            <stop offset="100%" stopColor="#5f7e3f" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-2xl font-extrabold tabular-nums text-ink">
          {formatClock(remainingMs)}
        </span>
      </div>
    </div>
  )
}
