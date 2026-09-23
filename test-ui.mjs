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
//
// הבדיקה רצה בכמה רוחבי מסך, כי הבאג הראשון תלוי ברוחב.
//
// הרצה:  node test-ui.mjs

import http from 'node:http';
import fsp from 'node:fs/promises';
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

function startServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
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
} finally {
  await browser.close();
  server.close();
}

process.exit(failed ? 1 : 0);
