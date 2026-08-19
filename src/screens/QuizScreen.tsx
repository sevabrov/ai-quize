import { useEffect, useMemo, useRef, useState } from 'react'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { ArrowLeft, ArrowRight, Check, PenLine } from 'lucide-react'
import { Robot } from '../components/Robot'
import { RobotBubble } from '../components/RobotBubble'
import { QuizChecklist, QuizProgressBar } from '../components/QuizProgress'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { Question } from '../data/questions'
import { cn } from '../lib/cn'
import type { QuizFlow } from '../hooks/useQuizFlow'

const MIN_ABOUT_LENGTH = 12

export function QuizScreen({ flow }: { flow: QuizFlow }) {
  const { state, question, totalQuestions, actions } = flow
  const selected = state.answers[question.id] ?? ''

  // Скрол до верху при зміні питання
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [question.id])

  const bubbleText = useMemo(() => {
    if (question.kind === 'text') {
      return state.lastReaction ?? question.hint ?? question.title
    }
    if (selected) {
      const option = question.options?.find((o) => o.id === selected)
      if (option) return option.reaction
    }
    return state.lastReaction ?? question.title
  }, [question, selected, state.lastReaction])

  return (
    <div className="animate-screen-in">
      <QuizProgressBar
        current={state.index + 1}
        total={totalQuestions}
        className="mx-auto max-w-md"
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card padding="none" className="overflow-hidden">
          <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[10.5rem_1fr] md:gap-7 lg:grid-cols-[12rem_1fr]">
            {/* ───── робот + реакція ───── */}
            <div className="flex items-start gap-4 md:block">
              <Robot
                pose={selected || question.kind === 'text' ? 'think' : 'calm'}
                className="h-28 shrink-0 md:h-52 md:w-full"
                floating={false}
              />
              <RobotBubble
                text={bubbleText}
                tail="left"
                className="flex-1 md:mt-3 md:max-w-none"
              />
            </div>

            {/* ───── питання ───── */}
            <div className="min-w-0">
              <h2 className="text-2xl leading-tight text-leaf-700 sm:text-[1.75rem]">
                {question.title}
              </h2>

              {question.hint && question.kind !== 'text' && (
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                  {question.hint}
                </p>
              )}

              <div className="mt-6">
                {question.kind === 'text' ? (
                  <AboutField question={question} flow={flow} />
                ) : (
                  <OptionList question={question} selected={selected} flow={flow} />
                )}
              </div>

              {question.kind !== 'text' && (
                <NavRow
                  disabled={!selected}
                  isLast={state.index === totalQuestions - 1}
                  onBack={actions.back}
                  onNext={actions.next}
                />
              )}
            </div>
          </div>
        </Card>

        <QuizChecklist currentIndex={state.index} className="hidden lg:block" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

function OptionList({
  question,
  selected,
  flow,
}: {
  question: Question
  selected: string
  flow: QuizFlow
}) {
  return (
    <RadioGroup.Root
      value={selected}
      onValueChange={(value) => {
        const option = question.options?.find((o) => o.id === value)
        if (!option) return
        flow.actions.answer(question.id, option.id, option.reaction)
      }}
      className="space-y-2.5"
      aria-label={question.title}
    >
      {question.options?.map((option) => {
        const isSelected = option.id === selected

        return (
          <RadioGroup.Item
            key={option.id}
            value={option.id}
            className={cn(
              'group/opt flex w-full items-start gap-3.5 rounded-field border px-4 py-3.5 text-left transition-all duration-200',
              'hover:-translate-y-px hover:shadow-soft',
              isSelected
                ? 'border-leaf-400 bg-leaf-50/70 shadow-soft ring-1 ring-leaf-300/60'
                : 'border-line bg-white hover:border-leaf-300',
            )}
          >
            {/* радіо-індикатор */}
            <span
              className={cn(
                'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-leaf-500 bg-leaf-500 text-white'
                  : 'border-line-strong bg-white group-hover/opt:border-leaf-300',
              )}
            >
              {isSelected && <Check className="size-3" strokeWidth={4} />}
            </span>

            {option.emoji && (
              <span className="mt-px shrink-0 text-base leading-6">{option.emoji}</span>
            )}

            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block text-[0.9375rem] leading-snug',
                  isSelected ? 'font-semibold text-leaf-800' : 'text-ink',
                )}
              >
                {option.label}
              </span>

              {option.bullets && (
                <span className="mt-2 block space-y-1.5">
                  {option.bullets.map((bullet) => (
                    <span
                      key={bullet}
                      className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-soft"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-leaf-300" />
                      {bullet}
                    </span>
                  ))}
                </span>
              )}
            </span>
          </RadioGroup.Item>
        )
      })}
    </RadioGroup.Root>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

function AboutField({ question, flow }: { question: Question; flow: QuizFlow }) {
  const [text, setText] = useState(flow.state.about)
  const [submitted, setSubmitted] = useState(Boolean(flow.state.lastReaction))
  const areaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    areaRef.current?.focus()
  }, [])

  const isValid = text.trim().length >= MIN_ABOUT_LENGTH

  const handleContinue = () => {
    if (!isValid) return
    if (!submitted) {
      // Спочатку показуємо реакцію робота, і лише потім пускаємо далі
      flow.actions.submitAbout(text.trim(), question.reaction ?? '')
      setSubmitted(true)
      return
    }
    flow.actions.next()
  }

  return (
    <div>
      <label
        htmlFor="about-field"
        className="flex items-center gap-2 text-sm font-semibold text-ink"
      >
        <PenLine className="size-4 text-leaf-500" strokeWidth={2.25} />
        Твоя відповідь
      </label>

      <textarea
        id="about-field"
        ref={areaRef}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          flow.actions.setAbout(event.target.value)
          if (submitted) setSubmitted(false)
        }}
        rows={6}
        placeholder={question.placeholder}
        className={cn(
          'mt-2.5 w-full resize-y rounded-field border border-line bg-white px-4 py-3.5',
          'text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-muted/70',
          'transition-colors focus:border-leaf-400 focus:outline-none focus:ring-4 focus:ring-leaf-100',
        )}
      />

      <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
        <span>Пиши вільно — я збережу все одним текстом, без розбиття на поля.</span>
        <span className="tabular-nums">{text.trim().length}</span>
      </div>

      <NavRow
        disabled={!isValid}
        isLast={false}
        nextLabel={submitted ? 'Далі' : 'Готово'}
        onBack={flow.actions.back}
        onNext={handleContinue}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */

function NavRow({
  disabled,
  isLast,
  nextLabel,
  onBack,
  onNext,
}: {
  disabled: boolean
  isLast: boolean
  nextLabel?: string
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="size-3.5" strokeWidth={2.75} />
        Назад
      </Button>

      <Button size="md" disabled={disabled} onClick={onNext} className="min-w-36">
        {nextLabel ?? (isLast ? 'Показати результат' : 'Далі')}
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          strokeWidth={2.75}
        />
      </Button>
    </div>
  )
}
