import { useMemo } from 'react'
import {
  ArrowRight,
  BrainCircuit,
  CalendarHeart,
  CircleDot,
  Compass,
  Lightbulb,
  Rocket,
  ShieldAlert,
  Sparkles,
  Star,
} from 'lucide-react'
import { CountdownRing } from '../components/CountdownRing'
import { MihiTeaser } from '../components/MihiTeaser'
import { ProfileEmblem } from '../components/ProfileEmblem'
import { Robot } from '../components/Robot'
import { RobotBubble } from '../components/RobotBubble'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { analysisContent } from '../data/content'
import { formatMinutesWord, useCountdown } from '../hooks/useCountdown'
import type { QuizFlow } from '../hooks/useQuizFlow'
import { env } from '../lib/env'
import { secondaryProfiles, type QuizResult } from '../lib/scoring'
import { cn } from '../lib/cn'

interface AnalysisScreenProps {
  flow: QuizFlow
  result: QuizResult
}

export function AnalysisScreen({ flow, result }: AnalysisScreenProps) {
  const { state, actions } = flow
  const startedAt = state.analysisStartedAt ?? Date.now()
  const readyAt = startedAt + env.analysisDelayMs

  const analysis = useCountdown(readyAt, actions.deliverAnalysis)

  if (!analysis.isDone) {
    return (
      <WaitingView
        remainingMs={analysis.remainingMs}
        totalMs={env.analysisDelayMs}
        onMihiClick={actions.registerMihiClick}
        onBooking={actions.goToBooking}
      />
    )
  }

  return <FullAnalysisView flow={flow} result={result} readyAt={readyAt} />
}

/* ───────────────────────── очікування ───────────────────────── */

function WaitingView({
  remainingMs,
  totalMs,
  onMihiClick,
  onBooking,
}: {
  remainingMs: number
  totalMs: number
  onMihiClick: () => void
  onBooking: () => void
}) {
  const steps = [
    {
      when: `Через ${formatMinutesWord(totalMs)}`,
      text: 'Ти отримаєш свій AI-аналіз',
    },
    {
      when: `Через ${formatMinutesWord(totalMs + env.bookingNudgeDelayMs)}`,
      text: 'Надішлемо корисні рекомендації',
    },
    { when: 'Далі', text: 'Пропозиція особистого розбору з Оленою' },
  ]

  return (
    <div className="animate-screen-in space-y-6">
      <Card padding="lg">
        <div className="grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <span className="eyebrow text-leaf-600">AI-аналіз</span>
            <h1 className="mt-2.5 text-3xl leading-tight sm:text-[2.25rem]">
              {analysisContent.waitingTitle}
            </h1>
            <p className="mt-4 text-sm font-semibold text-ink">
              Залишилось {formatMinutesWord(remainingMs)}
            </p>
            <p className="mt-1.5 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
              {analysisContent.waitingLead}
            </p>
          </div>

          <div className="flex justify-center sm:justify-end">
            <CountdownRing remainingMs={remainingMs} totalMs={totalMs} size={140} />
          </div>
        </div>

        <div className="mt-7">
          <MihiTeaser variant="compact" onOpen={onMihiClick} />
        </div>

        {/* таймлайн із макета */}
        <div className="mt-8 border-t border-line pt-7">
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.when} className="relative">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full',
                      i === 0 ? 'bg-leaf-500 text-white' : 'bg-leaf-100 text-leaf-500',
                    )}
                  >
                    <CircleDot className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="font-display text-xs font-extrabold uppercase tracking-[0.06em] text-ink">
                    {step.when}
                  </span>
                </div>
                <p className="mt-2 pl-8.5 text-[0.8125rem] leading-relaxed text-ink-soft">
                  {step.text}
                </p>
                {i < steps.length - 1 && (
                  <span className="absolute left-3 top-8 hidden h-8 w-px bg-line sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card tone="wash" padding="lg">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Robot pose="think" className="h-24 shrink-0" floating={false} />
            <RobotBubble
              text="Не хочеш чекати? Можна одразу обрати час особистого розбору — аналіз усе одно буде готовий."
              tail="left"
              typing={false}
              className="max-w-md"
            />
          </div>
          <Button size="md" variant="secondary" onClick={onBooking} className="shrink-0">
            <CalendarHeart className="size-4" strokeWidth={2.25} />
            Обрати час розбору
          </Button>
        </div>
      </Card>
    </div>
  )
}

/* ───────────────────────── повний аналіз ───────────────────────── */

