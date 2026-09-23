// בדיקה מקצה-לקצה של הפקת ה-PDF, מול הבאג שהיה באייפון: מילים דבוקות בלי
// רווח, סוגריים שנצמדים לתחילת המילה ומילים באנגלית שיוצאות שבורות.
//
// הבאג נבע מכך שה-PDF נוצר על המכשיר עצמו ע"י html2canvas, שמיישם מחדש בעצמו
// את פריסת הטקסט במקום להשתמש במנוע הדפדפן - ובעברית עם bidi זה לא מתלכד.
// עכשיו ה-PDF נוצר בשרת ע"י כרום אמיתי, אז הבדיקה מריצה את האפליקציה בדפדפן
// אמיתי, לוחצת על כפתור ההורדה, ובודקת את הקובץ שירד בפועל:
//   - שהטקסט בו הוא טקסט אמיתי (וקטורי) ולא תמונה
//   - שהמילים מופרדות ברווחים
//   - שהסוגריים, הספרות והמילים באנגלית במקום הנכון
//   - שאין עמודים ריקים ושגודל העמוד הוא A4
//
// הרצה:  node test-pdf.mjs
// (מרים לבד שרת מקומי + כרום מקומי; אין תלות בשירות חיצוני)

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { renderPdf, PAGE_W, PAGE_H } from './api/_render.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CHROME =
  process.env.LOCAL_CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
process.env.LOCAL_CHROME_PATH = CHROME;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

function startServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/pdf') {
      const { default: handler } = await import('./api/pdf.js');
      return handler(req, res);
    }

    const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const file = path.join(ROOT, rel);
    if (path.relative(ROOT, file).startsWith('..')) {
      res.writeHead(403).end('no');
      return;
    }
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

// pdf.js מחזיר את קטעי הטקסט בסדר שבו הם צוירו - כלומר משמאל לימין על הדף.
// בעברית זה הסדר ההפוך מהסדר הלוגי, והסוגריים מופיעות בצורתן המשוקפת. כדי
// לבדוק את התוכן כפי שהוא באמת נקרא, משחזרים כל שורה: מקבצים לפי גובה, מסדרים
// מימין לשמאל, ומחזירים לסוגריים את כיוונן הלוגי.
//
// זו בדיוק הבדיקה שמעניינת אותנו: אם הפריסה של ה-bidi הייתה שבורה (סוגר צמוד
// לתחילת המילה, מילה באנגלית שהתהפכה), השחזור הזה לא היה מחזיר טקסט קריא.
const MIRRORED = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<' };

function unmirror(s) {
  return s.replace(/[()[\]{}<>]/g, (c) => MIRRORED[c]);
}

function logicalLines(items) {
  const lines = new Map();
  for (const it of items) {
    if (!it.str) continue;
    const y = Math.round(it.transform[5] * 2) / 2;
    if (!lines.has(y)) lines.set(y, []);
    lines.get(y).push(it);
  }
  return [...lines.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, group]) =>
      group
        .slice()
        .sort((a, b) => b.transform[4] - a.transform[4]) // מימין לשמאל
        .map((it) => unmirror(it.str))
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
    );
}

async function extractPdf(bytes) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: false }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const ops = await page.getOperatorList();
    const imageOps = ops.fnArray.filter(
      (fn) => fn === pdfjs.OPS.paintImageXObject || fn === pdfjs.OPS.paintInlineImageXObject
    ).length;
    pages.push({
      width: viewport.width,
      height: viewport.height,
      items: content.items,
      lines: logicalLines(content.items),
      imageOps,
    });
  }
  return { numPages: doc.numPages, pages };
}

async function fillWizardAndDownload(port, downloadDir) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  // אייפון: בדיוק המכשיר שבו הבאג הופיע
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  const client = await page.createCDPSession();
  await client.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDir,
    eventsEnabled: true,
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });

  await page.type('input[type=text]', 'תכשיטים בעם');
  await page.click('.btn-primary');
  await new Promise((r) => setTimeout(r, 200));
  await page.type('.price-box input[type=number]', '8000');
  await page.click('.btn-primary');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.btn-primary');
  await page.waitForSelector('.preview-overlay.open', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 400));

  const previewShot = path.join(downloadDir, 'preview.png');
  await page.screenshot({ path: previewShot, fullPage: true });

  await page.click('#download-btn');

  // ממתינים לקובץ שירד בפועל
  const deadline = Date.now() + 90000;
  let file = null;
  while (Date.now() < deadline) {
    const found = fs
      .readdirSync(downloadDir)
      .filter((f) => f.endsWith('.pdf') && !f.endsWith('.crdownload'));
    if (found.length) {
      file = path.join(downloadDir, found[0]);
      break;
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  await browser.close();
  return { file, errors, previewShot };
}

/* ======================= הרצה ======================= */

let failed = false;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -  ' + detail : ''}`);
  if (!ok) failed = true;
}

const { server, port } = await startServer();
const downloadDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'spicy-pdf-'));

