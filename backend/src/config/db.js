/**
 * ============================================================================
 * חיבור ל-MongoDB דרך Mongoose — נושא מבחן בסיסי
 * ============================================================================
 * MongoDB = NoSQL (מסמכים/Documents ב-Collections, לא טבלאות)
 * Mongoose = ODM (Object Document Mapper) — מגדיר Schema ומאמת נתונים
 *
 * שאלות נפוצות:
 * - מה ההבדל בין SQL ל-NoSQL? → SQL=טבלאות+יחסים, NoSQL=מסמכי JSON גמישים
 * - למה Mongoose ולא driver ישיר? → Schema, validation, middleware, API נוח
 * - מה זה connection string? → MONGODB_URI ב-.env (מכיל host, DB name, credentials)
 */
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Fail-fast: עדיף לקרוס בהתחלה מאשר לרוץ בלי DB
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // mongoose.connect מחזיר Promise — לכן async/await
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
