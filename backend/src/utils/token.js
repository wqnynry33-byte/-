/**
 * ============================================================================
 * JWT Utilities — יצירת Token + Cookie מאובטח
 * ============================================================================
 * JWT (JSON Web Token) = מחרוזת חתומה שמכילה payload (id, role)
 * מבנה: header.payload.signature (שלושה חלקים מופרדים בנקודה)
 *
 * שאלות נפוצות:
 * - למה JWT_SECRET? → מפתח סודי לחתימה; בלי אותו secret אי אפשר לזייף token
 * - מה שמים ב-payload? → id + role (לא סיסמה! הטוקן ניתן לפענוח)
 * - HttpOnly Cookie = JS בצד לקוח לא יכול לקרוא → הגנה מ-XSS
 * - secure: true = Cookie רק ב-HTTPS (בפרודקשן)
 * - sameSite = הגנה מ-CSRF ('lax' בפיתוח, 'none' בפרודקשן עם secure)
 * - למה גם Cookie וגם localStorage? → Cookie לביטחון, Bearer לנוחות/עדיפות
 *
 * XSS = Cross-Site Scripting (סקריפט זדוני גונב localStorage)
 * CSRF = Cross-Site Request Forgery (אתר אחר שולח בקשה עם ה-cookie שלך)
 */
const jwt = require('jsonwebtoken');

function signToken(user) {
  // Payload מינימלי — רק מה שצריך לזיהוי והרשאות
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } // תוקף 7 ימים כברירת מחדל
  );
}

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true, // לא נגיש ל-document.cookie (הגנה מ-XSS)
    secure: isProduction, // HTTPS בלבד בפרודקשן
    sameSite: isProduction ? 'none' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ימים במילישניות
  });
}

function clearAuthCookie(res) {
  // חייבים אותן אפשרויות כמו ב-set — אחרת הדפדפן לא ימחק!
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

module.exports = { signToken, setAuthCookie, clearAuthCookie };