function FullAnalysisView({
  flow,
  result,
  readyAt,
}: {
  flow: QuizFlow
  result: QuizResult
  readyAt: number
}) {
  const { profile } = result
  const { state, actions } = flow

  const nudgeAt = (state.analysisDeliveredAt ?? readyAt) + env.bookingNudgeDelayMs
  const nudge = useCountdown(nudgeAt)
  const extras = useMemo(() => secondaryProfiles(result), [result])

  return (
    <div className="animate-screen-in space-y-6">
      {/* заголовок */}
      <Card padding="lg">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <span className="eyebrow text-leaf-600">Готово</span>
            <h1 className="mt-2.5 text-3xl leading-tight sm:text-[2.25rem]">
              {analysisContent.readyTitle}
            </h1>
            <div className="mt-4 flex items-center gap-2.5">
              <span className="text-2xl leading-none">{profile.emoji}</span>
              <div>
                <p className="font-display text-lg font-extrabold text-ink">{profile.name}</p>
                <p className="text-sm text-leaf-600">{profile.tagline}</p>
              </div>
            </div>
          </div>
          <div className="grid size-32 shrink-0 place-items-center justify-self-center rounded-panel bg-linear-to-br from-leaf-50 to-leaf-100/60 ring-1 ring-leaf-200/70 sm:justify-self-end">
            <ProfileEmblem variant={profile.emblem} className="size-24" />
          </div>
        </div>
      </Card>

      {/* тіло аналізу */}
      <Card padding="lg" className="space-y-9">
        <Section icon={Compass} title="Твій результат">
          <div className="space-y-3.5">
            {profile.summary.map((text) => (
              <p key={text} className="text-[0.9375rem] leading-relaxed text-ink-soft">
                {text}
              </p>
            ))}
          </div>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Section icon={Star} title="Твої сильні сторони" tone="leaf">
            <BulletList items={profile.strengths} tone="leaf" />
          </Section>

          <Section icon={ShieldAlert} title="Що зараз може стримувати" tone="amber">
            <BulletList items={profile.blockers} tone="amber" />
          </Section>
        </div>

        <Section icon={BrainCircuit} title="Твоя головна точка росту">
          <div className="space-y-3 rounded-card border border-leaf-200 bg-leaf-50/60 p-5">
            {profile.growthPoint.map((text) => (
              <p key={text} className="text-[0.9375rem] leading-relaxed text-ink">
                {text}
              </p>
            ))}
          </div>
        </Section>

        <Section icon={Lightbulb} title="Що тобі зараз підійде">
          <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{profile.fits}</p>
        </Section>

        <Section icon={Rocket} title="Наступний крок">
          <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{profile.nextStep}</p>
        </Section>

        {extras.length > 0 && (
          <Section icon={Sparkles} title="Що ще варто взяти у свій сценарій">
            <div className="grid gap-3 sm:grid-cols-2">
              {extras.map((extra) => (
                <div key={extra.id} className="rounded-card border border-line bg-cream-50 p-4">
                  <p className="flex items-center gap-2 font-display text-sm font-extrabold text-ink">
                    <span className="text-base leading-none">{extra.emoji}</span>
                    {extra.name}
                  </p>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                    {extra.fits}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </Card>

      {/* м'який CTA + сильний CTA після паузи */}
      {nudge.isDone ? (
        <Card tone="leaf" padding="lg" className="animate-rise">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Robot pose="wave" className="h-28 shrink-0" floating={false} />
              <div className="max-w-lg">
                <h3 className="text-xl leading-snug sm:text-2xl">
                  {analysisContent.nudgeTitle}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                  {analysisContent.nudgeText}
                </p>
              </div>
            </div>
            <Button size="lg" onClick={actions.goToBooking} className="shrink-0">
              {analysisContent.ctaBooking}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={2.75}
              />
            </Button>
          </div>
        </Card>
      ) : (
        <Card tone="wash" padding="md" className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-soft">
            Далі я підготую рекомендації — це ще {formatMinutesWord(nudge.remainingMs)}.
          </p>
          <Button size="sm" variant="secondary" onClick={actions.goToBooking}>
            <CalendarHeart className="size-3.5" strokeWidth={2.25} />
            Хочу на розбір
          </Button>
        </Card>
      )}

      <MihiTeaser onOpen={actions.registerMihiClick} />
    </div>
  )
}

/* ───────────────────────── дрібні блоки ───────────────────────── */

function Section({
  icon: Icon,
  title,
  tone = 'default',
  children,
}: {
  icon: typeof Star
  title: string
  tone?: 'default' | 'leaf' | 'amber'
  children: React.ReactNode
}) {
  const tones = {
    default: 'bg-cream-200 text-ink-soft',
    leaf: 'bg-leaf-100 text-leaf-600',
    amber: 'bg-amber-50 text-accent-amber',
  } as const

  return (
    <section>
      <div className="flex items-center gap-2.5">
        <span className={cn('grid size-8 place-items-center rounded-full', tones[tone])}>
          <Icon className="size-4" strokeWidth={2.25} />
        </span>
        <h2 className="text-lg sm:text-xl">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function BulletList({ items, tone }: { items: string[]; tone: 'leaf' | 'amber' }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span
            className={cn(
              'mt-1.5 size-1.5 shrink-0 rounded-full',
              tone === 'leaf' ? 'bg-leaf-400' : 'bg-accent-amber',
            )}
          />
          <span className="text-[0.9375rem] leading-relaxed text-ink-soft first-letter:uppercase">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}
