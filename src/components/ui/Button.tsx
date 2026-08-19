import { Slot } from '@radix-ui/react-slot'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost'
type Size = 'lg' | 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
  block?: boolean
}

const base =
  'group relative inline-flex items-center justify-center gap-2.5 font-display font-extrabold uppercase tracking-[0.06em] ' +
  'transition-all duration-200 ease-out select-none whitespace-nowrap ' +
  'disabled:pointer-events-none disabled:opacity-45'

const variants: Record<Variant, string> = {
  primary:
    'text-white bg-linear-to-b from-leaf-500 to-leaf-600 shadow-soft ' +
    'hover:from-leaf-400 hover:to-leaf-500 hover:shadow-card hover:-translate-y-0.5 ' +
    'active:translate-y-0 active:shadow-soft',
  secondary:
    'text-leaf-700 bg-white border border-line-strong shadow-[0_1px_2px_rgb(35_43_30/0.04)] ' +
    'hover:border-leaf-300 hover:text-leaf-800 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0',
  soft:
    'text-leaf-700 bg-leaf-100/70 border border-leaf-200 hover:bg-leaf-100 hover:border-leaf-300',
  ghost: 'text-ink-soft hover:text-leaf-700 hover:bg-leaf-50',
}

const sizes: Record<Size, string> = {
  lg: 'h-14 px-8 text-[0.8125rem] rounded-field',
  md: 'h-12 px-6 text-xs rounded-field',
  sm: 'h-10 px-4 text-[0.6875rem] rounded-[0.75rem]',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  asChild,
  block,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      // Слот-варіант отримує type від дочірнього елемента
      {...(asChild ? {} : { type })}
      className={cn(base, variants[variant], sizes[size], block && 'w-full', className)}
      {...props}
    />
  )
}
