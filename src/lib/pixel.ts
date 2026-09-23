/**
 * Facebook (Meta) Pixel.
 *
 * Навіщо: квіз - це SPA без переходів по URL, тому Events Manager сам по собі
 * бачить лише один PageView і жодного уявлення про воронку. Щоб зрозуміти, де
 * саме відвалюються люди, кожен крок сценарію шлемо окремою подією.
 *
 * Порожній env.pixelId = піксель вимкнено: скрипт не вантажиться взагалі,
 * track() стає no-op. Так можна тимчасово прибрати тестові проходження зі
 * статистики замовника - очистити рядок у env.ts.
 */

import { env } from "./env";

type FbqArgs = unknown[];

interface Fbq {
  (...args: FbqArgs): void;
  callMethod?: (...args: FbqArgs) => void;
  queue?: FbqArgs[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";

export const isPixelEnabled = env.pixelId !== "";

let initialized = false;

/**
 * Офіційний снипет Meta, переписаний під TypeScript.
 * Створює чергу fbq до того, як довантажиться fbevents.js, - події з перших
 * секунд (а це якраз початок квізу) не губляться.
 */
function installStub(): void {
  if (window.fbq) return;

  const fbq: Fbq = function (...args: FbqArgs) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue?.push(args);
  };

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = SCRIPT_URL;
  document.head.appendChild(script);
}

/** Викликається один раз зі старту застосунку (main.tsx). */
export function initPixel(): void {
  if (!isPixelEnabled || initialized || typeof window === "undefined") return;

  initialized = true;
  installStub();
  window.fbq?.("init", env.pixelId);
  window.fbq?.("track", "PageView");
}

/** Стандартна подія Meta (Lead, Schedule, ViewContent…). */
export function track(event: string, params?: Record<string, unknown>): void {
  if (!isPixelEnabled) return;
  window.fbq?.("track", event, params);
}

/**
 * Кастомна подія - усе, чого немає в словнику Meta: кроки квізу, вихід,
 * клік по MIHI. В Events Manager вони доступні так само, як стандартні.
 */
export function trackCustom(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (!isPixelEnabled) return;
  window.fbq?.("trackCustom", event, params);
}
