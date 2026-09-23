// בדיקות פריסה של האשף - מול באגים שכבר קרו, כדי שלא יחזרו.
//
// שלושה באגים אמיתיים שנתפסו כאן:
//
// 1. "הטקסט נמרח מלמעלה למטה" - כשנבחר "מחיר לכל שירות", שדה המחיר תפס 286px
//    מתוך 286px זמינים (כלל הבסיס input[type='number'] עם width:100% ניצח את
//    .service-price-input בגלל ספציפיות), ושדה השירות נמחץ ל-18px - תו אחד
//    בשורה, 597px לגובה.
// 2. טקסט שירות שנחתך - כשהשדה היה input של שורה אחת, 4 מתוך 11 השירותים היו
//    ארוכים מהשדה ואי אפשר היה לראות מה ייכתב ללקוח.
// 3. "להצעהכברירת" - שתי מילים דבוקות, כי ל-.opt-hint לא היה display:block
//    בתוך .vat-toggle.
// 4. "יש הצעה שלא סיימת" הופיע גם על הצעות שכבר נוצרו ונשלחו, כי הטיוטה
//    נמחקה רק בלחיצה על "התחלת הצעת מחיר חדשה".
// 5. שדות המחיר פתחו באייפון את מקלדת הסימנים (עם אותיות) במקום לוח ספרות,
//    כי type="number" לבדו לא מספיק - צריך inputmode.
// 6. בלי חיבור נוצר קובץ על המכשיר, ושם העברית נשברה. היום לא נוצר קובץ
//    בכלל בלי חיבור, ובמקומו מוצגת הודעה - כדי שלא יישלח ללקוח קובץ שבור.
//
// הבדיקה רצה בכמה רוחבי מסך, כי הבאג הראשון תלוי ברוחב.
//
// הרצה:  node test-ui.mjs

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CHROME =
  process.env.LOCAL_CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// מתחת לזה הטקסט מתחיל להימרח - מילה או תו בשורה במקום שורה קריאה
const MIN_LABEL_WIDTH = 90;
// גובה סביר לשירות הארוך ביותר. 597px היה הבאג
const MAX_LABEL_HEIGHT = 160;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

const FAKE_PDF = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(4096, 0x20)]);

function startServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    // קיצור דרך: הבדיקות כאן על הממשק, לא על הרינדור. test-pdf.mjs הוא זה
    // שמייצר PDF אמיתי ובודק אותו.
    if (url.pathname === '/api/pdf') {
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': FAKE_PDF.length });
      res.end(FAKE_PDF);
      return;
    }

    const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const file = path.join(ROOT, rel);
    if (path.relative(ROOT, file).startsWith('..')) return res.writeHead(403).end('no');
    try {
      const body = await fsp.readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch (e) {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let failed = false;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -  ' + detail : ''}`);
  if (!ok) failed = true;
}

async function measure(page, perService) {
  if (perService) {
    await page.evaluate(() => {
      const opt = [...document.querySelectorAll('.mode-option')].find((o) =>
        o.textContent.includes('מחיר לכל שירות')
      );
      opt.querySelector('input').click();
    });
    await wait(350);
  }
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll('.service-row')];
    const labels = rows.map((r) => {
      const el = r.querySelector('.service-label-input');
      const box = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        width: Math.round(box.width),
        height: Math.round(box.height),
        // autoGrow מגדיר height לפי scrollHeight, אז הפרש קטן הוא רק הגבולות
        clipped: el.scrollHeight - el.clientHeight > 4,
        overflowsRow: box.width > r.clientWidth + 1,
      };
    });
    const price = rows[0].querySelector('.service-price-input');
    return {
      count: labels.length,
      minWidth: Math.min(...labels.map((l) => l.width)),
      maxHeight: Math.max(...labels.map((l) => l.height)),
      clipped: labels.filter((l) => l.clipped).length,
      overflowing: labels.filter((l) => l.overflowsRow).length,
      notTextarea: labels.filter((l) => l.tag !== 'TEXTAREA').length,
      priceWidth: price ? Math.round(price.getBoundingClientRect().width) : null,
      rowWidth: rows[0].clientWidth,
    };
  });
}

