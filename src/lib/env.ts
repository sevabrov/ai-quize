/**
 * Єдина точка читання конфігурації. Усе, що можна змінити без правок коду.
 */

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  /** json-server (mock REST API). Для production замінюється на реальний бекенд. */
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3001",

  /** Cal.com: <username>/<event-type>, напр. olena/consultation */
  calLink: import.meta.env.VITE_CAL_LINK ?? "olena/consultation",
  calNamespace: "olena-razbor",

  /** Партнерське посилання MIHI з ТЗ */
  mihiUrl:
    import.meta.env.VITE_MIHI_URL ??
    "https://mihi.care/ua/a-79-mihi-the-business-of-a-new-era?referral_code=100001",

  /** 3 хвилини за ТЗ. Для демо замовнику можна поставити 8000. */
  analysisDelayMs: num(import.meta.env.VITE_ANALYSIS_DELAY_MS, 3 * 60 * 1000),

  /** Ще 3 хвилини - щоб людина встигла прочитати аналіз перед CTA на розбір. */
  bookingNudgeDelayMs: num(
    import.meta.env.VITE_BOOKING_NUDGE_DELAY_MS,
    3 * 60 * 1000,
  ),
} as const;

export const isDemoMode =
  env.analysisDelayMs < 60_000 || env.bookingNudgeDelayMs < 60_000;
