import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'white' | 'cream' | 'leaf' | 'wash'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const tones = {
  white: 'bg-white border-line',
  cream: 'bg-cream-50 border-line',
  leaf: 'bg-leaf-50 border-leaf-200',
  wash: 'panel-wash border-line',
} as const

const paddings = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-7',
  lg: 'p-6 sm:p-9',
} as const

export function Card({
  tone = 'white',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-panel border shadow-card',
        tones[tone],
        paddings[padding],
        className,
      )}
      {...props}
    />
  )
}
