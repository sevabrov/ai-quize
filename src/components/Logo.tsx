import { cn } from '../lib/cn';

interface LogoProps {
  className?: string;
  /** compact - для шапки квізу, full - для герою */
  size?: 'compact' | 'full';
}

export function Logo({ className, size = 'compact' }: LogoProps) {
  const compact = size === 'compact';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className='leading-none'>
        <div
          className={cn(
            'font-display font-extrabold uppercase text-ink',
            compact
              ? 'text-[0.6875rem] tracking-[0.1em]'
              : 'text-sm tracking-[0.08em]',
          )}
        >
          AI-діагностика
          <br />
          потенціалу
        </div>
        {!compact && (
          <div className='mt-1 text-xs text-ink-muted'>від Олени Філатової</div>
        )}
      </div>
    </div>
  );
}
