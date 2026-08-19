import { ArrowRight, BadgeCheck, BookOpen, Quote } from "lucide-react";
import { Robot } from "../components/Robot";
import { RobotBubble } from "../components/RobotBubble";
import { OlenaPortrait } from "../components/OlenaPortrait";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { aboutOlena } from "../data/content";

export function AboutScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-screen-in space-y-6">
      {/* ───── знайомство з помічником ───── */}
      <Card tone="wash" padding="lg">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
          <div className="flex justify-center sm:block">
            <Robot pose="wave" art="heart" className="h-36 sm:h-44" />
          </div>
          <div>
            <span className="eyebrow text-leaf-600">Познайомимось?</span>
            <h1 className="mt-2.5 text-3xl sm:text-[2.25rem]">
              Я AI-помічник <br className="hidden sm:block" />
              Олени Філатової
            </h1>
            <RobotBubble
              text={aboutOlena.hook}
              tail="none"
              typing={false}
              className="mt-5 max-w-xl"
            />
          </div>
        </div>
      </Card>

      {/* ───── про Олену ───── */}
      <Card padding="lg">
        <div className="grid gap-8 md:grid-cols-[16rem_1fr] md:gap-10">
          <div>
            <div className="relative mx-auto h-72 w-56 md:h-80 md:w-full">
              <div className="absolute inset-0 overflow-hidden rounded-panel bg-leaf-50 shadow-card">
                <OlenaPortrait rounded="card" className="rounded-none" />
              </div>
              <span className="absolute -bottom-3 -right-2 flex items-center gap-1.5 rounded-full border border-leaf-200 bg-white px-3 py-1.5 text-xs font-semibold text-leaf-700 shadow-soft">
                <BadgeCheck className="size-4" strokeWidth={2.5} />
                27 років у MLM
              </span>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-3">
              {aboutOlena.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-card border border-line bg-cream-50 px-3 py-3 text-center md:flex md:items-baseline md:gap-2.5 md:text-left"
                >
                  <dt className="font-display text-lg font-extrabold text-leaf-600 md:text-xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-0.5 text-[0.6875rem] leading-tight text-ink-muted md:mt-0 md:text-xs">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl">Олена Філатова</h2>
            <p className="mt-2 text-sm font-semibold text-leaf-600">
              MLM-підприємець · наставник · бізнес-тренер · коуч
            </p>

            <div className="mt-5 space-y-3.5 text-[0.9375rem] leading-relaxed text-ink-soft">
              {aboutOlena.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-card border border-leaf-200 bg-leaf-50/60 p-4">
              <BookOpen
                className="mt-0.5 size-5 shrink-0 text-leaf-600"
                strokeWidth={2.25}
              />
              <p className="text-sm leading-relaxed text-ink-soft">
                Співавтор настільної книги-тренінгу{" "}
                <span className="font-semibold text-ink">
                  «Найпростіший шлях у бізнес»
                </span>
              </p>
            </div>

            <div className="mt-7">
              <p className="text-[0.9375rem] font-semibold text-ink">
                {aboutOlena.positioningIntro}
              </p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {aboutOlena.positioning.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-leaf-400" />
                    <span className="text-sm leading-relaxed text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex items-start gap-3 border-l-2 border-leaf-300 pl-4">
              <Quote
                className="mt-0.5 size-4 shrink-0 text-leaf-400"
                strokeWidth={2.5}
              />
              <p className="text-[0.9375rem] leading-relaxed text-ink">
                {aboutOlena.closing}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ───── перехід до питань ───── */}
      <Card tone="wash" padding="lg">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h3 className="text-xl sm:text-2xl">Тепер розкажи про себе</h3>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
              {aboutOlena.transition}
            </p>
          </div>
          <Button
            size="lg"
            onClick={onNext}
            className="w-full shrink-0 sm:w-auto"
          >
            {aboutOlena.cta}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2.75}
            />
          </Button>
        </div>
      </Card>
    </div>
  );
}
