import { ArrowUpRight, Globe2, Sparkles, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { env } from '../lib/env';
import { asset } from '../lib/asset';
import { cn } from '../lib/cn';

const LOGO_SRC = asset('/mihi-logo.svg');

/**
 * Блок MIHI з макета. Показується під час очікування аналізу
 * та на екрані запису - за сценарієм із ТЗ.
 */
export function MihiTeaser({
  onOpen,
  className,
  variant = 'full',
}: {
  onOpen?: () => void;
  className?: string;
  variant?: 'full' | 'compact';
}) {
  const link = (
    <Button
      asChild
      variant={variant === 'full' ? 'primary' : 'secondary'}
      size={variant === 'full' ? 'md' : 'sm'}
    >
      <a
        href={env.mihiUrl}
        target='_blank'
        rel='noopener noreferrer'
        onClick={onOpen}
      >
        Дивитись проєкт MIHI
        <ArrowUpRight className='size-4' strokeWidth={2.75} />
      </a>
    </Button>
  );

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-4 rounded-card border border-leaf-200 bg-leaf-50/70 p-4',
          className,
        )}
      >
        <MihiLogo className='h-12 w-28 shrink-0' />
        <div className='min-w-40 flex-1'>
          <p className='font-display text-sm font-extrabold text-ink'>
            MIHI - нове покоління можливостей
          </p>
          <p className='mt-1 text-xs leading-relaxed text-ink-muted'>
            Поки ти очікуєш результати АІ аналізу, маєш можливість подивитися,
            який бізнес обрала зараз для себе Олена.
          </p>
        </div>
        {link}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-panel border border-line panel-wash shadow-card',
        className,
      )}
    >
      <div className='grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1.1fr_0.9fr]'>
        <div>
          <h3 className='text-2xl sm:text-[1.75rem]'>
            MIHI - нове покоління можливостей
          </h3>
          <p className='mt-3 text-sm leading-relaxed text-ink-soft'>
            Сучасний продукт · Міжнародна система · Підтримка лідерів.
            Інструменти AI та автоматизації для твого зростання.
          </p>

          <ul className='mt-5 grid gap-2.5 text-sm text-ink-soft sm:grid-cols-2'>
            {[
              { icon: Sparkles, text: 'Сучасний якісний продукт' },
              { icon: Globe2, text: 'Єдина система в країнах Європи' },
              { icon: Users, text: 'Середовище сильних лідерів' },
              { icon: Sparkles, text: 'AI та автоматизація в основі' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className='flex items-center gap-2'>
                <span className='grid size-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-600'>
                  <Icon className='size-3.5' strokeWidth={2.5} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className='mt-6'>{link}</div>
        </div>

        <MihiLogo className='mx-auto h-32 w-full max-w-72' />
      </div>
    </div>
  );
}

/** Логотип MIHI з public/mihi-logo.svg. */
function MihiLogo({ className }: { className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt='MIHI'
      loading='lazy'
      decoding='async'
      className={cn('object-contain', className)}
    />
  );
}
