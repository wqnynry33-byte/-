/**
 * ============================================================================
 * Auth Controller — Register / Login / Logout
 * ============================================================================
 * זרימת Authentication מלאה (לזכור למבחן כסיפור):
 *  REGISTER: ולידציה → בדיקת אימייל קיים → hash סיסמה → create → JWT → cookie + JSON
 *  LOGIN:    ולידציה → מציאת user עם password_hash → compare → JWT → cookie + JSON
 *  LOGOUT:   מחיקת cookie
 *
 * קודי סטטוס שחייבים לדעת:
 *  200 OK           — הצלחה כללית (login)
 *  201 Created      — נוצר משאב חדש (register)
 *  400 Bad Request  — קלט חסר/לא תקין
 *  401 Unauthorized — סיסמה/אימייל שגויים
 *  409 Conflict     — אימייל כבר רשום
 *
 * חשוב: לעולם לא מחזירים password_hash בתשובה!
 * try/catch + next(err) → מעביר שגיאות ל-error handler הגלובלי
 */
const User = require('../models/User');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/token');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validation ידנית ברמת Controller (בנוסף ל-Schema)
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // בדיקת כפילות לפני create (409 = Conflict)
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // ⚠️ אף פעם לא שומרים password גלוי — רק hash!
    const password_hash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
    });

    // מיד אחרי הרשמה — מתחברים אוטומטית (JWT + Cookie)
    const token = signToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token, // גם ב-body — ה-frontend שומר ב-localStorage
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // select: false על password_hash → חייבים לבקש במפורש עם +
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password_hash'
    );

    // הודעה זהה לאימייל שגוי ולסיסמה שגויה — מונע User Enumeration
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(_req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out successfully' });
}

module.exports = { register, login, logout };
