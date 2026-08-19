import {
  ArrowRight,
  BrainCircuit,
  Clock3,
  Lightbulb,
  Lock,
  MessageCircleHeart,
  UserRoundCheck,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Robot } from "../components/Robot";
import { RobotBubble } from "../components/RobotBubble";
import { OlenaPortrait } from "../components/OlenaPortrait";
import { Button } from "../components/ui/Button";
import { heroContent, introDialogue } from "../data/content";

const bulletIcons = [
  MessageCircleHeart,
  BrainCircuit,
  Lightbulb,
  UserRoundCheck,
];

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh hero-wash leaf-veil">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6">
        {/* ───── шапка ───── */}
        <header className="flex items-center justify-between gap-4">
          <Logo size="full" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <Clock3 className="size-4 text-leaf-500" strokeWidth={2.25} />
            {heroContent.eyebrow}
          </div>
        </header>

        {/* ───── герой ───── */}
        <section className="relative mt-6 grid items-center gap-10 md:mt-2 md:grid-cols-[1.05fr_0.95fr] md:gap-4">
          <div className="animate-rise relative z-10 max-w-xl">
            <h1 className="text-[2.1rem] leading-[1.08] sm:text-5xl sm:leading-[1.06]">
              {heroContent.titleStart}{" "}
              <span className="text-leaf-500">{heroContent.titleAccent}</span>{" "}
              {heroContent.titleEnd}
            </h1>

            <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
              {heroContent.lead}
            </p>

            <ul className="mt-7 space-y-3.5">
              {heroContent.bullets.map((text, i) => {
                const Icon = bulletIcons[i]!;
                return (
                  <li key={text} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-leaf-200 bg-white/70 text-leaf-600">
                      <Icon className="size-4" strokeWidth={2} />
                    </span>
                    <span className="text-[0.9375rem] text-ink">{text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-9">
              <Button size="lg" onClick={onStart} className="w-full sm:w-auto">
                {heroContent.cta}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={2.75}
                />
              </Button>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
              <Lock className="size-3.5" strokeWidth={2.25} />
              {heroContent.note}
            </p>
          </div>

          {/* ───── робот + Олена ───── */}
          <div className="relative min-h-[24rem] sm:min-h-[30rem]">
            {/* декоративна дуга з макета */}
            <svg
              viewBox="0 0 420 420"
              className="absolute -top-6 right-0 h-full w-full max-w-lg opacity-90"
              aria-hidden="true"
            >
              <path
                d="M40 400 C20 180 160 40 340 60"
                stroke="#b0c992"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="340" cy="60" r="5" fill="#91b06c" />
            </svg>

            {/* фото Олени */}
            <div className="absolute right-0 top-2 h-72 w-52 overflow-hidden rounded-[42%_42%_38%_38%/34%_34%_28%_28%] shadow-lift sm:h-96 sm:w-72">
              <OlenaPortrait rounded="card" className="rounded-none" />
            </div>

            {/* робот */}
            <Robot
              pose="wave"
              className="absolute -left-2 bottom-8 h-64 drop-shadow-xl sm:bottom-6 sm:h-80"
            />

            {/* картка про Олену */}
            <div className="absolute bottom-0 right-0 w-64 rounded-card border border-line bg-white/95 p-5 shadow-card backdrop-blur-sm sm:w-72">
              <p className="font-display text-lg font-extrabold text-ink">
                {heroContent.olenaCard.name}
              </p>
              <div className="mt-2.5 space-y-1 text-[0.8125rem] leading-relaxed text-ink-soft">
                {heroContent.olenaCard.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───── розгорнутий вступ із ТЗ ───── */}
        <section className="mt-16 rounded-panel border border-line panel-wash p-6 shadow-card sm:mt-20 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-10">
            <div className="flex justify-center md:block">
              <Robot pose="calm" className="h-40 md:h-52" floating={false} />
            </div>

            <div>
              <RobotBubble
                text={introDialogue.bubble}
                title="AI-помічник"
                tail="left"
                typing={false}
                className="max-w-lg"
              />

              <p className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-ink">
                {introDialogue.invitation}
              </p>

              <div className="mt-7 rounded-card border border-leaf-200 bg-leaf-50/60 p-5 sm:p-6">
                <p className="font-display text-sm font-extrabold text-ink">
                  {introDialogue.promiseTitle}
                </p>
                <p className="mt-1.5 text-lg font-semibold text-leaf-700">
                  {introDialogue.promiseSubtitle}
                </p>

                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {introDialogue.promises.map(({ emoji, text }) => (
                    <li
                      key={text}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
                    >
                      <span className="text-base leading-none">{emoji}</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
                <span className="flex items-center gap-1.5 font-semibold text-leaf-700">
                  <Clock3 className="size-4" strokeWidth={2.25} />
                  {introDialogue.timing}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
                {introDialogue.closing}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" onClick={onStart}>
                  {heroContent.cta}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={2.75}
                  />
                </Button>
                <span className="text-sm text-ink-muted">
                  {introDialogue.cta}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
