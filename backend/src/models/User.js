/**
 * ============================================================================
 * מודל User — Schema + bcrypt + Methods/Statics — נושא מבחן חם מאוד!
 * ============================================================================
 * Schema = תבנית המסמך ב-MongoDB (שדות, טיפוסים, ולידציה)
 * Model = מחלקה שנוצרת מה-Schema ומאפשרת CRUD (find, create, ...)
 *
 * שאלות נפוצות:
 * - למה לא שומרים סיסמה כטקסט גלוי? → אבטחה! אם DB נפרץ הסיסמאות חשופות
 * - מה זה hashing? → המרה חד-כיוונית (לא ניתן לשחזר את הסיסמה המקורית)
 * - מה זה salt? → מחרוזת אקראית שמוסיפים לפני ההצפנה נגד Rainbow Tables
 * - methods vs statics? → methods על מופע (user.comparePassword), statics על המודל (User.hashPassword)
 * - מה זה select: false? → השדה לא חוזר ב-find רגיל (צריך .select('+password_hash'))
 * - timestamps? → מוסיף אוטומטית created_at / updated_at
 * - enum? → מגביל ערכים מותרים בלבד ('user' | 'admin')
 * - unique על email? → MongoDB יוצר index ייחודי — לא יאפשר שני משתמשים עם אותו אימייל
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'], // ולידציה ברמת Schema
      trim: true, // מסיר רווחים מההתחלה/סוף
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // אינדקס ייחודי ב-DB
      lowercase: true, // שומר תמיד באותיות קטנות (מניעת כפילויות)
      trim: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // ⚠️ לא נשלח ב-API כברירת מחדל — אבטחה!
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Authorization: תפקיד קובע הרשאות
      default: 'user',
    },
  },
  {
    // שמות מותאמים בעברית/snake_case במקום createdAt ברירת המחדל
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

/**
 * Instance Method — רץ על מסמך ספציפי (this = המשתמש)
 * bcrypt.compare משווה סיסמה גלויה ל-hash השמור
 * מחזיר true/false — לא חושף את ה-hash
 */
userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

/**
 * Static Method — רץ על המודל עצמו (User.hashPassword)
 * genSalt(10) = 10 rounds (כמה "חזק" ה-hash; יותר = איטי יותר אבל מאובטח יותר)
 * hash = סיסמה + salt → מחרוזת מוצפנת לשמירה ב-DB
 */
userSchema.statics.hashPassword = async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

// 'User' → MongoDB ייצור collection בשם "users" (רבים, lowercase)
module.exports = mongoose.model('User', userSchema);
