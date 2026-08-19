/**
 * Стан-машина всього сценарію.
 *
 * intro → about → quiz(1…15) → result → analysis → booking
 *
 * Переходи чисто локальні й синхронні - екран не залежить від відповіді API.
 * Запис у json-server відбувається побічним ефектом, після зміни стану.
 */

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { questions, totalQuestions } from "../data/questions";
import type { ProfileId } from "../data/profiles";
import { env } from "../lib/env";
import { calculateResult, type QuizResult } from "../lib/scoring";
import { readJSON, remove, storageKeys, writeJSON } from "../lib/storage";
import { useSessionSync } from "./useSessionSync";

export type Stage =
  | "intro"
  | "about"
  | "quiz"
  | "result"
  | "analysis"
  | "booking";

export interface FlowState {
  stage: Stage;
  /**
   * Куди повертатись після «Вийти».
   * Заповнюється лише коли користувач вийшов на інтро, маючи прогрес.
   */
  resumeStage: Stage | null;
  /** Індекс у масиві questions */
  index: number;
  about: string;
  answers: Record<number, string>;
  /** Остання реакція робота - «висить» у бабблі й на наступному питанні */
  lastReaction: string | null;
  analysisStartedAt: number | null;
  analysisDeliveredAt: number | null;
  bookingRequestedAt: number | null;
}

type Action =
  | { type: "restore"; state: FlowState }
  | { type: "begin" }
  | { type: "to-quiz" }
  | { type: "set-about"; text: string }
  | { type: "answer"; questionId: number; optionId: string; reaction: string }
  | { type: "react"; reaction: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "to-result" }
  | { type: "request-analysis" }
  | { type: "deliver-analysis" }
  | { type: "to-booking" }
  | { type: "exit" }
  | { type: "resume" }
  | { type: "restart" };

const initialState: FlowState = {
  stage: "intro",
  resumeStage: null,
  index: 0,
  about: "",
  answers: {},
  lastReaction: null,
  analysisStartedAt: null,
  analysisDeliveredAt: null,
  bookingRequestedAt: null,
};

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "restore":
      return action.state;

    case "begin":
      return { ...state, stage: "about", resumeStage: null };

    case "to-quiz":
      return { ...state, stage: "quiz", index: 0 };

    case "set-about":
      return { ...state, about: action.text };

    case "answer":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
        lastReaction: action.reaction,
      };

    case "react":
      return { ...state, lastReaction: action.reaction };

    case "next": {
      const isLast = state.index >= totalQuestions - 1;
      if (isLast) return { ...state, stage: "result" };
      return { ...state, index: state.index + 1 };
    }

    case "back": {
      if (state.index === 0) return { ...state, stage: "about" };
      return { ...state, index: state.index - 1, lastReaction: null };
    }

    case "to-result":
      return { ...state, stage: "result" };

    case "request-analysis":
      return {
        ...state,
        stage: "analysis",
        analysisStartedAt: state.analysisStartedAt ?? Date.now(),
      };

    case "deliver-analysis":
      return {
        ...state,
        analysisDeliveredAt: state.analysisDeliveredAt ?? Date.now(),
      };

    case "to-booking":
      return {
        ...state,
        stage: "booking",
        // За ТЗ: натиснула «Хочу на розбір» - аналіз усе одно готується
        analysisStartedAt: state.analysisStartedAt ?? Date.now(),
        bookingRequestedAt: state.bookingRequestedAt ?? Date.now(),
      };

    // «Вийти» - лише повернення на інтро. Відповіді лишаються недоторканими,
    // щоб користувач продовжив із того самого кроку.
    case "exit":
      if (state.stage === "intro") return state;
      return { ...state, stage: "intro", resumeStage: state.stage };

    case "resume":
      return {
        ...state,
        stage: state.resumeStage ?? "about",
        resumeStage: null,
      };

    case "restart":
      return { ...initialState };

    default:
      return state;
  }
}

const stages: Stage[] = [
  "intro",
  "about",
  "quiz",
  "result",
  "analysis",
  "booking",
];

function isValidState(value: unknown): value is FlowState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as FlowState;
  return (
    typeof candidate.stage === "string" &&
    stages.includes(candidate.stage) &&
    typeof candidate.index === "number" &&
    typeof candidate.answers === "object" &&
    candidate.answers !== null
  );
}

/** Чи є що відновлювати: користувач уже кудись просунувся далі за інтро. */
function hasProgress(state: FlowState): boolean {
  return (
    state.stage !== "intro" ||
    state.resumeStage !== null ||
    Object.keys(state.answers).length > 0 ||
    state.about.trim().length > 0
  );
}

