import { useEffect, useState } from 'react'

/**
 * Відлік до абсолютного моменту часу. Прив'язка до timestamp, а не до інтервалу,
 * тому таймер залишається правильним після перезавантаження сторінки
 * і після того, як браузер приспав таб.
 */
export function useCountdown(targetAt: number | null, onComplete?: () => void) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (targetAt === null) return
    if (Date.now() >= targetAt) {
      onComplete?.()
      return
    }

    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current >= targetAt) {
        clearInterval(timer)
        onComplete?.()
      }
    }

    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
    // onComplete навмисно не в залежностях: колбек стабілізується на місці виклику
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAt])

  const remainingMs = targetAt === null ? 0 : Math.max(0, targetAt - now)

  return {
    remainingMs,
    isDone: targetAt !== null && remainingMs === 0,
    seconds: Math.ceil(remainingMs / 1000),
  }
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatMinutesWord(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60000))
  if (minutes === 1) return '1 хвилину'
  if (minutes >= 2 && minutes <= 4) return `${minutes} хвилини`
  return `${minutes} хвилин`
}
