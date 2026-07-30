/**
 * ============================================================================
 * מודל Order — Relationships עם ref + Subdocument + populate
 * ============================================================================
 * זה אחד הנושאים הכי חשובים במבחן על MongoDB/Mongoose!
 *
 * שאלות נפוצות:
 * - מה זה ref: 'Product'? → קישור לוגית למודל אחר (כמו Foreign Key ב-SQL)
 * - מה זה ObjectId? → מזהה ייחודי של 24 תווים ש-MongoDB יוצר לכל מסמך
 * - מה זה populate? → מחליף את ה-ObjectId במסמך המלא (או שדות נבחרים)
 * - למה שומרים name+price בתוך items ולא רק productId?
 *   → Snapshot: אם המחיר/שם המוצר ישתנו בעתיד — ההזמנה ההיסטורית נשארת מדויקת
 * - מה זה embedded/subdocument? → orderItemSchema בתוך items (מסמך מקונן)
 * - _id: false ב-subschema? → לא ליצור _id אוטומטי לכל פריט בהזמנה
 * - index על userId? → שליפת הזמנות לפי משתמש מהירה
 * - index על created_at: -1? → מיון מהחדש לישן מהיר
 */
const mongoose = require('mongoose');

// Subdocument — פריט בודד בתוך הזמנה (לא collection נפרד)
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // מאפשר .populate('items.productId')
      required: true,
    },
    name: {
      type: String,
      required: true, // snapshot של שם המוצר בזמן הקנייה
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true, // snapshot של מחיר בזמן הקנייה
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ב-admin: Order.find().populate('userId', 'name email')
      required: true,
    },
    items: {
      type: [orderItemSchema], // מערך של subdocuments
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'none',
    },
    fulfillmentMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery',
    },
    shippingAddress: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ created_at: -1 }); // -1 = descending (חדש → ישן)

module.exports = mongoose.model('Order', orderSchema);
