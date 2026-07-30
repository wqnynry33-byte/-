/**
 * ============================================================================
 * Middleware לאימות והרשאות — נושא מבחן #1 כמעט תמיד!
 * ============================================================================
 * Authentication (אימות) = "מי אתה?" → בדיקת JWT
 * Authorization (הרשאה)  = "מה מותר לך?" → בדיקת role === 'admin'
 *
 * קודי HTTP חשובים למבחן:
 * - 401 Unauthorized → לא מחובר / טוקן לא תקין (Authentication נכשל)
 * - 403 Forbidden    → מחובר אבל אין הרשאה (Authorization נכשל)
 *
 * זרימת JWT:
 *  1. Login → שרת חותם token עם JWT_SECRET
 *  2. Client שולח token ב-Authorization: Bearer <token> או ב-Cookie
 *  3. Middleware מאמת עם jwt.verify
 *  4. אם תקין → req.user = המשתמש, next()
 *  5. אם לא → 401
 *
 * optional chaining (?.) — אם authorization לא קיים, לא יזרוק שגיאה
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  // חילוץ Token מ-Header: "Authorization: Bearer eyJhbG..."
  const bearer =
    req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) // מסיר את המילה "Bearer "
      : null;

  // עדיפות ל-Bearer (localStorage) על פני Cookie — מונע cookie ישן שחוסם login חדש
  const token = bearer || req.cookies?.token || null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let decoded;
  try {
    // jwt.verify בודק חתימה + תוקף (expiresIn)
    // אם פג תוקף / חתימה לא תקינה → זורק exception
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // מוודאים שהמשתמש עדיין קיים ב-DB (לא נמחק אחרי שהטוקן נוצר)
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // מצמידים את המשתמש ל-request → Controllers יכולים להשתמש ב-req.user
  req.user = user;
  return next(); // מעביר לבא בתור (controller / requireAdmin)
}

/**
 * חייב לרוץ אחרי authenticate! (כי צריך req.user)
 * ב-admin routes: router.use(authenticate, requireAdmin)
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

module.exports = { authenticate, requireAdmin };