export function useQuizFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sync = useSessionSync();

  // Відновлення після перезавантаження або повернення після «Вийти»
  useEffect(() => {
    const saved = readJSON<FlowState>(storageKeys.state);
    if (!isValidState(saved)) return;

    // resumeStage має сенс лише коли збережений стан - це «вийшла на інтро»
    const savedResume =
      saved.resumeStage &&
      saved.resumeStage !== "intro" &&
      stages.includes(saved.resumeStage)
        ? saved.resumeStage
        : Object.keys(saved.answers).length > 0 || saved.about?.trim()
          ? "quiz"
          : "about";

    const restored: FlowState = {
      ...initialState,
      ...saved,
      index: Math.min(Math.max(0, saved.index), totalQuestions - 1),
      resumeStage: saved.stage === "intro" ? savedResume : null,
    };

    if (hasProgress(restored)) {
      dispatch({ type: "restore", state: restored });
    }
  }, []);

  // Збереження прогресу - зокрема й у стані «вийшла на інтро, але прогрес живий»
  useEffect(() => {
    if (!hasProgress(state)) return;
    writeJSON(storageKeys.state, state);
  }, [state]);

  const answeredCount = useMemo(() => {
    const optionAnswers = Object.keys(state.answers).length;
    return optionAnswers + (state.about.trim() ? 1 : 0);
  }, [state.answers, state.about]);

  const result: QuizResult | null = useMemo(() => {
    const stagesWithResult: Stage[] = ["result", "analysis", "booking"];
    if (!stagesWithResult.includes(state.stage)) return null;
    return calculateResult(state.answers);
  }, [state.stage, state.answers]);

  const question = questions[state.index]!;

  /* ------------------------------------------------------------------ *
   * Дії
   * ------------------------------------------------------------------ */

  const begin = useCallback(() => dispatch({ type: "begin" }), []);

  const startQuiz = useCallback(() => dispatch({ type: "to-quiz" }), []);

  const setAbout = useCallback(
    (text: string) => dispatch({ type: "set-about", text }),
    [],
  );

  const answer = useCallback(
    (questionId: number, optionId: string, reaction: string) => {
      dispatch({ type: "answer", questionId, optionId, reaction });
      sync.push({
        answers: { ...state.answers, [String(questionId)]: optionId } as Record<
          string,
          string
        >,
        lastQuestionId: questionId,
      });
    },
    [state.answers, sync],
  );

  const react = useCallback(
    (reaction: string) => dispatch({ type: "react", reaction }),
    [],
  );

  const submitAbout = useCallback(
    (text: string, reaction: string) => {
      dispatch({ type: "set-about", text });
      dispatch({ type: "react", reaction });
      sync.push({ about: text, lastQuestionId: 1 });
    },
    [sync],
  );

  const next = useCallback(() => dispatch({ type: "next" }), []);
  const back = useCallback(() => dispatch({ type: "back" }), []);
  const toResult = useCallback(() => dispatch({ type: "to-result" }), []);

  const requestAnalysis = useCallback(() => {
    dispatch({ type: "request-analysis" });
    const computed = calculateResult(state.answers);
    sync.push({
      analysisRequestedAt: new Date().toISOString(),
      profileId: computed.profileId,
      scores: computed.scores,
      completedAt: new Date().toISOString(),
    });
    sync.saveLead({
      about: state.about,
      profileId: computed.profileId,
      intent: "analysis",
    });
  }, [state.answers, state.about, sync]);

  const deliverAnalysis = useCallback(() => {
    dispatch({ type: "deliver-analysis" });
    sync.push({ analysisDeliveredAt: new Date().toISOString() });
  }, [sync]);

  const goToBooking = useCallback(() => {
    dispatch({ type: "to-booking" });
    const computed = calculateResult(state.answers);
    sync.push({
      bookingRequestedAt: new Date().toISOString(),
      profileId: computed.profileId,
      scores: computed.scores,
      completedAt: new Date().toISOString(),
    });
    sync.saveLead({
      about: state.about,
      profileId: computed.profileId,
      intent: "booking",
    });
  }, [state.answers, state.about, sync]);

  const registerMihiClick = useCallback(() => {
    sync.push({ mihiClickedAt: new Date().toISOString() });
  }, [sync]);

  const registerBooking = useCallback(
    (detail: unknown) => {
      sync.saveBooking({ calLink: env.calLink, detail });
      sync.push({
        booking: {
          requestedAt: new Date().toISOString(),
          bookedAt: new Date().toISOString(),
          calLink: env.calLink,
          payload: detail,
        },
      });
    },
    [sync],
  );

  /** «Вийти» - прогрес лишається у сховищі, повертаємось на інтро. */
  const exit = useCallback(() => {
    dispatch({ type: "exit" });
    window.scrollTo({ top: 0 });
  }, []);

  /** Повернення до збереженого кроку з інтро. */
  const resume = useCallback(() => {
    dispatch({ type: "resume" });
    window.scrollTo({ top: 0 });
  }, []);

  const restart = useCallback(() => {
    remove(storageKeys.state);
    remove(storageKeys.session);
    remove(storageKeys.remote);
    dispatch({ type: "restart" });
    window.scrollTo({ top: 0 });
  }, []);

  const completeProfileId: ProfileId | null = result?.profileId ?? null;

  return {
    state,
    question,
    answeredCount,
    totalQuestions,
    result,
    completeProfileId,
    /** Є збережений крок, на який можна повернутись з інтро */
    canResume: state.stage === "intro" && state.resumeStage !== null,
    syncState: sync.syncState,
    actions: {
      begin,
      startQuiz,
      setAbout,
      submitAbout,
      answer,
      react,
      next,
      back,
      toResult,
      requestAnalysis,
      deliverAnalysis,
      goToBooking,
      registerMihiClick,
      registerBooking,
      exit,
      resume,
      restart,
    },
  };
}

export type QuizFlow = ReturnType<typeof useQuizFlow>;
