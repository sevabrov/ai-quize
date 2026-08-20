/**
 * Шлях до файлу з `public/`.
 *
 * Vite підставляє `base` тільки в index.html і в справжніх імпортах, а рядки
 * на кшталт "/1.png" усередині коду лишає як є. На GitHub Pages сайт живе у
 * підпапці (/ai-quize/), тому такий шлях дав би 404 - звідси цей хелпер.
 *
 * `import.meta.env.BASE_URL` завжди закінчується слешем: "/" або "/ai-quize/".
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
