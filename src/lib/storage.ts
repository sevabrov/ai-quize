/**
 * Локальне збереження прогресу - щоб перезавантаження сторінки не обнуляло квіз
 * і щоб 3-хвилинний таймер аналізу тривав правильно навіть після F5.
 */

const STATE_KEY = "ai-quiz:flow:v1";
const SESSION_KEY = "ai-quiz:session-id:v1";
const REMOTE_KEY = "ai-quiz:remote-id:v1";
/**
 * Позначка «діагностику вже пройдено».
 * Живе окремим ключем і НЕ видаляється разом із прогресом:
 * правило «1 діагностика = 1 користувач» має переживати і «Почати заново», і F5.
 */
const COMPLETED_KEY = "ai-quiz:completed:v1";
/**
 * Позначка «зустріч уже заброньовано».
 * Так само окремий ключ, який переживає F5: правило «1 бронювання = 1 користувач»
 * не має залежати від того, чи лишився локальний прогрес.
 */
const BOOKED_KEY = "ai-quiz:booked:v1";

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватний режим / переповнене сховище - не критично */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const storageKeys = {
  state: STATE_KEY,
  session: SESSION_KEY,
  remote: REMOTE_KEY,
  completed: COMPLETED_KEY,
  booked: BOOKED_KEY,
};

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** Наш власний id сесії - стабільний ключ кореляції на клієнті. */
export const readSessionId = () => read(SESSION_KEY);
export const writeSessionId = (id: string) => write(SESSION_KEY, id);

/**
 * id записи, який призначив сервер. json-server сам генерує id при POST
 * і ігнорує переданий, тому для PATCH потрібен саме серверний id.
 */
export const readRemoteId = () => read(REMOTE_KEY);
export const writeRemoteId = (id: string) => write(REMOTE_KEY, id);

/** Факт завершення діагностики - джерело правди для блокування повторного проходження. */
export interface CompletionRecord {
  completedAt: string;
  /** Профіль, який випав - щоб показати його на інтро навіть без збереженого прогресу */
  profileId: string | null;
  /** Серверний id сесії - для звірки з бекендом */
  sessionId: string | null;
}

export function readCompletion(): CompletionRecord | null {
  const record = readJSON<CompletionRecord>(COMPLETED_KEY);
  if (!record || typeof record.completedAt !== "string") return null;
  return record;
}

export function writeCompletion(record: CompletionRecord): void {
  writeJSON(COMPLETED_KEY, record);
}

/** Факт бронювання - джерело правди для блокування повторного запису на розбір. */
export interface BookedRecord {
  bookedAt: string;
  /** Серверний id сесії - для звірки з бекендом */
  sessionId: string | null;
  /** Що саме повернув Cal.com - щоб показати деталі зустрічі без запиту до API */
  detail: unknown;
}

export function readBooked(): BookedRecord | null {
  const record = readJSON<BookedRecord>(BOOKED_KEY);
  if (!record || typeof record.bookedAt !== "string") return null;
  return record;
}

export function writeBooked(record: BookedRecord): void {
  writeJSON(BOOKED_KEY, record);
}
