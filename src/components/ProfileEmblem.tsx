import { useId } from 'react'
import type { EmblemVariant } from '../data/profiles'
import { cn } from '../lib/cn'

/**
 * Векторна емблема бізнес-профілю — «кристал» із макета,
 * плюс п'ять варіацій у тій самій пластиці для решти профілів.
 */
export function ProfileEmblem({
  variant,
  className,
}: {
  variant: EmblemVariant
  className?: string
}) {
  const uid = useId().replace(/[:]/g, '')
  const grad = `emblem-grad-${uid}`
  const glow = `emblem-glow-${uid}`
  const light = `emblem-light-${uid}`

  return (
    <svg viewBox="0 0 120 120" className={cn('overflow-visible', className)} aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#cfdfb8" />
          <stop offset="45%" stopColor="#91b06c" />
          <stop offset="100%" stopColor="#4b6532" />
        </linearGradient>
        <linearGradient id={light} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eaf3dc" />
          <stop offset="100%" stopColor="#b0c992" />
        </linearGradient>
        <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#91b06c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#91b06c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="62" r="54" fill={`url(#${glow})`} />

      {variant === 'crystal' && (
        <g>
          <path d="M60 10 L96 44 L60 112 L24 44 Z" fill={`url(#${grad})`} />
          <path d="M60 10 L96 44 L60 56 Z" fill={`url(#${light})`} opacity="0.85" />
          <path d="M60 10 L24 44 L60 56 Z" fill="#ffffff" opacity="0.35" />
          <path
            d="M24 44 L60 56 L96 44"
            stroke="#f2f6ec"
            strokeWidth="1.6"
            fill="none"
            opacity="0.7"
          />
          <path d="M60 56 L60 112" stroke="#f2f6ec" strokeWidth="1.4" opacity="0.5" />
        </g>
      )}

      {variant === 'signal' && (
        <g fill="none" strokeLinecap="round">
          <circle cx="60" cy="62" r="13" fill={`url(#${grad})`} />
          <circle cx="60" cy="62" r="7" fill={`url(#${light})`} opacity="0.9" />
          {[24, 38, 52].map((r, i) => (
            <path
              key={r}
              d={`M ${60 - r * 0.72} ${62 - r * 0.72} A ${r} ${r} 0 0 1 ${60 + r * 0.72} ${62 - r * 0.72}`}
              stroke={`url(#${grad})`}
              strokeWidth={5 - i}
              opacity={0.9 - i * 0.22}
            />
          ))}
          {[24, 38, 52].map((r, i) => (
            <path
              key={`b-${r}`}
              d={`M ${60 - r * 0.72} ${62 + r * 0.72} A ${r} ${r} 0 0 0 ${60 + r * 0.72} ${62 + r * 0.72}`}
              stroke={`url(#${grad})`}
              strokeWidth={5 - i}
              opacity={0.55 - i * 0.14}
            />
          ))}
        </g>
      )}

      {variant === 'compass' && (
        <g>
          <circle
            cx="60"
            cy="62"
            r="44"
            fill="none"
            stroke={`url(#${grad})`}
            strokeWidth="8"
          />
          <circle cx="60" cy="62" r="30" fill="#f2f6ec" opacity="0.6" />
          <path d="M60 30 L74 66 L60 60 Z" fill="#4b6532" />
          <path d="M60 94 L46 58 L60 64 Z" fill={`url(#${light})`} />
          <circle cx="60" cy="62" r="6" fill="#ffffff" stroke="#5f7e3f" strokeWidth="3" />
        </g>
      )}

      {variant === 'crown' && (
        <g>
          <path
            d="M18 88 L26 36 L44 60 L60 26 L76 60 L94 36 L102 88 Z"
            fill={`url(#${grad})`}
          />
          <path d="M60 26 L76 60 L60 66 Z" fill={`url(#${light})`} opacity="0.9" />
          <path d="M60 26 L44 60 L60 66 Z" fill="#ffffff" opacity="0.32" />
          <rect x="18" y="90" width="84" height="14" rx="7" fill="#4b6532" />
          <circle cx="60" cy="46" r="4.5" fill="#f2f6ec" opacity="0.85" />
        </g>
      )}

      {variant === 'circuit' && (
        <g>
          <path
            d="M60 24 L60 50 M60 74 L60 100 M36 62 L60 62 M60 62 L84 62 M40 40 L54 54 M80 40 L66 54 M40 84 L54 70 M80 84 L66 70"
            stroke={`url(#${grad})`}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="60" cy="62" r="16" fill={`url(#${grad})`} />
          <circle cx="60" cy="62" r="8" fill={`url(#${light})`} />
          {[
            [60, 20],
            [60, 104],
            [32, 62],
            [88, 62],
            [36, 36],
            [84, 36],
            [36, 88],
            [84, 88],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5.5" fill="#5f7e3f" />
          ))}
        </g>
      )}

      {variant === 'rocket' && (
        <g>
          <path
            d="M60 12 C76 30 82 52 78 76 L42 76 C38 52 44 30 60 12 Z"
            fill={`url(#${grad})`}
          />
          <path d="M60 12 C76 30 82 52 78 76 L60 76 Z" fill={`url(#${light})`} opacity="0.55" />
          <circle cx="60" cy="46" r="9" fill="#f2f6ec" />
          <circle cx="60" cy="46" r="5" fill="#5f7e3f" />
          <path d="M42 76 L26 96 L44 90 Z" fill="#4b6532" />
          <path d="M78 76 L94 96 L76 90 Z" fill="#4b6532" />
          <path
            d="M52 84 C56 96 56 102 60 112 C64 102 64 96 68 84 Z"
            fill="#b0c992"
            opacity="0.9"
          />
        </g>
      )}
    </svg>
  )
}
