import { useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { useQuizFlow } from "./hooks/useQuizFlow";
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
        <IntroScreen onStart={actions.begin} />
        <DemoBadge />
      </>
    );
  }

  return (
    <>
      <AppShell
        onExit={actions.restart}
        syncState={flow.syncState}
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
          />
        )}
      </AppShell>
      <DemoBadge />
    </>
  );
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
