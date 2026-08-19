import * as Progress from "@radix-ui/react-progress";
import { Check, Circle } from "lucide-react";
import { questions } from "../data/questions";
import { cn } from "../lib/cn";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  /** Показувати підпис «Питання N із M» */
  withLabel?: boolean;
}

export function QuizProgressBar({
  current,
  total,
  className,
  withLabel = true,
}: ProgressBarProps) {
  const percent = Math.round(((current - 1) / total) * 100);

  return (
    <div className={cn("w-full", className)}>
      {withLabel && (
        <div className="mb-2 text-center label-caps text-ink-muted">
          Питання {current} із {total}
        </div>
      )}
      <div className="flex items-center gap-3">
        <Progress.Root
          value={percent}
          className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-cream-300/70"
        >
          <Progress.Indicator
            className="h-full rounded-full bg-linear-to-r from-leaf-400 to-leaf-600 transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </Progress.Root>
        <span className="w-10 shrink-0 text-right font-display text-xs font-extrabold text-leaf-600">
          {percent}%
        </span>
      </div>
    </div>
  );
}

interface ChecklistProps {
  currentIndex: number;
  /** Скільком першим питанням показувати назви (решта - «ще N запитань») */
  visible?: number;
  className?: string;
}

/** Панель «Твій прогрес» із макета. */
export function QuizChecklist({
  currentIndex,
  visible = 8,
  className,
}: ChecklistProps) {
  const total = questions.length;
  const passed = currentIndex;
  const percent = Math.round((passed / total) * 100);

  // Вікно навколо поточного питання, щоб список не «тікав» уперед
  const start = Math.min(
    Math.max(0, currentIndex - 3),
    Math.max(0, total - visible),
  );
  const window = questions.slice(start, start + visible);
  const rest = total - (start + window.length);

  return (
    <div
      className={cn(
        "rounded-panel border border-line bg-white p-6 shadow-card",
        className,
      )}
    >
      <h3 className="text-xl">Твій прогрес</h3>

      <p className="mt-3 text-sm text-ink-muted">
        Питань пройдено: {passed} із {total}
      </p>

      <div className="mt-2 flex items-center gap-3">
        <Progress.Root
          value={percent}
          className="relative h-2 flex-1 overflow-hidden rounded-full bg-cream-300/70"
        >
          <Progress.Indicator
            className="h-full rounded-full bg-linear-to-r from-leaf-400 to-leaf-600 transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </Progress.Root>
        <span className="font-display text-xs font-extrabold text-leaf-600">
          {percent}%
        </span>
      </div>

      <ul className="mt-5 space-y-3">
        {start > 0 && (
          <li className="flex items-center gap-2 pl-1 text-sm text-ink-muted">
            <span className="text-line-strong">···</span>
            попередні {start}
          </li>
        )}

        {window.map((question, i) => {
          const index = start + i;
          const state =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "todo";

          return (
            <li key={question.id} className="flex items-start gap-2.5">
              {state === "done" ? (
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-leaf-500 text-white">
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
              ) : state === "current" ? (
                <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
                  <span className="absolute inset-0 rounded-full bg-leaf-400 animate-pulse-ring" />
                  <span className="size-3.5 rounded-full bg-leaf-500 ring-2 ring-leaf-200" />
                </span>
              ) : (
                <Circle
                  className="mt-0.5 size-5 shrink-0 text-line-strong"
                  strokeWidth={1.75}
                />
              )}

              <span
                className={cn(
                  "text-sm leading-snug",
                  state === "done" && "text-ink-soft",
                  state === "current" && "font-semibold text-leaf-700",
                  state === "todo" && "text-ink-muted",
                )}
              >
                {question.step}
              </span>
            </li>
          );
        })}

        {rest > 0 && (
          <li className="flex items-center gap-2 pl-1 text-sm text-ink-muted">
            <span className="text-line-strong">···</span>
            ще {rest}{" "}
            {rest === 1 ? "запитання" : rest < 5 ? "запитання" : "запитань"}
          </li>
        )}
      </ul>
    </div>
  );
}
