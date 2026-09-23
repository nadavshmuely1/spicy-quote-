// רינדור ההצעה ל-PDF בעזרת כרום אמיתי.
//
// למה בכלל בצד שרת: כל הניסיונות הקודמים רינדרו על המכשיר עצמו (html2canvas
// שמודד ומצייר טקסט בעצמו, או הדפסה טבעית של ספארי). בעברית עם אנגלית וסוגריים
// באמצע (bidi) אף אחד מהם לא מתלכד עם מנוע הפריסה של הדפדפן, והתוצאה על
// האייפון הייתה מילים דבוקות וסוגריים במקום הלא נכון. כשהרינדור קורה כאן,
// אותם בייטים בדיוק נוצרים לכל מכשיר - האייפון רק מוריד קובץ מוכן.
//
// הקלט הוא ה-HTML של העמודים בדיוק כפי שהוא מוצג בתצוגה המקדימה, כך שאין
// שני מימושים שיכולים להיפרד זה מזה: מה שרואים זה מה שנשמר.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// הפונטים והלוגו מגיעים כמודול (נוצר ע"י build-fonts.mjs) ולא כקריאה מהדיסק:
// פונקציה ב-Vercel נארזת לפי הייבואים שלה, אז ייבוא סטטי תמיד מגיע לשרת.
// הקריאה מהדיסק נשארה רק כרשת ביטחון לפיתוח מקומי.
import { FONTS_CSS, ASSETS } from './_assets.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOTS = [process.cwd(), path.join(HERE, '..'), HERE];

// רוחב וגובה עמוד A4 בפיקסלים של CSS (96dpi) - בדיוק המידות של התצוגה המקדימה
export const PAGE_W = 794;
export const PAGE_H = 1123;

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function readAsset(relPath) {
  for (const root of ROOTS) {
    const full = path.join(root, relPath);
    if (path.relative(root, full).startsWith('..')) continue;
    try {
      return fs.readFileSync(full);
    } catch (e) {
      /* ננסה את השורש הבא */
    }
  }
  return null;
}

let fontsCssCache = null;
function fontsCss() {
  if (fontsCssCache === null) {
    if (FONTS_CSS && FONTS_CSS.indexOf('@font-face') !== -1) {
      fontsCssCache = FONTS_CSS;
    } else {
      const buf = readAsset('fonts.css');
      fontsCssCache = buf ? buf.toString('utf8') : '';
    }
    // בלי הפונט העברי המסמך היה יוצא בריבועים ריקים. עדיף להיכשל בקול,
    // ואז הלקוח נופל למסלול המקומי במקום לקבל קובץ הרוס.
    if (fontsCssCache.indexOf('@font-face') === -1) {
      throw new Error('fonts.css missing - refusing to render without the Hebrew font');
    }
  }
  return fontsCssCache;
}

const assetCache = new Map();
function assetDataUri(name) {
  if (assetCache.has(name)) return assetCache.get(name);
  let uri = ASSETS[name] || '';
  if (!uri) {
    const ext = path.extname(name).toLowerCase();
    const buf = MIME[ext] ? readAsset(path.join('assets', name)) : null;
    uri = buf ? 'data:' + MIME[ext] + ';base64,' + buf.toString('base64') : '';
  }
  assetCache.set(name, uri);
  return uri;
}

// כל התמונות מוטמעות כ-data URI, וכל src אחר מנוטרל. כך לדף שמרונדר כאן אין
// שום דרך לגרום לדפדפן לפנות לכתובת חיצונית.
export function inlineAssets(html) {
  return String(html).replace(/src="([^"]*)"/g, function (match, src) {
    const local = /^assets\/([A-Za-z0-9._-]+)$/.exec(src);
    if (local) {
      const uri = assetDataUri(local[1]);
      if (uri) return 'src="' + uri + '"';
    }
    if (src.startsWith('data:image/')) return match;
    return 'src=""';
  });
}

export function buildDocumentHtml(pages) {
  const body = pages
    .map(function (html) {
      return '<div class="pdf-page">' + inlineAssets(html) + '</div>';
    })
    .join('\n');

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<style>
${fontsCss()}
@page { size: ${PAGE_W}px ${PAGE_H}px; margin: 0; }
html, body { margin: 0; padding: 0; background: #ffffff; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pdf-page {
  width: ${PAGE_W}px;
  min-height: ${PAGE_H}px;
  background: #ffffff;
  color: #1f2430;
  font-family: 'Heebo', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* מעבר עמוד רק *בין* עמודי המסמך - break-after על האחרון היה מוסיף דף ריק */
.pdf-page + .pdf-page { break-before: page; page-break-before: always; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

async function launch() {
  const puppeteer = (await import('puppeteer-core')).default;

  // מקומית (לבדיקות) משתמשים בכרום שמותקן על המחשב; ב-Vercel בבינארי הדחוס
  // של @sparticuz/chromium, שנבנה בדיוק בשביל פונקציות serverless.
  const local = process.env.LOCAL_CHROME_PATH;
  if (local) {
    return puppeteer.launch({
      executablePath: local,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
    });
  }

  const chromium = (await import('@sparticuz/chromium')).default;
  return puppeteer.launch({
    args: [...chromium.args, '--font-render-hinting=none'],
    defaultViewport: { width: PAGE_W, height: PAGE_H },
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

export async function renderPdf(pages) {
  const browser = await launch();
  try {
    const page = await browser.newPage();

    // הדף שמרונדר כאן הוא HTML שהגיע בבקשה. אין שום סיבה שיריץ סקריפטים או
    // יפנה לרשת, אז שני הדברים חסומים: מה שהוא יכול לעשות זה רק להיראות.
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on('request', function (req) {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('about:')) return req.continue();
      if (req.isNavigationRequest() && req.frame() === page.mainFrame()) return req.continue();
      req.abort();
    });

    await page.setViewport({ width: PAGE_W, height: PAGE_H, deviceScaleFactor: 1 });
    await page.setContent(buildDocumentHtml(pages), { waitUntil: 'load', timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');

    return await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }
}
