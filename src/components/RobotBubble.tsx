import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '../lib/cn'

interface RobotBubbleProps {
  text: string
  /** Куди дивиться «хвостик» */
  tail?: 'left' | 'bottom' | 'none'
  /** Підпис над текстом */
  title?: string
  className?: string
  /** Імітація друкування перед появою нового тексту */
  typing?: boolean
}

/**
 * Віконце з реакцією AI-помічника. За ТЗ з'являється після кожної відповіді —
 * тому нова реакція спочатку «набирається», а потім показується.
 */
export function RobotBubble({
  text,
  tail = 'left',
  title,
  className,
  typing = true,
}: RobotBubbleProps) {
  const [shown, setShown] = useState(text)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!typing) {
      setShown(text)
      return
    }
    if (text === shown) return

    setIsTyping(true)
    const timer = setTimeout(() => {
      setShown(text)
      setIsTyping(false)
    }, 520)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, typing])

  return (
    <div
      className={cn(
        'relative max-w-sm rounded-[1.4rem] border border-line bg-white px-5 py-4 shadow-bubble',
        className,
      )}
    >
      {tail === 'left' && (
        <span
          aria-hidden="true"
          className="absolute -left-[7px] top-9 size-3.5 rotate-45 rounded-[3px] border-b border-l border-line bg-white"
        />
      )}
      {tail === 'bottom' && (
        <span
          aria-hidden="true"
          className="absolute -bottom-[7px] left-10 size-3.5 rotate-45 rounded-[3px] border-r border-b border-line bg-white"
        />
      )}

      {title && (
        <div className="mb-2 flex items-center gap-1.5 text-leaf-600">
          <Sparkles className="size-3.5" strokeWidth={2.5} />
          <span className="eyebrow">{title}</span>
        </div>
      )}

      {isTyping ? (
        <div className="flex items-center gap-1.5 py-1.5" aria-label="AI-помічник друкує">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-leaf-400 animate-typing"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
      ) : (
        <p
          key={shown}
          className="animate-bubble-in text-[0.9375rem] leading-relaxed text-ink-soft"
        >
          {shown}
        </p>
      )}
    </div>
  )
}
