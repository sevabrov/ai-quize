/**
 * Локальне збереження прогресу - щоб перезавантаження сторінки не обнуляло квіз
 * і щоб 3-хвилинний таймер аналізу тривав правильно навіть після F5.
 */

const STATE_KEY = "ai-quiz:flow:v1";
const SESSION_KEY = "ai-quiz:session-id:v1";
const REMOTE_KEY = "ai-quiz:remote-id:v1";

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
