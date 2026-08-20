import { useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { useQuizFlow, type QuizFlow } from "./hooks/useQuizFlow";
import { AboutScreen } from "./screens/AboutScreen";
import { AnalysisScreen } from "./screens/AnalysisScreen";
import { BookingScreen } from "./screens/BookingScreen";
import { IntroScreen } from "./screens/IntroScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { isDemoMode } from "./lib/env";

export default function App() {
  const flow = useQuizFlow();
  const { state, actions, result } = flow;

  // Плавний скрол уверх при зміні екрану
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.stage]);

  if (state.stage === "intro") {
    return (
      <>
        <IntroScreen
          onStart={actions.begin}
          resume={
            flow.canResume
              ? {
                  label: resumeLabel(flow),
                  answered: flow.answeredCount,
                  total: flow.totalQuestions,
                  onResume: actions.resume,
                  onRestart: actions.restart,
                }
              : undefined
          }
          // 1 діагностика = 1 користувач: замість «Почати» - доступ до результату
          completed={
            flow.isLocked
              ? {
                  completedAt: flow.completedAt,
                  profileName: flow.completedProfile?.name ?? null,
                  profileEmoji: flow.completedProfile?.emoji ?? null,
                  canView: flow.canViewResult,
                  onView: actions.viewResult,
                }
              : undefined
          }
        />
        <DemoBadge />
      </>
    );
  }

  return (
    <>
      <AppShell
        onExit={actions.exit}
        // Після завершення діагностики «почати заново» більше не пропонуємо
        onRestart={flow.isLocked ? undefined : actions.restart}
        syncState={flow.syncState}
        locked={flow.isLocked}
        width={
          state.stage === "about" || state.stage === "quiz" ? "wide" : "wide"
        }
      >
        {state.stage === "about" && <AboutScreen onNext={actions.startQuiz} />}

        {state.stage === "quiz" && <QuizScreen flow={flow} />}

        {state.stage === "result" && result && (
          <ResultScreen
            result={result}
            onRequestAnalysis={actions.requestAnalysis}
            onBooking={actions.goToBooking}
          />
        )}

        {state.stage === "analysis" && result && (
          <AnalysisScreen flow={flow} result={result} />
        )}

        {state.stage === "booking" && result && (
          <BookingScreen
            onBack={() =>
              state.analysisStartedAt
                ? actions.requestAnalysis()
                : actions.toResult()
            }
            onBooked={actions.registerBooking}
            onMihiClick={actions.registerMihiClick}
            analysisReady={Boolean(state.analysisDeliveredAt)}
            // 1 бронювання = 1 користувач: замок переживає F5 і повторний вхід
            alreadyBooked={flow.isBooked}
            bookedAt={flow.bookedAt}
          />
        )}
      </AppShell>
      <DemoBadge />
    </>
  );
}

/** Людська назва кроку, на якому користувач зупинився. */
function resumeLabel({ state, totalQuestions }: QuizFlow): string {
  switch (state.resumeStage) {
    case "about":
      return "Знайомство з Оленою";
    case "quiz":
      return `Питання ${state.index + 1} із ${totalQuestions}`;
    case "result":
      return "Твій результат";
    case "analysis":
      return "Аналіз від Олени";
    case "booking":
      return "Запис на розбір";
    default:
      return "Діагностика";
  }
}

/** Видимий маркер, коли таймери скорочені через .env - щоб не забути перед продакшеном. */
function DemoBadge() {
  if (!isDemoMode) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 rounded-full border border-amber-200 bg-amber-50/95 px-3 py-1.5 text-[0.6875rem] font-semibold text-accent-amber shadow-soft">
      DEMO: скорочені таймери
    </div>
  );
}
