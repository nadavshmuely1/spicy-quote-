// POST /api/pdf  { pages: [htmlעמוד1, htmlעמוד2], filename }  ->  קובץ PDF
//
// הלקוח שולח את ה-HTML של העמודים בדיוק כפי שהוא מוצג בתצוגה המקדימה,
// וכאן כרום אמיתי מרנדר אותו ומחזיר PDF עם טקסט וקטורי אמיתי.

import { renderPdf } from './_render.js';

// עונים דרך ה-API הסטנדרטי של Node (writeHead/end) ולא דרך העוזרים של Vercel
// (res.status/res.json), כדי שאותו handler ירוץ גם בשרת המקומי של הבדיקות.
function sendJson(res, code, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PAGES = 4;

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(function (resolve, reject) {
    let size = 0;
    const chunks = [];
    req.on('data', function (chunk) {
      size += chunk.length;
      if (size > MAX_BYTES) {
        reject(new Error('too-large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', function () {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('bad-json'));
      }
    });
    req.on('error', reject);
  });
}

// שם הקובץ נשלח כטקסט חופשי (שם הלקוח), אז מנקים תווים שיכולים לשבור את
// הכותרת או לברוח לתיקייה אחרת, ומקודדים לפי RFC 5987 כדי שעברית תשרוד.
function contentDisposition(name) {
  const clean = String(name || '')
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  const safe = clean || 'quote';
  const ascii = safe.replace(/[^ -~]/g, '_');
  return (
    'attachment; filename="' +
    ascii +
    '.pdf"; filename*=UTF-8\'\'' +
    encodeURIComponent(safe + '.pdf')
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'method-not-allowed' });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, err.message === 'too-large' ? 413 : 400, { error: err.message });
    return;
  }

  const pages = Array.isArray(body.pages)
    ? body.pages.filter(function (p) {
        return typeof p === 'string' && p.trim() !== '';
      })
    : [];

  if (pages.length === 0 || pages.length > MAX_PAGES) {
    sendJson(res, 400, { error: 'bad-pages' });
    return;
  }

  try {
    const pdf = Buffer.from(await renderPdf(pages));
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition(body.filename),
      'Content-Length': pdf.length,
      'Cache-Control': 'no-store',
    });
    res.end(pdf);
  } catch (err) {
    console.error('pdf render failed', err);
    sendJson(res, 500, { error: 'render-failed' });
  }
}
