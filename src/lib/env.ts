export const env = {
  /** json-server (mock REST API). Для production замінюється на реальний бекенд. */
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',

  /**
   * Google Таблиця через Apps Script Web App (…/exec).
   * Порожнє значення = запис у таблицю вимкнено, квіз працює як раніше.
   * Налаштування: docs/google-sheets.md
   */
  sheetsUrl:
    import.meta.env.VITE_SHEETS_URL ??
    'https://script.google.com/macros/s/AKfycbyb7JUGf4Cl18cgYO3Zi0xITYlYMHc55Y9c0fDwaTV9nWVv-__Jv39z_x0TKj38bpPatw/exec',
  sheetsSecret:
    import.meta.env.VITE_SHEETS_SECRET ?? 'oq7Kd2mXvR4tZbN9sLpH3wYcJf6UgA1e',

  /** Cal.com: <username>/<event-type>, напр. olena/consultation */
  calLink: 'vsevolod-brovarnyi-t7v9gb/test-consultation',
  calNamespace: 'olena-razbor',

  /** Партнерське посилання MIHI з ТЗ */
  mihiUrl:
    'https://mihi.care/ua/a-79-mihi-the-business-of-a-new-era?referral_code=100001',

  /** 3 хвилини за ТЗ. Для демо замовнику можна поставити 8000. */
  analysisDelayMs: 3 * 60 * 1000,

  /** Ще 3 хвилини - щоб людина встигла прочитати аналіз перед CTA на розбір. */
  bookingNudgeDelayMs: 3 * 60 * 1000,
} as const;

export const isDemoMode =
  env.analysisDelayMs < 60_000 || env.bookingNudgeDelayMs < 60_000;