// בלי חיבור: לא נוצר קובץ, מוצגת הודעה, וההצעה לא מסומנת כגמורה
async function offlineBehaviour(browser, port, downloadDir) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));
  const cdp = await page.createCDPSession();
  await cdp.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDir,
    eventsEnabled: true,
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
  await page.type('#step-body input[type=text]', 'לקוח אופליין');
  await page.click('#next-btn');
  await wait(300);
  await page.type('#step-body .price-box input[type=number]', '8000');
  await page.click('#next-btn');
  await wait(300);

  await page.setOfflineMode(true);
  await page.click('#next-btn');
  await page.waitForSelector('.preview-overlay.open');
  await wait(3000);

  const notice = await page.evaluate(() => {
    const el = document.getElementById('preview-notice');
    return { shown: el.style.display === 'block', text: el.textContent };
  });
  check('אופליין · מוצגת הודעה שאי אפשר ליצור קובץ', notice.shown, notice.text.slice(0, 50));
  check(
    'אופליין · ההודעה אומרת שההצעה נשמרה',
    notice.text.includes('ההצעה נשמרה'),
    notice.text.slice(0, 60)
  );

  // התצוגה עצמה חייבת להמשיך לעבוד בלי חיבור
  const preview = await page.evaluate(() => document.getElementById('doc-page1').innerText);
  check('אופליין · התצוגה המקדימה עדיין נכונה', preview.includes('9,440'));

  await page.evaluate(() => document.getElementById('download-btn').click());
  await wait(3000);
  const files = fs.readdirSync(downloadDir).filter((f) => f.endsWith('.pdf'));
  check('אופליין · לא ירד שום קובץ', files.length === 0, files.join(', '));

  await wait(2600);
  const draft = await page.evaluate(() => {
    const raw = localStorage.getItem('spicy-quote-draft-v1');
    return raw ? JSON.parse(raw) : null;
  });
  check('אופליין · ההצעה לא מסומנת כגמורה', draft && draft.completed === false);

  // כשהחיבור חוזר, הקובץ מוכן בלי שצריך ללחוץ שוב
  await page.setOfflineMode(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.waitForFunction(
    () => document.getElementById('preview-notice').style.display === 'none',
    { timeout: 20000 }
  );
  check('אופליין · ההודעה נעלמת כשהחיבור חוזר', true);
  await wait(2600);
  const after = await page.evaluate(() => {
    const raw = localStorage.getItem('spicy-quote-draft-v1');
    return raw ? JSON.parse(raw) : null;
  });
  check('אופליין · אחרי שהחיבור חזר ההצעה מסומנת גמורה', after && after.completed === true);

  check('אופליין · אין שגיאות JS', errors.length === 0, errors[0]);
  await page.close();
}

