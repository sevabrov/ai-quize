/**
 * Таймінг зі змінної оточення. Некоректне або відсутнє значення - fallback із ТЗ.
 * import.meta.env завжди віддає рядки, тому Number() тут обов'язковий.
 */
function delayMs(raw: unknown, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const apiUrl = String(
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
)
  .trim()
  .replace(/\/+$/, '');

export const env = {
  /**
   * json-server (mock REST API).
   *
   * Порожнє значення = статичний режим (GitHub Pages): бекенду немає,
   * запити не виконуються взагалі. Див. isApiEnabled і api.ts.
   */
  apiUrl,

  /**
   * Google Таблиця через Apps Script Web App (…/exec).
   * Порожнє значення = запис у таблицю вимкнено, квіз працює як раніше.
   * Налаштування: docs/google-sheets.md
   */
  sheetsUrl: import.meta.env.VITE_SHEETS_URL ?? '',
  sheetsSecret: import.meta.env.VITE_SHEETS_SECRET ?? '',

  /** Cal.com: <username>/<event-type>, напр. olena/consultation */
  calLink: 'vsevolod-brovarnyi-t7v9gb/test-consultation',
  calNamespace: 'olena-razbor',

  /** Партнерське посилання MIHI з ТЗ */
  mihiUrl:
    import.meta.env.VITE_MIHI_URL ??
    'https://mihi.care/ua/a-79-mihi-the-business-of-a-new-era?referral_code=100001',

  /** 3 хвилини за ТЗ. Для демо замовнику - VITE_ANALYSIS_DELAY_MS=8000. */
  analysisDelayMs: delayMs(import.meta.env.VITE_ANALYSIS_DELAY_MS, 3 * 60 * 1000),

  /** Ще 3 хвилини - щоб людина встигла прочитати аналіз перед CTA на розбір. */
  bookingNudgeDelayMs: delayMs(
    import.meta.env.VITE_BOOKING_NUDGE_DELAY_MS,
    3 * 60 * 1000,
  ),
} as const;

/**
 * Чи є за фронтом json-server. false на GitHub Pages - там єдине джерело
 * правди це localStorage (прогрес) і Google Таблиця (результати).
 */
export const isApiEnabled = env.apiUrl !== '';

export const isDemoMode =
  env.analysisDelayMs < 60_000 || env.bookingNudgeDelayMs < 60_000;
