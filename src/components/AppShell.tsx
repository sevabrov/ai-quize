import { useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Check,
  CloudOff,
  LogOut,
  Lock,
  Loader2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

type SyncState = 'idle' | 'saving' | 'saved' | 'offline';

interface AppShellProps {
  children: ReactNode;
  /** Вихід на інтро - прогрес зберігається */
  onExit: () => void;
  /** Повне очищення прогресу. Не передається, коли діагностику вже завершено. */
  onRestart?: () => void;
  syncState?: SyncState;
  /** Діагностика завершена - повторне проходження недоступне */
  locked?: boolean;
  /**
   * ТИМЧАСОВО, ДЛЯ ТЕСТУВАННЯ: скинути замок і пройти діагностику ще раз.
   * Передається лише коли повний аналіз уже видано (після 3 хвилин).
   */
  onRetake?: () => void;
  /** Вузький контейнер для екранів-діалогів, широкий - для результату */
  width?: 'narrow' | 'wide';
}

export function AppShell({
  children,
  onExit,
  onRestart,
  syncState = 'idle',
  locked = false,
  onRetake,
  width = 'wide',
}: AppShellProps) {
  return (
    <div className='min-h-dvh hero-wash leaf-veil'>
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full flex-col px-4 pb-12 pt-5 sm:px-6',
          width === 'wide' ? 'max-w-6xl' : 'max-w-3xl',
        )}
      >
        <header className='mb-6 flex items-center justify-between gap-4'>
          <Logo />
          <div className='flex items-center gap-3'>
            {/* Пройти ще раз */}
            {onRetake && <RetakeDialog onRetake={onRetake} />}
            <SyncBadge state={syncState} />
            <ExitDialog onExit={onExit} onRestart={onRestart} locked={locked} />
          </div>
        </header>

        <main className='flex-1'>{children}</main>

        <footer className='mt-10 flex items-center justify-center gap-1.5 text-xs text-ink-muted'>
          <Lock className='size-3.5' strokeWidth={2.25} />
          Конфіденційно. Твої відповіді бачить лише Олена.
        </footer>
      </div>
    </div>
  );
}

function SyncBadge({ state }: { state: SyncState }) {
  if (state === 'idle') return null;

  const map = {
    saving: {
      icon: <Loader2 className='size-3.5 animate-spin' strokeWidth={2.5} />,
      text: 'Зберігаю…',
      tone: 'text-ink-muted',
    },
    saved: {
      icon: <Check className='size-3.5' strokeWidth={3} />,
      text: 'Збережено',
      tone: 'text-leaf-600',
    },
    offline: {
      icon: <CloudOff className='size-3.5' strokeWidth={2.5} />,
      text: 'Локально',
      tone: 'text-ink-muted',
    },
  } as const;

  const item = map[state];

  return (
    <span
      className={cn('hidden items-center gap-1.5 text-xs sm:flex', item.tone)}
      title={
        state === 'offline'
          ? 'Немає зв’язку з сервером - прогрес збережено у браузері'
          : undefined
      }
    >
      {item.icon}
      {item.text}
    </span>
  );
}

/**
 * ТИМЧАСОВО, ДЛЯ ТЕСТУВАННЯ. Кнопка «Пройти ще раз» - з'являється лише коли
 * повний аналіз уже видано (після 3 хвилин очікування). Знімає замок
 * «1 діагностика = 1 користувач» і повністю чистить прогрес.
 *
 * Свідомо в амбер-стилі, як DEMO-плашка, щоб не забути прибрати перед продом.
 */
function RetakeDialog({ onRetake }: { onRetake: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type='button'
          title='Тимчасова кнопка для тестування'
          className='flex items-center gap-1.5 rounded-[0.6rem] border border-amber-200 bg-amber-50/80 px-2 py-1.5 text-xs font-semibold text-accent-amber transition-colors hover:bg-amber-100'
        >
          <RotateCcw className='size-3.5' strokeWidth={2.5} />
          Пройти ще раз
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-40 bg-leaf-900/25 backdrop-blur-[2px]' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 animate-bubble-in rounded-panel border border-line bg-white p-7 shadow-lift'>
          <Dialog.Title className='text-xl'>Пройти діагностику ще раз?</Dialog.Title>
          <Dialog.Description className='mt-3 text-sm leading-relaxed text-ink-soft'>
            Тимчасовий режим для тестування: усі відповіді, результат і запис на
            розбір буде видалено, і квіз почнеться з нуля.
          </Dialog.Description>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Dialog.Close asChild>
              <Button size='md' variant='secondary' block>
                Скасувати
              </Button>
            </Dialog.Close>
            <Button
              size='md'
              block
              onClick={() => {
                setOpen(false);
                onRetake();
              }}
            >
              Так, почати заново
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ExitDialog({
  onExit,
  onRestart,
  locked = false,
}: {
  onExit: () => void;
  onRestart?: () => void;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type='button'
          className='flex items-center gap-1.5 rounded-[0.6rem] px-2 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-white/70 hover:text-leaf-700'
        >
          Вийти
          <LogOut className='size-3.5' strokeWidth={2.5} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-40 bg-leaf-900/25 backdrop-blur-[2px]' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 animate-bubble-in rounded-panel border border-line bg-white p-7 shadow-lift'>
          <Dialog.Title className='text-xl'>
            {locked ? 'Вийти на головну?' : 'Вийти з діагностики?'}
          </Dialog.Title>
          <Dialog.Description className='mt-3 text-sm leading-relaxed text-ink-soft'>
            {locked
              ? 'Твій результат збережений - ти зможеш повернутись до нього з головної сторінки.'
              : 'Прогрес і відповіді збережуться - коли повернешся, продовжимо з того самого питання.'}
          </Dialog.Description>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Dialog.Close asChild>
              <Button size='md' variant='secondary' block>
                {locked ? 'Залишитись' : 'Продовжити квіз'}
              </Button>
            </Dialog.Close>
            <Button
              size='md'
              block
              onClick={() => {
                setOpen(false);
                onExit();
              }}
            >
              Так, вийти
            </Button>
          </div>

          {onRestart && (
            <button
              type='button'
              onClick={() => {
                setOpen(false);
                onRestart();
              }}
              className='mt-5 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-accent-amber'
            >
              <Trash2 className='size-3.5' strokeWidth={2.5} />
              Видалити відповіді й почати заново
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