// כל שדה מספרי חייב inputmode, אחרת באייפון נפתחת מקלדת עם אותיות
async function numericKeyboards(browser, port) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
  await page.type('#step-body input[type=text]', 'תכשיטים בעם');
  await page.click('#next-btn');
  await wait(400);

  const packagePrice = await page.evaluate(() => {
    const el = document.querySelector('#step-body .price-box input[type=number]');
    return { mode: el.getAttribute('inputmode'), min: el.min };
  });
  check('מקלדת · מחיר החבילה פותח לוח ספרות', packagePrice.mode === 'decimal', `inputmode=${packagePrice.mode}`);

  // מצב "מחיר לכל שירות"
  await page.evaluate(() => {
    [...document.querySelectorAll('.mode-option')]
      .find((o) => o.textContent.includes('מחיר לכל שירות'))
      .querySelector('input')
      .click();
  });
  await wait(350);
  const perService = await page.evaluate(() =>
    [...document.querySelectorAll('.service-price-input')].map((el) => el.getAttribute('inputmode'))
  );
  check(
    'מקלדת · מחיר לכל שירות פותח לוח ספרות',
    perService.length > 0 && perService.every((m) => m === 'decimal'),
    `${perService.filter((m) => m !== 'decimal').length} שדות בלי inputmode`
  );

  // השדה עדיין מקבל ערך תקין, כולל אגורות
  await page.evaluate(() => {
    [...document.querySelectorAll('.mode-option')]
      .find((o) => o.textContent.includes('מחיר כולל לחבילה'))
      .querySelector('input')
      .click();
  });
  await wait(350);
  await page.type('#step-body .price-box input[type=number]', '8000.5');
  const typed = await page.evaluate(
    () => document.querySelector('#step-body .price-box input[type=number]').value
  );
  check('מקלדת · אפשר עדיין להקליד מחיר עם אגורות', typed === '8000.5', `התקבל "${typed}"`);

  // שדה התוקף - ימים שלמים
  await page.click('#next-btn');
  await wait(400);
  const days = await page.evaluate(() => {
    const el = document.querySelector('#step-body .validity-row input[type=number]');
    return el ? el.getAttribute('inputmode') : null;
  });
  check('מקלדת · תוקף ההצעה פותח לוח ספרות שלמות', days === 'numeric', `inputmode=${days}`);

  // אין שדה מספרי ששכחנו
  const missing = await page.evaluate(
    () => [...document.querySelectorAll('input[type=number]')].filter((el) => !el.getAttribute('inputmode')).length
  );
  check('מקלדת · לא נשאר שדה מספרי בלי inputmode', missing === 0, `${missing} שדות`);

  await page.close();
}

// מחזור החיים של הטיוטה: מה נחשב "הצעה שלא סיימת"
async function draftLifecycle(browser, port) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));

  const stored = () =>
    page.evaluate(() => {
      const raw = localStorage.getItem('spicy-quote-draft-v1');
      return raw ? JSON.parse(raw) : null;
    });
  const bannerShown = () =>
    page.evaluate(() => document.getElementById('draft-banner').style.display === 'flex');

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });

  // נעזבה באמצע -> טיוטה פתוחה
  await page.type('#step-body input[type=text]', 'תכשיטים בעם');
  await page.click('#next-btn');
  await wait(300);
  await page.type('#step-body .price-box input[type=number]', '8000');
  await wait(2600);
  const midway = await stored();
  check('טיוטה · הצעה שנעזבה באמצע נשמרת כלא גמורה', midway && midway.completed === false);
  await page.reload({ waitUntil: 'networkidle0' });
  await wait(300);
  check('טיוטה · הבאנר מופיע על הצעה שנעזבה באמצע', await bannerShown());

  // הושלמה עד המסך הסופי -> גמורה
  await page.click('#draft-resume-btn');
  await wait(400);
  await page.click('#next-btn');
  await wait(300);
  await page.click('#next-btn');
  await page.waitForSelector('.preview-overlay.open');
  await wait(2600);
  const done = await stored();
  check('טיוטה · אחרי "צור הצעת מחיר" ההצעה מסומנת גמורה', done && done.completed === true);
  await page.reload({ waitUntil: 'networkidle0' });
  await wait(400);
  check('טיוטה · אין באנר על הצעה שכבר נוצרה', (await bannerShown()) === false);

  // ניווט בין שלבים בלי לשנות תוכן -> נשארת גמורה
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.type('#step-body input[type=text]', 'לקוח שני');
  await page.click('#next-btn');
  await wait(300);
  await page.type('#step-body .price-box input[type=number]', '5000');
  await page.click('#next-btn');
  await wait(300);
  await page.click('#next-btn');
  await page.waitForSelector('.preview-overlay.open');
  await wait(2600);
  await page.click('#close-preview-btn');
  await wait(300);
  await page.click('#back-btn');
  await wait(300);
  await page.click('#next-btn');
  await wait(2600);
  const navigated = await stored();
  check('טיוטה · מעבר בין שלבים לבדו לא מחזיר אותה לטיוטה', navigated && navigated.completed === true);

  // שינוי תוכן אחרי היצירה -> חוזרת להיות טיוטה
  await page.click('#back-btn');
  await wait(300);
  await page.type('#step-body .price-box input[type=number]', '9');
  await wait(2600);
  const edited = await stored();
  check('טיוטה · שינוי תוכן אחרי היצירה מחזיר אותה לטיוטה', edited && edited.completed === false);
  await page.reload({ waitUntil: 'networkidle0' });
  await wait(400);
  check('טיוטה · הבאנר חוזר אחרי שינוי תוכן', await bannerShown());

  // טיוטה בפורמט הישן (בלי הסימון) נחשבת גמורה
  await page.evaluate(() => {
    localStorage.setItem(
      'spicy-quote-draft-v1',
      JSON.stringify({ savedAt: Date.now(), state: { clientName: 'לקוח ישן', packagePrice: '1000' } })
    );
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await wait(400);
  check('טיוטה · טיוטה מהפורמט הישן לא מציקה שוב', (await bannerShown()) === false);

  check('טיוטה · אין שגיאות JS', errors.length === 0, errors[0]);
  await page.close();
}

const { server, port } = await startServer();
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox'],
});

