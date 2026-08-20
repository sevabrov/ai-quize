import { useEffect, useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import {
  ArrowLeft,
  CalendarCheck,
  CircleCheckBig,
  Clock3,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { MihiTeaser } from '../components/MihiTeaser';
import { OlenaPortrait } from '../components/OlenaPortrait';
import { Robot } from '../components/Robot';
import { RobotBubble } from '../components/RobotBubble';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { bookingContent } from '../data/content';
import { env } from '../lib/env';

/** Дата бронювання людською мовою; порожній рядок, якщо часу немає. */
function formatBookedAt(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface BookingScreenProps {
  onBack: () => void;
  onBooked: (detail: unknown) => void;
  onMihiClick: () => void;
  /** Чи готовий уже AI-аналіз - щоб показати шлях назад до нього */
  analysisReady: boolean;
  /** Зустріч уже заброньовано (переживає F5) - календар більше не показуємо */
  alreadyBooked: boolean;
  /** ISO-час бронювання - для плашки підтвердження */
  bookedAt: string | null;
}

export function BookingScreen({
  onBack,
  onBooked,
  onMihiClick,
  analysisReady,
  alreadyBooked,
  bookedAt,
}: BookingScreenProps) {
  const [booked, setBooked] = useState(alreadyBooked);

  // Замок, який приїхав із сервера вже після монтування екрана
  useEffect(() => {
    if (alreadyBooked) setBooked(true);
  }, [alreadyBooked]);

  /* Ініціалізація embed: брендові кольори системи + підписка на успішне бронювання */
  useEffect(() => {
    // Заброньовано - embed не потрібен: ні календаря, ні підписки на подію
    if (alreadyBooked) return;

    let cancelled = false;

    void (async () => {
      try {
        const cal = await getCalApi({ namespace: env.calNamespace });
        if (cancelled) return;

        cal('ui', {
          theme: 'light',
          hideEventTypeDetails: false,
          layout: 'month_view',
          cssVarsPerTheme: {
            light: {
              'cal-brand': '#74954f',
              'cal-bg': '#ffffff',
              'cal-bg-emphasis': '#f2f6ec',
              'cal-border': '#e6e1d2',
              'cal-text': '#232b1e',
              'cal-text-emphasis': '#232b1e',
            },
            dark: {
              'cal-brand': '#91b06c',
            },
          },
        });

        cal('on', {
          action: 'bookingSuccessful',
          callback: (event: unknown) => {
            setBooked(true);
            const detail =
              event && typeof event === 'object' && 'detail' in event
                ? (event as { detail: unknown }).detail
                : event;
            onBooked(detail);
          },
        });
      } catch (error) {
        console.warn('[quiz] Cal.com embed не ініціалізувався:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='animate-screen-in space-y-6'>
      {/* ───── запрошення ───── */}
      <Card padding='lg'>
        <div className='grid gap-7 md:grid-cols-[auto_1fr] md:items-center md:gap-8'>
          <div className='mx-auto size-28 shrink-0 overflow-hidden rounded-full ring-4 ring-leaf-100 md:mx-0 md:size-32'>
            <OlenaPortrait />
          </div>

          <div>
            <div className='flex flex-wrap items-center gap-2.5'>
              <span className='eyebrow text-leaf-600'>Особистий розбір</span>
              {booked && (
                <span className='flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-[0.6875rem] font-semibold text-leaf-700'>
                  <CircleCheckBig className='size-3.5' strokeWidth={2.5} />
                  Зустріч заброньовано
                </span>
              )}
            </div>
            <h1 className='mt-2.5 text-3xl leading-tight sm:text-[2.25rem]'>
              {booked ? bookingContent.bookedTitle : bookingContent.title}
            </h1>
            <p className='mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-soft'>
              {booked ? bookingContent.bookedSubtitle : bookingContent.subtitle}
            </p>

            <ul className='mt-5 grid gap-2.5 sm:grid-cols-2'>
              {[
                { icon: Video, text: bookingContent.zoom },
                { icon: Clock3, text: '30 хвилин особистої розмови' },
                {
                  icon: ShieldCheck,
                  text: 'Конфіденційно, без публічних зобов’язань',
                },
                {
                  icon: CalendarCheck,
                  text: booked
                    ? 'Дата й час уже зафіксовані'
                    : 'Обираєш дату й час сама',
                },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className='flex items-start gap-2.5'>
                  <span className='mt-px grid size-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-600'>
                    <Icon className='size-3.5' strokeWidth={2.5} />
                  </span>
                  <span className='text-[0.8125rem] leading-relaxed text-ink-soft'>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mt-7 flex items-start gap-4 rounded-card border border-leaf-200 bg-leaf-50/60 p-4 sm:p-5'>
          <Robot
            pose={booked ? 'celebrate' : 'wave'}
            className='h-20 shrink-0 sm:h-24'
            floating={false}
          />
          <RobotBubble
            text={booked ? bookingContent.bookedRobot : bookingContent.value}
            tail='left'
            typing={false}
            className='max-w-xl border-leaf-200'
          />
        </div>
      </Card>

      {/* ───── календар / підтвердження ───── */}
      {booked ? (
        // 1 бронювання = 1 користувач: календар більше не показуємо навіть після F5
        <Card padding='lg'>
          <div className='flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left'>
            <span className='grid size-12 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-600'>
              <CircleCheckBig className='size-6' strokeWidth={2.5} />
            </span>

            <div>
              <h2 className='text-lg sm:text-xl'>Зустріч уже заброньовано</h2>
              {formatBookedAt(bookedAt) && (
                <p className='mt-1.5 text-xs font-semibold text-leaf-600'>
                  Записано {formatBookedAt(bookedAt)}
                </p>
              )}
              <p className='mt-2.5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-soft'>
                Олена отримала твій запис - підтвердження й посилання на ZOOM
                прийдуть на твою електронну пошту. Записуватись повторно не
                потрібно.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding='none' className='overflow-hidden'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7'>
            <div>
              <h2 className='text-lg sm:text-xl'>Обери зручні дату та час</h2>
              <p className='mt-1 text-xs text-ink-muted'>
                Календар Олени · вільні слоти оновлюються автоматично
              </p>
            </div>
          </div>

          <div className='min-h-150 bg-white'>
            <Cal
              namespace={env.calNamespace}
              calLink={env.calLink}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '600px',
                overflow: 'scroll',
              }}
              config={{ layout: 'month_view', theme: 'light' }}
            />
          </div>

          <div className='border-t border-line bg-cream-50 px-5 py-3.5 text-xs text-ink-muted sm:px-7'>
            Якщо календар не завантажився -{' '}
            <a
              href={`https://cal.com/${env.calLink}`}
              target='_blank'
              rel='noopener noreferrer'
              className='font-semibold text-leaf-600 underline decoration-leaf-300 underline-offset-2 hover:text-leaf-700'
            >
              відкрити календар Олени в новій вкладці
            </a>
          </div>
        </Card>
      )}

      <MihiTeaser onOpen={onMihiClick} />

      <div className='flex justify-center'>
        <Button variant='ghost' size='sm' onClick={onBack}>
          <ArrowLeft className='size-3.5' strokeWidth={2.75} />
          {analysisReady
            ? 'Повернутись до AI-аналізу'
            : 'Повернутись до результату'}
        </Button>
      </div>
    </div>
  );
}
