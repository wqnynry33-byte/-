/**
 * ============================================================================
 * קובץ כניסה לשרת (Entry Point) — נושא מבחן מרכזי!
 * ============================================================================
 * ארכיטקטורת Express טיפוסית:
 *   1. טעינת משתני סביבה (.env)
 *   2. יצירת אפליקציית Express
 *   3. Middleware גלובלי (CORS, JSON, cookies)
 *   4. הגדרת Routes
 *   5. Error Handler גלובלי (חייב 4 פרמטרים!)
 *   6. חיבור ל-DB ואז listen
 *
 * שאלות נפוצות:
 * - למה connectDB לפני listen? → בלי DB השרת לא יכול לשרת נתונים
 * - מה ההבדל בין app.use ל-app.get? → use = middleware/router, get = נתיב ספציפי
 * - מה זה middleware? → פונקציה (req,res,next) שרצה בין הבקשה לתשובה
 */
require('dotenv').config(); // טוען משתנים מקובץ .env ל-process.env (סיסמאות, URI וכו')
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const holidayRoutes = require('./routes/holidays');

const app = express();
const PORT = process.env.PORT || 5000; // אם אין PORT ב-.env → ברירת מחדל 5000

/**
 * CORS (Cross-Origin Resource Sharing) — שאלת מבחן קלאסית!
 * הדפדפן חוסם בקשות מ-origin אחר (frontend:5173 → backend:5000).
 * credentials: true → מאפשר שליחת Cookies בין דומיינים.
 * חייב להתאים ל-credentials: 'include' ב-fetch בצד הלקוח!
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// מפרסר JSON מגוף הבקשה → req.body (בלי זה req.body יהיה undefined!)
app.use(express.json());

// מפרסר Cookies מה-Header → req.cookies (נחוץ ל-JWT ב-cookie)
app.use(cookieParser());

// Health check — נתיב פשוט לבדיקה שהשרת חי (לא דורש auth)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Home-Ware Store API is running' });
});

/**
 * Mounting Routes — קידומת משותפת לכל נתיבי המודול
 * לדוגמה: /api/auth + /login = POST /api/auth/login
 * זה הפרדה מודולרית (Separation of Concerns) — נושא ארכיטקטורה!
 */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Global Error Handler — חובה 4 פרמטרים: (err, req, res, next)
 * Express מזהה middleware של שגיאות לפי מספר הפרמטרים!
 * אם יש רק 3 — זה לא ייחשב error handler.
 * קוד סטטוס: err.status או 500 (Internal Server Error)
 */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

/**
 * התנעה אסינכרונית:
 * await connectDB() — מחכים לחיבור MongoDB
 * רק אחרי הצלחה → app.listen
 * אם נכשל → process.exit(1) (יציאה עם קוד שגיאה)
 */
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
