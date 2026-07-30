/**
 * ============================================================================
 * asyncHandler — עטיפה לפונקציות async ב-Express
 * ============================================================================
 * בעיה: אם async function זורקת שגיאה / Promise נדחה,
 * Express 4 לא תופס את זה אוטומטית → השרת יכול להיתקע.
 *
 * פתרון: עוטפים ב-.catch(next) → השגיאה עוברת ל-Error Handler הגלובלי.
 *
 * שימוש: router.post('/', asyncHandler(authenticate), asyncHandler(createOrder))
 *
 * שאלת מבחן: למה צריך את זה? → כדי ששגיאות ב-async לא "יאבדו" ויגיעו ל-error middleware
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
