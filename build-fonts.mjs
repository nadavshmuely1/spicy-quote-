// מייצר את fonts.css עם הפונטים מוטמעים כ-data URI (base64) במקום קישור לקובץ.
// למה: html2canvas מצייר טקסט על canvas עם ctx.fillText. אם הפונט לא זמין ל-canvas
// ברגע הציור (קרה בפועל באייפון - הבקשה לקובץ הפונט לא הגיעה ל-canvas בזמן),
// המדידה נעשית עם הפונט הנכון אבל הציור עם פונט נפילה - והמילים נדבקות זו לזו.
// כשהפונט מוטמע ישירות ב-CSS אין בקשת רשת בכלל, אז זה לא יכול לקרות.
//
// להרצה אחרי כל שינוי בקובצי הפונט:  node build-fonts.mjs

import { readFileSync, writeFileSync } from 'fs';

const HEBREW_RANGE = 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F';
const LATIN_RANGE = 'U+0000-00FF, U+2000-206F, U+20AC, U+2122';

const weights = [400, 600, 700, 800];

let css = `/* נוצר אוטומטית ע"י build-fonts.mjs - אין לערוך ידנית */\n`;

for (const weight of weights) {
  for (const [subset, range] of [
    ['hebrew', HEBREW_RANGE],
    ['latin', LATIN_RANGE],
  ]) {
    const file = `assets/heebo-${weight}-${subset}.woff2`;
    const b64 = readFileSync(file).toString('base64');
    css += `@font-face{font-family:'Heebo';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:${range};}\n`;
  }
}

writeFileSync('fonts.css', css);
console.log(`fonts.css written: ${(css.length / 1024).toFixed(1)} KB`);