try {
  for (const width of [320, 375, 390, 430]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e.message)));

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    await page.type('#step-body input[type=text]', 'תכשיטים בעם');
    await page.click('#next-btn');
    await wait(400);

    for (const perService of [false, true]) {
      const mode = perService ? 'מחיר לכל שירות' : 'מחיר כולל לחבילה';
      const m = await measure(page, perService);
      const at = `${width}px · ${mode}`;

      check(`${at} · שדה השירות הוא textarea`, m.notTextarea === 0, `${m.notTextarea} נשארו input`);
      check(
        `${at} · הטקסט לא נמרח לעמודה צרה`,
        m.minWidth >= MIN_LABEL_WIDTH,
        `רוחב מינימלי ${m.minWidth}px (מינימום ${MIN_LABEL_WIDTH})`
      );
      check(
        `${at} · אין שורה שמתמתחת לגובה חריג`,
        m.maxHeight <= MAX_LABEL_HEIGHT,
        `גובה מקסימלי ${m.maxHeight}px (מקסימום ${MAX_LABEL_HEIGHT})`
      );
      check(`${at} · הטקסט נראה במלואו`, m.clipped === 0, `${m.clipped} שדות חתוכים`);
      check(`${at} · שום שדה לא גולש מהשורה`, m.overflowing === 0, `${m.overflowing} גולשים`);
      if (perService) {
        check(
          `${at} · שדה המחיר בגודלו ולא תופס את השורה`,
          m.priceWidth === 88,
          `${m.priceWidth}px מתוך ${m.rowWidth}px`
        );
      }
    }

    // התווית וההסבר חייבים להיות בשתי שורות נפרדות
    const vat = await page.evaluate(() => {
      const el = document.querySelector('.vat-toggle');
      return el ? el.innerText : '';
    });
    check(
      `${width}px · תווית המע״מ לא דבוקה להסבר`,
      vat.includes('להצעה\n') && !vat.includes('להצעהכברירת'),
      JSON.stringify(vat.replace(/\n/g, ' | ').slice(0, 60))
    );

    check(`${width}px · אין שגיאות JS`, errors.length === 0, errors[0]);
    await page.close();
  }

  await numericKeyboards(browser, port);
  await offlineBehaviour(browser, port, await fsp.mkdtemp(path.join(os.tmpdir(), 'spicy-ui-')));
  await draftLifecycle(browser, port);
} finally {
  await browser.close();
  server.close();
}

process.exit(failed ? 1 : 0);
