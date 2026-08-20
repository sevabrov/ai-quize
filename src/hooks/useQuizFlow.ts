/**
 * Стан-машина всього сценарію.
 *
 * intro → about → quiz(1…15) → result → analysis → booking
 *
 * Переходи чисто локальні й синхронні - екран не залежить від відповіді API.
 * Запис у json-server відбувається побічним ефектом, після зміни стану.
 *
 * Правило «1 діагностика = 1 користувач»: як тільки людина дійшла до результату,
 * стан переходить у locked - квіз більше не можна пройти вдруге, а «Почати заново»
 * недоступне. Результат, аналіз і запис на розбір лишаються доступними.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { questions, totalQuestions } from "../data/questions";
import { profiles, type ProfileId } from "../data/profiles";
import { env } from "../lib/env";
import { calculateResult, type QuizResult } from "../lib/scoring";
import {
  readBooked,
  readCompletion,
  readJSON,
  remove,
  storageKeys,
  writeBooked,
  writeCompletion,
  writeJSON,
} from "../lib/storage";
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
  /**
   * ISO-час завершення діагностики. Щойно заповнене - квіз замкнено назавжди
   * (1 діагностика = 1 користувач).
   */
  completedAt: string | null;
  analysisStartedAt: number | null;
  analysisDeliveredAt: number | null;
  bookingRequestedAt: number | null;
  /**
   * ISO-час успішного бронювання в Cal.com. Щойно заповнене - календар
   * більше не показуємо (1 бронювання = 1 користувач), і це переживає F5.
   */
  bookedAt: string | null;
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
  /** Замкнути повторне проходження - локально або за даними сервера */
  | { type: "lock"; at: string }
  /** Повернутись до вже готового результату з інтро */
  | { type: "view-result" }
  | { type: "request-analysis" }
  | { type: "deliver-analysis" }
  | { type: "to-booking" }
  /** Замкнути повторне бронювання - локально або за даними сервера */
  | { type: "mark-booked"; at: string }
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
  completedAt: null,
  analysisStartedAt: null,
  analysisDeliveredAt: null,
  bookingRequestedAt: null,
  bookedAt: null,
};

const nowISO = () => new Date().toISOString();

/** Екрани, доступні після завершення діагностики. */
const postResultStages: Stage[] = ["result", "analysis", "booking"];

/** Куди повертати людину із замкненою діагностикою - лише екрани результату. */
function resultTarget(state: FlowState): Stage {
  return state.resumeStage && postResultStages.includes(state.resumeStage)
    ? state.resumeStage
    : "result";
}

function reducer(state: FlowState, action: Action): FlowState {
  // 1 діагностика = 1 користувач: після завершення жодного повторного
  // проходження - ні «Почати», ні «Почати заново», ні редагування відповідей.
  if (state.completedAt) {
    const blocked: Action["type"][] = [
      "begin",
      "to-quiz",
      "set-about",
      "answer",
      "next",
      "back",
      "restart",
    ];
    if (blocked.includes(action.type)) return state;
  }

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
      // Останнє питання = діагностика пройдена, далі шлях лише в один бік
      if (isLast) return { ...state, stage: "result", completedAt: nowISO() };
      return { ...state, index: state.index + 1 };
    }

    case "back": {
      if (state.index === 0) return { ...state, stage: "about" };
      return { ...state, index: state.index - 1, lastReaction: null };
    }

    case "to-result":
      return {
        ...state,
        stage: "result",
        completedAt: state.completedAt ?? nowISO(),
      };

    case "lock": {
      if (state.completedAt) return state;
      const locked = { ...state, completedAt: action.at };
      // Якщо сервер каже «пройдено», а людина стоїть на квізі - виводимо з квізу
      if (state.stage === "about" || state.stage === "quiz") {
        return { ...locked, stage: "intro", resumeStage: null };
      }
      return locked;
    }

    case "view-result":
      return { ...state, stage: resultTarget(state), resumeStage: null };

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

    // Перше бронювання виграє: повторні події Cal.com нічого не переписують
    case "mark-booked":
      if (state.bookedAt) return state;
      return { ...state, bookedAt: action.at };

    // «Вийти» - лише повернення на інтро. Відповіді лишаються недоторканими,
    // щоб користувач продовжив із того самого кроку.
    case "exit":
      if (state.stage === "intro") return state;
      return { ...state, stage: "intro", resumeStage: state.stage };

    case "resume":
      // Після завершення «продовжити» означає «повернутись до результату»
      if (state.completedAt) {
        return { ...state, stage: resultTarget(state), resumeStage: null };
      }
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
    state.completedAt !== null ||
    state.bookedAt !== null ||
    Object.keys(state.answers).length > 0 ||
    state.about.trim().length > 0
  );
}

