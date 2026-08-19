import { ArrowRight, Lock, PartyPopper, Sparkles, Star, Target, TriangleAlert, Sprout } from 'lucide-react'
import { ProfileEmblem } from '../components/ProfileEmblem'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { resultContent } from '../data/content'
import type { QuizResult } from '../lib/scoring'
import { cn } from '../lib/cn'

interface ResultScreenProps {
  result: QuizResult
  onRequestAnalysis: () => void
  onBooking: () => void
}

export function ResultScreen({ result, onRequestAnalysis, onBooking }: ResultScreenProps) {
  const { profile } = result

  const tiles = [
    {
      key: 'strength',
      label: resultContent.tileLabels.strength,
      text: profile.tiles.strength,
      icon: Star,
      tone: 'text-leaf-600 bg-leaf-100',
    },
    {
      key: 'blocker',
      label: resultContent.tileLabels.blocker,
      text: profile.tiles.blocker,
      icon: TriangleAlert,
      tone: 'text-accent-amber bg-amber-50',
    },
    {
      key: 'growth',
      label: resultContent.tileLabels.growth,
      text: profile.tiles.growth,
      icon: Target,
      tone: 'text-accent-rose bg-rose-50',
    },
    {
      key: 'next',
      label: resultContent.tileLabels.next,
      text: profile.tiles.next,
      icon: Sprout,
      tone: 'text-leaf-600 bg-leaf-100',
    },
  ] as const

  return (
    <div className="animate-screen-in">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-white px-4 py-1.5 text-xs font-semibold text-leaf-700 shadow-soft">
          <PartyPopper className="size-4" strokeWidth={2.25} />
          Діагностика завершена
        </span>
        <h1 className="mt-4 text-3xl sm:text-[2.5rem]">{resultContent.ready}</h1>
        <p className="mt-2.5 text-[0.9375rem] text-ink-soft">{resultContent.subtitle}</p>
      </div>

      {/* ───── профіль ───── */}
      <Card padding="lg" className="mt-8">
        <div className="grid gap-7 md:grid-cols-[1fr_13rem] md:items-start md:gap-10">
          <div>
            <div className="flex items-start gap-3">
              <span className="text-3xl leading-none">{profile.emoji}</span>
              <div>
                <h2 className="text-2xl leading-tight sm:text-[2rem]">{profile.name}</h2>
                <p className="mt-2 text-sm font-semibold text-leaf-600">{profile.tagline}</p>
              </div>
            </div>

            <p className="mt-6 label-caps text-ink-muted">Твій результат</p>
            <div className="mt-3 space-y-3.5 text-[0.9375rem] leading-relaxed text-ink-soft">
              {profile.summary.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </div>

          <div className="order-first flex justify-center md:order-none md:pt-2">
            <div className="grid size-44 place-items-center rounded-panel bg-linear-to-br from-leaf-50 to-leaf-100/60 ring-1 ring-leaf-200/70">
              <ProfileEmblem variant={profile.emblem} className="size-32" />
            </div>
          </div>
        </div>

        {/* ───── 4 плитки ───── */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map(({ key, label, text, icon: Icon, tone }) => (
            <div
              key={key}
              className="rounded-card border border-line bg-cream-50 p-4 transition-shadow hover:shadow-soft"
            >
              <span className={cn('grid size-9 place-items-center rounded-full', tone)}>
                <Icon className="size-4.5" strokeWidth={2.25} />
              </span>
              <p className="mt-3 label-caps text-ink-muted">{label}</p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-ink">{text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ───── CTA ───── */}
      <Card tone="wash" padding="lg" className="mt-6">
        <p className="mx-auto max-w-2xl text-center text-[0.9375rem] leading-relaxed text-ink-soft">
          {resultContent.invitation}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" size="lg" onClick={onRequestAnalysis}>
            <Sparkles className="size-4" strokeWidth={2.5} />
            {resultContent.ctaAnalysis}
          </Button>
          <Button size="lg" onClick={onBooking}>
            {resultContent.ctaBooking}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2.75}
            />
          </Button>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
          <Lock className="size-3.5" strokeWidth={2.25} />
          {resultContent.note}
        </p>
      </Card>
    </div>
  )
}
