# Публікація

## Демо для замовника: GitHub Pages

GitHub Pages віддає **тільки статичні файли** - json-server там запустити
неможливо (це Node-процес, який пише у файл). Тому демо-збірка йде у
статичному режимі:

| Що                        | Де живе на Pages                        |
| ------------------------- | --------------------------------------- |
| Прогрес квізу, F5, блокування повторного проходження | `localStorage` (`src/lib/storage.ts`) |
| Відповіді, профіль, бронювання | Google Таблиця (`src/lib/sheets.ts`) |
| json-server (`sessions`, `leads`, `bookings`) | не використовується    |

Це не втрата даних: `sheets.ts` від початку писався незалежно від
json-server і ключує рядок по `clientId` з localStorage.

### Одноразове налаштування

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Secrets** - додати:
   - `VITE_SHEETS_URL` - URL розгортки Apps Script (`…/exec`)
   - `VITE_SHEETS_SECRET` - той самий SECRET, що в `google-apps-script/Code.gs`
3. Там же, вкладка **Variables** (необов'язково, для демо) - щоб замовник не
   чекав по 3 хвилини:
   - `VITE_ANALYSIS_DELAY_MS` = `8000`
   - `VITE_BOOKING_NUDGE_DELAY_MS` = `8000`

Далі кожен push у `main` публікує сайт: `.github/workflows/pages.yml`.
Ручний запуск - вкладка Actions → Deploy to GitHub Pages → Run workflow.

Адреса: **https://sevabrov.github.io/ai-quize/**

### Чому `--base=/ai-quize/`

Сайт живе у підпапці, тому збірка для Pages робиться скриптом
`npm run build:pages`. Vite сам переписує шляхи в `index.html`, але рядки
всередині коду (`"/1.png"`) - ні, тому всі файли з `public/` беруться через
`asset()` з `src/lib/asset.ts`. Якщо додаєш нову картинку в `public/` -
звертайся до неї тільки через `asset()`, інакше на Pages буде 404.

Роутера в застосунку немає (екрани перемикаються станом), тому `404.html`
для SPA-фолбеку не потрібен.

### Що врахувати

- `VITE_SHEETS_SECRET` попадає у клієнтський бандл - це не таємниця, а
  анти-спам для Apps Script. На Pages бандл публічний за визначенням.
- Локальний прогрес прив'язаний до браузера. Щоб пройти квіз ще раз, потрібно
  очистити `localStorage` (правило «1 діагностика = 1 користувач»).
- Для локального перегляду збірки використовуй `npm run build` (base `/`),
  а не `build:pages` - інакше `npm run preview` не знайде ассети.

## Продакшн із json-server

Pages для цього не підходить - потрібен хостинг, який тримає Node-процес і
постійну файлову систему під `db.json`. Дивись окрему секцію (hostiq.ua).
