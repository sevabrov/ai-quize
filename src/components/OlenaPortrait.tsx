import { useState } from 'react'
import { cn } from '../lib/cn'

/**
 * Портрет Олени.
 *
 * Реальне фото підкладається у public/olena.jpg (див. README).
 * Поки файлу немає — рендериться векторний плейсхолдер у стилі системи,
 * тому верстка ніде не «падає» і не показує битих картинок.
 */

const PHOTO_SRC = '/olena.jpg'

export function OlenaPortrait({
  className,
  rounded = 'full',
}: {
  className?: string
  rounded?: 'full' | 'card'
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          'overflow-hidden bg-linear-to-b from-leaf-100 to-cream-200',
          rounded === 'full' ? 'rounded-full' : 'rounded-panel',
          className,
        )}
      >
        <PortraitFallback />
      </div>
    )
  }

  return (
    <img
      src={PHOTO_SRC}
      alt="Олена Філатова"
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        'size-full object-cover',
        rounded === 'full' ? 'rounded-full' : 'rounded-panel',
        className,
      )}
    />
  )
}

/**
 * Стриманий силуетний плейсхолдер: читається як свідоме графічне рішення,
 * а не як невдалий малюнок обличчя.
 */
function PortraitFallback() {
  return (
    <svg viewBox="0 0 200 240" className="size-full" role="img" aria-label="Олена Філатова">
      <defs>
        <linearGradient id="olena-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f7ee" />
          <stop offset="100%" stopColor="#dde6d0" />
        </linearGradient>
        <linearGradient id="olena-figure" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#a8c081" />
          <stop offset="100%" stopColor="#4b6532" />
        </linearGradient>
      </defs>

      <rect width="200" height="240" fill="url(#olena-bg)" />

      {/* дуга з макета */}
      <path
        d="M22 176 C18 78 74 26 146 34"
        stroke="#b0c992"
        strokeWidth="2.5"
        fill="none"
        opacity="0.75"
      />
      <circle cx="146" cy="34" r="4" fill="#91b06c" opacity="0.8" />

      {/* силуетний портрет */}
      <g fill="url(#olena-figure)" opacity="0.92">
        <circle cx="100" cy="104" r="34" />
        <path d="M40 240 C44 188 68 162 100 162 C132 162 156 188 160 240 Z" />
      </g>

      {/* світлий вирізаний «комір» — читається як піджак */}
      <path
        d="M100 162 L84 240 L116 240 Z"
        fill="#f4f7ee"
        opacity="0.9"
      />

      {/* листочок-акцент */}
      <path
        d="M168 206 C155 210 151 223 162 229 C172 224 174 212 168 206 Z"
        fill="#91b06c"
        opacity="0.9"
      />

      <text
        x="100"
        y="222"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="9"
        fontWeight="600"
        fill="#5f7e3f"
        letterSpacing="0.5"
      >
        фото Олени
      </text>
    </svg>
  )
}
