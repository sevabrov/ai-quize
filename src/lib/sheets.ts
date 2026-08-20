/**
 * Запис результатів у Google Таблицю через Apps Script Web App.
 *
 * Код самого ендпоінта - у google-apps-script/Code.gs, інструкція - у
 * docs/google-sheets.md.
 *
 * Правило те саме, що й для api.ts: жодна помилка тут не має ламати квіз.
 * Тому все fire-and-forget, помилка лише в консоль.
 *
 * Важливо: ключ рядка береться з localStorage, а НЕ з json-server. У проді
 * json-server немає, і прив'язка до нього означала б порожню таблицю.
 */

import { env } from "./env";
import { newSessionId } from "./api";
import { readSessionId, writeSessionId } from "./storage";
import { profiles } from "../data/profiles";
import type { QuizResult } from "./scoring";

export interface SheetRow {
  /** Питання 1 повністю: ім'я, вік, місто, опис - одним блоком, без розбиття */
  about?: string;
  completedAt?: string;
  profile?: string;
  scores?: string;
  answers?: string;
  booked?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  meetingAt?: string;
  meetingUrl?: string;
  note?: string;
}

/**
 * Стабільний ключ рядка на весь час життя людини в браузері.
 * Той самий clientId, що використовує useSessionSync.
 */
function rowKey(): string {
  const existing = readSessionId();
  if (existing) return existing;

  const id = newSessionId();
  writeSessionId(id);
  return id;
}

export function pushToSheet(row: SheetRow): void {
  if (!env.sheetsUrl) return;

  const payload = JSON.stringify({
    secret: env.sheetsSecret,
    row: { ...row, sessionId: rowKey() },
  });

  void fetch(env.sheetsUrl, {
    method: "POST",
    /**
     * КРИТИЧНО: text/plain, а не application/json.
     * З application/json браузер шле preflight OPTIONS, а Apps Script його
     * не обробляє - запит падає на CORS. text/plain робить запит «простим»,
     * без preflight. На боці скрипта тіло все одно читається як JSON.
     */
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: payload,
    /** Щоб запис долетів, навіть якщо людина одразу закриє вкладку */
    keepalive: true,
  }).catch((error: unknown) => {
    console.warn("[quiz] не вдалося записати в таблицю:", error);
  });
}

/* ─────────────────────── форматування ─────────────────────── */

const KYIV_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: "Europe/Kyiv",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

/** ISO → «20.08.2026, 17:30» у київському часі. Порожній рядок, якщо дати немає. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("uk-UA", KYIV_FORMAT);
}

/** Топ-3 профілі з балами - щоб було видно, наскільки результат впевнений. */
export function formatScores(result: QuizResult): string {
  return result.scores
    .slice(0, 3)
    .map((entry) => {
      const profile = profiles.find((p) => p.id === entry.profileId);
      return `${profile?.name ?? entry.profileId} ${entry.score}`;
    })
    .join(" · ");
}

/** Відповіді одним рядком у форматі сигналів scoring-engine: «2c · 3a · 4d». */
export function formatAnswers(answers: Record<number, string>): string {
  return Object.entries(answers)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([questionId, optionId]) => `${questionId}${optionId}`)
    .join(" · ");
}

/* ─────────────────────── дані бронювання ─────────────────────── */

export interface BookingContacts {
  email: string;
  phone: string;
  telegram: string;
  meetingAt: string;
  meetingUrl: string;
  note: string;
}

/**
 * Витяг контактів із payload Cal.com (подія bookingSuccessful).
 * Форму полів видно в db.json → bookings[].detail.data.booking.responses.
 */
export function readCalDetail(detail: unknown): BookingContacts {
  const booking =
    (detail as { data?: { booking?: Record<string, unknown> } })?.data
      ?.booking ?? {};

  const responses = (booking.responses ?? {}) as Record<string, unknown>;
  const attendee = ((booking.attendees as unknown[])?.[0] ?? {}) as Record<
    string,
    unknown
  >;
  const references = (booking.references ?? []) as { type?: string; meetingUrl?: string }[];
  const zoom = references.find((ref) => ref.type === "zoom_video");

  const text = (value: unknown): string =>
    typeof value === "string" ? value : "";

  return {
    email: text(responses.email) || text(attendee.email),
    phone: text(responses.attendeePhoneNumber) || text(attendee.phoneNumber),
    /** Назва кастомного поля в Cal.com - рівно як у формі бронювання */
    telegram: text(responses.Telegram) || text(responses.telegram),
    meetingAt: formatDateTime(text(booking.startTime) || null),
    meetingUrl: text(zoom?.meetingUrl),
    note: text(responses.notes),
  };
}