try {
  const { file, errors, previewShot } = await fillWizardAndDownload(port, downloadDir);

  check('אין שגיאות JS באפליקציה', errors.length === 0, errors[0]);
  check('כפתור ההורדה הוריד קובץ PDF', Boolean(file), file || 'לא ירד קובץ');
  if (!file) throw new Error('no pdf downloaded');

  console.log(`\nקובץ: ${file}`);
  console.log(`תצוגה מקדימה: ${previewShot}\n`);

  const bytes = await fsp.readFile(file);
  const pdf = await extractPdf(bytes);

  check('אין עמודים ריקים או מיותרים (2 עמודים)', pdf.numPages === 2, `numPages=${pdf.numPages}`);

  for (const [i, p] of pdf.pages.entries()) {
    // pdf.js מודד בנקודות (72 לאינץ'), העיצוב בפיקסלים של CSS (96 לאינץ')
    const wMm = (p.width / 72) * 25.4;
    const hMm = (p.height / 72) * 25.4;
    check(
      `עמוד ${i + 1} בגודל A4`,
      Math.abs(wMm - 210) < 1 && Math.abs(hMm - 297) < 1,
      `${wMm.toFixed(1)}x${hMm.toFixed(1)} מ"מ`
    );
    // בגרסה הישנה כל עמוד היה תמונה אחת גדולה בלי טקסט בכלל. עכשיו: טקסט
    // אמיתי, ותמונה אחת לכל היותר (הלוגו).
    check(`עמוד ${i + 1} מכיל טקסט אמיתי ולא תמונה`, p.items.length > 20, `${p.items.length} פריטי טקסט`);
    check(`עמוד ${i + 1} אינו עמוד סרוק`, p.imageOps <= 1, `${p.imageOps} תמונות`);
  }

  const flat = pdf.pages.flatMap((p) => p.lines).join('\n');

  function has(label, needle) {
    const ok = flat.includes(needle);
    check(label, ok, ok ? '' : `לא נמצא: "${needle}"`);
  }

  has('עברית עם רווחים בין מילים', 'הצעת מחיר');
  has('שם העסק באנגלית שלם', 'Spicy Social Media');
  has('שם הלקוח כפי שהוזן', 'תכשיטים בעם');
  has('מילה באנגלית בתוך משפט בעברית', 'story');
  has('אימייל שלם בלי רווח תועה', 'spicysocial.content@gmail.com');
  has('סוגריים + ספרה בתוך טקסט עברי', '(עד 4 שעות נטו)');
  has('סכום מעוצב', '9,440');

  // הבאג המקורי: מילים נדבקות. אם קיים "מהכוללת" או "SpicySocial" - הוא חזר.
  has('סוגר פותח לא נצמד למילה שלפניו', 'מרוכז (עד');
  has('שורה שלמה עם עברית, סוגריים וספרה', 'יום צילום חודשי מרוכז (עד 4 שעות נטו)');

  const glued = ['מהכוללת', 'SpicySocial', 'שחרתורג', 'ניהולסושיאל', 'מרוכז(עד'];
  for (const g of glued) {
    check(`אין מילים דבוקות: ${g}`, !flat.includes(g));
  }

  // כמה רווחים באמת יש? ב-PDF תמונה (הבאג) לא היה אף רווח בטקסט.
  const spaces = (flat.match(/ /g) || []).length;
  check('הטקסט מכיל רווחים אמיתיים', spaces > 80, `${spaces} רווחים`);

  // אימות שהעברית לא "נשברה" לתווים בודדים: ממוצע אורך פריט טקסט סביר
  const lens = pdf.pages.flatMap((p) => p.items.map((it) => it.str.length)).filter((n) => n > 0);
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  check('הטקסט לא מפורק לתווים בודדים', avg > 3, `אורך ממוצע ${avg.toFixed(1)} תווים`);

  // בדיקה שהפלט לא תלוי ברשת של המכשיר: רינדור ישיר בשרת חייב להיות זהה
  const direct = await renderPdf(
    await (async () => {
      const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
      const pg = await b.newPage();
      await pg.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
      await pg.type('input[type=text]', 'תכשיטים בעם');
      await pg.click('.btn-primary');
      await new Promise((r) => setTimeout(r, 200));
      await pg.type('.price-box input[type=number]', '8000');
      await pg.click('.btn-primary');
      await new Promise((r) => setTimeout(r, 200));
      await pg.click('.btn-primary');
      await pg.waitForSelector('.preview-overlay.open');
      const html = await pg.evaluate(() => [
        document.getElementById('doc-page1').innerHTML,
        document.getElementById('doc-page2').innerHTML,
      ]);
      await b.close();
      return html;
    })()
  );
  const directText = (await extractPdf(direct)).pages.flatMap((p) => p.lines).join('\n');
  check('הפלט זהה בין הורדה מהאפליקציה לרינדור ישיר', directText === flat);

  await fsp.writeFile(path.join(downloadDir, 'direct.pdf'), direct);
  console.log(`\nעותק לבדיקה ויזואלית: ${path.join(downloadDir, 'direct.pdf')}`);
  console.log('\n--- הטקסט כפי שהוא נקרא בקובץ ---');
  console.log(flat);
} finally {
  server.close();
}

process.exit(failed ? 1 : 0);
