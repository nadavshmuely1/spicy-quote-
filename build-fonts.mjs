// מייצר את fonts.css עם הפונטים מוטמעים כ-data URI (base64) במקום קישור לקובץ.
//
// שתי החלטות חשובות כאן, שתיהן בגלל איך ש-html2canvas מייצר את ה-PDF:
//
// 1. מוטמע כ-data URI ולא כקובץ נפרד. html2canvas מודד את מיקומי הטקסט מה-DOM
//    (עם הפונט האמיתי) אבל מצייר על canvas עם ctx.fillText, ששם משתמש בפונט
//    שזמין ל-canvas באותו רגע. אם הבקשה לקובץ הפונט לא הגיעה בזמן (קרה באייפון),
//    ה-canvas נופל בשקט לפונט ברירת מחדל - המדידה והציור לא תואמים והמילים
//    נדבקות זו לזו. כשהפונט מוטמע אין בקשת רשת שיכולה להיכשל.
//
// 2. קובץ אחד לכל משקל, בלי unicode-range. קודם הפונט היה מפוצל לשניים
//    (עברית / לטינית) לפי unicode-range. ב-DOM הדפדפן משלב אותם לפי תו, אבל
//    ב-canvas התאמת הפונט הזו לא אמינה - ואז דווקא הסוגריים והספרות (תווים
//    לטיניים בתוך משפט עברי) נשברו. קובץ אחד עם כל התווים מבטל את הבעיה.
//
// קובצי המקור נוצרו מהפונט הרשמי Heebo[wght].ttf של Google Fonts:
//   fontTools.varLib.instancer -> משקל קבוע -> woff2
//
// להרצה אחרי כל שינוי בקובצי הפונט:  node build-fonts.mjs

import { readFileSync, writeFileSync } from 'fs';

const weights = [400, 600, 700, 800];

let css = `/* נוצר אוטומטית ע"י build-fonts.mjs - אין לערוך ידנית */\n`;

for (const weight of weights) {
  const file = `assets/heebo-${weight}.woff2`;
  const b64 = readFileSync(file).toString('base64');
  css += `@font-face{font-family:'Heebo';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2');}\n`;
}

writeFileSync('fonts.css', css);
console.log(`fonts.css written: ${(css.length / 1024).toFixed(1)} KB`);
