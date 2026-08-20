/**
 * Ендпоінт запису результатів AI-квізу в Google Таблицю.
 *
 * Куди вставляти: Таблиця → Розширення → Apps Script → замінити вміст Code.gs.
 * Далі: Розгорнути → Новий розгорток → Веб-додаток
 *        • Виконувати як:   Я
 *        • Хто має доступ:  Усі (Anyone)
 * Отриманий URL (…/exec) кладеться в .env як VITE_SHEETS_URL.
 *
 * Контракт із фронтом (src/lib/sheets.ts):
 *   POST { secret: "…", row: { sessionId, about, profile, … } }
 *   Content-Type: text/plain  (див. коментар у sheets.ts - через CORS)
 *
 * Один рядок = одна людина. Ключ дедуплікації - sessionId.
 */

/**
 * ID вашої таблиці - з її URL:
 *   docs.google.com/spreadsheets/d/[ЦЕЙ_ДОВГИЙ_РЯДОК]/edit
 *
 * Порожньо = скрипт пише в ту таблицю, до якої він прив'язаний
 * (варіант «Розширення → Apps Script» усередині самої таблиці).
 * Заповнено = пише в таблицю за ID, звідки б скрипт не запускався.
 */
const SPREADSHEET_ID = '1Dp4V2Em9zJgIePSYdQ7JBAReQplR0XYRpOrFPNi-YCs';

/** Назва аркуша (вкладки внизу). Якщо такого немає - буде створений. */
const SHEET_NAME = 'Заявки';

/**
 * Спільний пароль, який ви вигадуєте самі, - щоб у таблицю не писав хто завгодно.
 * Це НЕ Deployment ID і не Web app URL: у Google такого значення немає.
 *
 * Має посимвольно збігатися з VITE_SHEETS_SECRET у .env проєкту.
 * Після зміни обов'язково зробити НОВУ версію розгортка, інакше працює стара.
 */
const SECRET = 'oq7Kd2mXvR4tZbN9sLpH3wYcJf6UgA1e';

/** Порядок = порядок колонок. Перший елемент - ключ у payload, другий - шапка. */
const COLUMNS = [
  ['completedAt', 'Пройдено'],
  ['sessionId', 'ID сесії'],
  ['about', 'Про себе'],
  ['profile', 'Профіль'],
  ['scores', 'Бали'],
  ['answers', 'Відповіді'],
  ['booked', 'Консультація'],
  ['email', 'Пошта'],
  ['phone', 'Телефон'],
  ['telegram', 'Telegram'],
  ['meetingAt', 'Дата консультації'],
  ['meetingUrl', 'Zoom'],
  ['note', 'Коментар'],
  ['updatedAt', 'Оновлено'],
];

function doPost(e) {
  // Завершення квізу й бронювання можуть прилетіти майже одночасно -
  // без замка два записи затруть один одному рядок.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json({ ok: false, error: 'forbidden' });

    const row = body.row || {};
    if (!row.sessionId) return json({ ok: false, error: 'sessionId required' });

    row.updatedAt = formatNow();
    upsert(row);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Перевірка, що деплой живий: просто відкрити /exec у браузері. */
function doGet() {
  return json({ ok: true, service: 'ai-quiz-sheets' });
}

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error(
      'Скрипт не прив’язаний до таблиці. Або створіть його через ' +
        'Розширення → Apps Script усередині таблиці, або заповніть SPREADSHEET_ID.',
    );
  }
  return active;
}

function getSheet() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      COLUMNS.map(function (c) {
        return c[1];
      }),
    );
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // «Про себе» - довгий вільний текст, без обрізання рядок розтягне всю таблицю
    sheet
      .getRange(1, 3, sheet.getMaxRows(), 1)
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    sheet.setColumnWidth(3, 420);
  }
  return sheet;
}

function upsert(row) {
  const sheet = getSheet();
  const keys = COLUMNS.map(function (c) {
    return c[0];
  });
  const idCol = keys.indexOf('sessionId') + 1;
  const lastRow = sheet.getLastRow();

  var target = 0;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(row.sessionId)) {
        target = i + 2;
        break;
      }
    }
  }

  if (!target) {
    sheet.appendRow(
      keys.map(function (k) {
        return row[k] == null ? '' : row[k];
      }),
    );
    return;
  }

  // КРИТИЧНО: оновлюємо лише ті клітинки, що реально приїхали.
  // Інакше запит про бронювання (він несе тільки контакти) затер би
  // результати квізу порожнечею.
  const range = sheet.getRange(target, 1, 1, keys.length);
  const values = range.getValues()[0];
  keys.forEach(function (k, i) {
    if (row[k] != null && row[k] !== '') values[i] = row[k];
  });
  range.setValues([values]);
}

function formatNow() {
  return Utilities.formatDate(
    new Date(),
    'Europe/Kyiv',
    'dd.MM.yyyy, HH:mm:ss',
  );
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
