// בדיקה אוטומטית של הפקת ה-PDF - במיוחד מול הבאג שהיה באייפון.
//
// הבאג: html2canvas מודד את מיקום הטקסט עם הפונט האמיתי, אבל מצייר על ה-canvas
// עם הפונט שזמין ל-canvas באותו רגע. אם הפונט לא הגיע ל-canvas (קרה בפועל
// באייפון) - המדידה והציור לא תואמים והמילים נדבקות זו לזו בלי רווח.
// התיקון: הפונטים מוטמעים ב-fonts.css כ-data URI, אז אין בקשת רשת שיכולה להיכשל.
//
// הבדיקה מוודאת בדיוק את זה: מריצה את ההורדה פעמיים - פעם רגיל ופעם כשכל
// בקשות הפונטים חסומות - ומוודאת שהפלט זהה בייט-לבייט. אם מישהו יחזיר בטעות
// פונט שנטען מהרשת, הבדיקה תיפול.
//
// הרצה:
//   npm i playwright && npx playwright install webkit
//   python3 -m http.server 8123   (בתיקיית הפרויקט, בטרמינל נפרד)
//   node test-pdf.mjs

import { webkit, devices } from 'playwright';
import crypto from 'crypto';

const APP_URL = process.env.APP_URL || 'http://localhost:8123';

async function run(blockFonts) {
  const browser = await webkit.launch();
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));

  let fontReqs = 0;
  if (blockFonts) {
    await context.route('**/*.woff2', (route) => {
      fontReqs++;
      route.abort();
    });
  }

  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.fill('input[type=text]', 'תכשיטים בעם');
  await page.click('.btn-primary');
  await page.waitForTimeout(150);
  await page.fill('.price-box input[type=number]', '8000');
  await page.click('.btn-primary');
  await page.waitForTimeout(150);
  await page.click('.btn-primary');
  await page.waitForTimeout(500);

  const pages = await page.evaluate(async () => {
    await document.fonts.ready;
    const out = {};
    for (const id of ['doc-page1', 'doc-page2']) {
      const el = document.getElementById(id);
      const wrap = el.parentElement;
      el.style.transform = 'none';
      wrap.style.width = '';
      wrap.style.height = '';
      wrap.style.overflow = 'visible';
      const canvas = await window.html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      out[id] = canvas.toDataURL('image/png');
    }
    // האם ה-canvas באמת מצליח להשתמש ב-Heebo, או נופל לפונט ברירת מחדל?
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = '400 13.5px Heebo, sans-serif';
    const heebo = probe.measureText('ניהול סושיאל').width;
    probe.font = '400 13.5px sans-serif';
    const fallback = probe.measureText('ניהול סושיאל').width;
    out.__usesRealFont = heebo !== fallback;
    return out;
  });

  await browser.close();

  const hashes = {};
  for (const id of ['doc-page1', 'doc-page2']) {
    hashes[id] = crypto.createHash('md5').update(pages[id]).digest('hex');
  }
  return { hashes, usesRealFont: pages.__usesRealFont, fontReqs, errors };
}

const normal = await run(false);
const blocked = await run(true);

let failed = false;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' - ' + detail : ''}`);
  if (!ok) failed = true;
}

check('אין שגיאות JS', normal.errors.length === 0, normal.errors[0]);
check('ה-canvas משתמש בפונט האמיתי (לא נפילה לברירת מחדל)', normal.usesRealFont);
check('אין בקשות רשת לפונטים (מוטמעים ב-CSS)', normal.fontReqs === 0 && blocked.fontReqs === 0);
check(
  'הפלט זהה גם כשהרשת חוסמת פונטים - עמוד 1',
  normal.hashes['doc-page1'] === blocked.hashes['doc-page1'],
  `${normal.hashes['doc-page1']} vs ${blocked.hashes['doc-page1']}`
);
check(
  'הפלט זהה גם כשהרשת חוסמת פונטים - עמוד 2',
  normal.hashes['doc-page2'] === blocked.hashes['doc-page2'],
  `${normal.hashes['doc-page2']} vs ${blocked.hashes['doc-page2']}`
);

process.exit(failed ? 1 : 0);
