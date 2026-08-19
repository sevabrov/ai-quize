/**
 * Транспортний шар.
 *
 * Зараз під ним json-server + db.json. Щоб перевести проєкт на реальний бекенд
 * (Supabase / власне API / CRM), достатньо переписати цей файл - UI не змінюється.
 *
 * Важливо: жодна помилка мережі не має ламати проходження квізу.
 * Тому виклики нагору віддають помилку, а рівень хуків її ковтає (див. useSession).
 */

import { env } from "./env";
import type { ProfileId } from "../data/profiles";

export interface SessionScore {
  profileId: ProfileId;
  score: number;
  matched: string[];
}

export interface BookingRecord {
  requestedAt: string;
  bookedAt: string | null;
  calLink: string;
  /** Дані, які повертає Cal.com у події bookingSuccessful */
  payload: unknown;
}

export interface QuizSession {
  /** id, який призначив сервер */
  id: string;
  /** Наш id, згенерований на клієнті - стабільний навіть без сервера */
  clientId: string;
  startedAt: string;
  updatedAt: string;
  /** Вільний текст із питання 1 - зберігається одним блоком, без розбиття */
  about: string;
  /** { "2": "c", "3": "a", … } */
  answers: Record<string, string>;
  lastQuestionId: number;
  completedAt: string | null;
  profileId: ProfileId | null;
  scores: SessionScore[] | null;
  analysisRequestedAt: string | null;
  analysisDeliveredAt: string | null;
  bookingRequestedAt: string | null;
  mihiClickedAt: string | null;
  booking: BookingRecord | null;
  meta: {
    userAgent: string;
    referrer: string;
    language: string;
    screen: string;
  };
}

const REQUEST_TIMEOUT_MS = 8000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`${init?.method ?? "GET"} ${path} → ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function collectMeta(): QuizSession["meta"] {
  if (typeof window === "undefined") {
    return { userAgent: "", referrer: "", language: "", screen: "" };
  }
  return {
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    language: navigator.language,
    screen: `${window.screen.width}×${window.screen.height}`,
  };
}

export function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function emptySession(clientId: string): QuizSession {
  const now = new Date().toISOString();
  return {
    id: clientId,
    clientId,
    startedAt: now,
    updatedAt: now,
    about: "",
    answers: {},
    lastQuestionId: 0,
    completedAt: null,
    profileId: null,
    scores: null,
    analysisRequestedAt: null,
    analysisDeliveredAt: null,
    bookingRequestedAt: null,
    mihiClickedAt: null,
    booking: null,
    meta: collectMeta(),
  };
}

export const api = {
  /**
   * Створює запис сесії. Повертає запис із серверним `id` -
   * саме його треба використовувати в наступних PATCH-запитах.
   */
  createSession(clientId: string): Promise<QuizSession> {
    return request<QuizSession>("/sessions", {
      method: "POST",
      body: JSON.stringify(emptySession(clientId)),
    });
  },

  getSession(id: string): Promise<QuizSession> {
    return request<QuizSession>(`/sessions/${id}`);
  },

  patchSession(id: string, patch: Partial<QuizSession>): Promise<QuizSession> {
    return request<QuizSession>(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...patch, updatedAt: new Date().toISOString() }),
    });
  },

  /** Окрема колекція лідів - те, що бізнесу потрібно не втратити. */
  createLead(payload: {
    sessionId: string;
    about: string;
    profileId: ProfileId | null;
    intent: "analysis" | "booking";
  }): Promise<unknown> {
    return request("/leads", {
      method: "POST",
      body: JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
    });
  },

  createBooking(payload: {
    sessionId: string;
    calLink: string;
    detail: unknown;
  }): Promise<unknown> {
    return request("/bookings", {
      method: "POST",
      body: JSON.stringify({ ...payload, createdAt: new Date().toISOString() }),
    });
  },
};