export function useQuizFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sync = useSessionSync();
  const completionPushedRef = useRef(false);
  /** Останній payload Cal.com - щоб зберегти його разом із позначкою бронювання */
  const bookingDetailRef = useRef<unknown>(null);
  /** Синхронний замок: два івенти Cal.com в одному тіку не створять два записи */
  const bookedLockRef = useRef(false);

  // Відновлення після перезавантаження або повернення після «Вийти»
  useEffect(() => {
    const completion = readCompletion();
    const booked = readBooked();
    const saved = readJSON<FlowState>(storageKeys.state);

    // Прогрес могли почистити, а позначки про завершення / бронювання - ні:
    // замок сильніший за прогрес
    if (!isValidState(saved)) {
      if (completion || booked) {
        dispatch({
          type: "restore",
          state: {
            ...initialState,
            completedAt: completion?.completedAt ?? null,
            bookedAt: booked?.bookedAt ?? null,
          },
        });
      }
      return;
    }

    const completedAt = completion?.completedAt ?? saved.completedAt ?? null;
    const bookedAt = booked?.bookedAt ?? saved.bookedAt ?? null;

    // resumeStage має сенс лише коли збережений стан - це «вийшла на інтро».
    // Після завершення діагностики повертати можна лише на екрани результату.
    const savedResume =
      saved.resumeStage &&
      saved.resumeStage !== "intro" &&
      stages.includes(saved.resumeStage)
        ? saved.resumeStage
        : completedAt
          ? "result"
          : Object.keys(saved.answers).length > 0 || saved.about?.trim()
            ? "quiz"
            : "about";

    const resumeStage =
      saved.stage === "intro"
        ? completedAt && !postResultStages.includes(savedResume)
          ? "result"
          : savedResume
        : null;

    // Завершена діагностика не може відновитись на «про себе» чи на питаннях
    const stage: Stage =
      completedAt && (saved.stage === "about" || saved.stage === "quiz")
        ? Object.keys(saved.answers).length > 0
          ? "result"
          : "intro"
        : saved.stage;

    const restored: FlowState = {
      ...initialState,
      ...saved,
      stage,
      completedAt,
      bookedAt,
      index: Math.min(Math.max(0, saved.index), totalQuestions - 1),
      resumeStage,
    };

    if (hasProgress(restored)) {
      dispatch({ type: "restore", state: restored });
    }
  }, []);

  /**
   * Звірка з сервером: якщо в записі сесії вже стоїть completedAt, діагностика
   * пройдена - навіть коли локальну позначку встигли почистити.
   */
  useEffect(() => {
    const remoteCompletedAt = sync.remoteSession?.completedAt;
    if (remoteCompletedAt) dispatch({ type: "lock", at: remoteCompletedAt });
  }, [sync.remoteSession?.completedAt]);

  /**
   * Те саме для бронювання: якщо в сесії на сервері вже є booking.bookedAt,
   * зустріч заброньовано - другий раз календар не показуємо.
   */
  useEffect(() => {
    const remoteBookedAt = sync.remoteSession?.booking?.bookedAt;
    if (remoteBookedAt) dispatch({ type: "mark-booked", at: remoteBookedAt });
  }, [sync.remoteSession?.booking?.bookedAt]);

  // Збереження прогресу - зокрема й у стані «вийшла на інтро, але прогрес живий»
  useEffect(() => {
    if (!hasProgress(state)) return;
    writeJSON(storageKeys.state, state);
  }, [state]);

  // Позначка «діагностику пройдено» - окремий ключ, який не чиститься з прогресом
  useEffect(() => {
    if (!state.completedAt) return;
    const existing = readCompletion();
    writeCompletion({
      completedAt: existing?.completedAt ?? state.completedAt,
      profileId: Object.keys(state.answers).length
        ? calculateResult(state.answers).profileId
        : (existing?.profileId ?? null),
      sessionId: sync.sessionId ?? existing?.sessionId ?? null,
    });
  }, [state.completedAt, state.answers, sync.sessionId]);

  // Позначка «зустріч заброньовано» - теж окремий ключ, живе поза прогресом
  useEffect(() => {
    if (!state.bookedAt) return;
    const existing = readBooked();
    writeBooked({
      bookedAt: existing?.bookedAt ?? state.bookedAt,
      sessionId: sync.sessionId ?? existing?.sessionId ?? null,
      detail: bookingDetailRef.current ?? existing?.detail ?? null,
    });
  }, [state.bookedAt, sync.sessionId]);

  /**
   * Фіксація завершення на сервері - одразу на екрані результату, не чекаючи
   * запиту аналізу. Саме це поле робить замок перевірним на бекенді.
   */
  useEffect(() => {
    if (!state.completedAt || completionPushedRef.current) return;
    // Без наявної сесії й відповідей писати нічого - інакше створимо порожній запис
    if (!sync.sessionId || Object.keys(state.answers).length === 0) return;

    completionPushedRef.current = true;
    const computed = calculateResult(state.answers);
    sync.push({
      completedAt: state.completedAt,
      profileId: computed.profileId,
      scores: computed.scores,
    });
    // sync.push змінює identity щорендер - тому синхронізуємось лише за замком
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.completedAt, sync.sessionId]);

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

  /**
   * Успішне бронювання. 1 бронювання = 1 користувач: перша подія замикає
   * календар, повторні (у т.ч. дубль-івенти Cal.com) нічого не пишуть.
   */
  const registerBooking = useCallback(
    (detail: unknown) => {
      if (state.bookedAt || bookedLockRef.current || readBooked()) return;

      const bookedAt = new Date().toISOString();
      bookedLockRef.current = true;
      bookingDetailRef.current = detail;
      dispatch({ type: "mark-booked", at: bookedAt });

      sync.saveBooking({ calLink: env.calLink, detail });
      sync.push({
        booking: {
          requestedAt: state.bookingRequestedAt
            ? new Date(state.bookingRequestedAt).toISOString()
            : bookedAt,
          bookedAt,
          calLink: env.calLink,
          payload: detail,
        },
      });
    },
    [state.bookedAt, state.bookingRequestedAt, sync],
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

  /**
   * Повне очищення прогресу. Після завершення діагностики недоступне -
   * 1 діагностика = 1 користувач.
   */
  const restart = useCallback(() => {
    if (state.completedAt) return;
    remove(storageKeys.state);
    remove(storageKeys.session);
    remove(storageKeys.remote);
    dispatch({ type: "restart" });
    window.scrollTo({ top: 0 });
  }, [state.completedAt]);

  /** Повернення до вже готового результату з інтро. */
  const viewResult = useCallback(() => {
    dispatch({ type: "view-result" });
    window.scrollTo({ top: 0 });
  }, []);

  const completeProfileId: ProfileId | null = result?.profileId ?? null;

  const isLocked = state.completedAt !== null;

  /** Профіль завершеної діагностики - для плашки на інтро. */
  const completedProfile = useMemo(() => {
    if (!state.completedAt) return null;
    if (Object.keys(state.answers).length > 0) {
      return calculateResult(state.answers).profile;
    }
    const storedId = readCompletion()?.profileId;
    return profiles.find((p) => p.id === storedId) ?? null;
  }, [state.completedAt, state.answers]);

  return {
    state,
    question,
    answeredCount,
    totalQuestions,
    result,
    completeProfileId,
    /** Діагностику вже пройдено - повторне проходження заблоковане */
    isLocked,
    completedAt: state.completedAt,
    /** Зустріч уже заброньовано - повторне бронювання заблоковане */
    isBooked: state.bookedAt !== null,
    bookedAt: state.bookedAt,
    completedProfile,
    /** Чи є з чого показати результат (відповіді збереглися) */
    canViewResult: isLocked && Object.keys(state.answers).length > 0,
    /**
     * Є збережений крок, на який можна повернутись з інтро.
     * Для завершеної діагностики це завжди екрани результату, не квіз.
     */
    canResume:
      !isLocked && state.stage === "intro" && state.resumeStage !== null,
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
      viewResult,
    },
  };
}

export type QuizFlow = ReturnType<typeof useQuizFlow>;
