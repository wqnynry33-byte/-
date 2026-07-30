/**
 * ============================================================================
 * Orders Controller — יצירת הזמנה + ניהול מלאי (Transaction-like logic)
 * ============================================================================
 * נושאים חשובים למבחן:
 * - req.user מגיע מ-authenticate middleware (חובה להיות מחובר!)
 * - בדיקת מלאי לפני הורדה
 * - findOneAndUpdate עם תנאי stock_quantity: { $gte: qty } → מונע Race Condition
 * - $inc: { stock_quantity: -qty } → הקטנת מלאי אטומית
 * - Rollback ידני: אם Order.create נכשל → מחזירים את המלאי ($inc חיובי)
 * - lean() → plain object (יותר קל/מהיר כשלא צריך methods של Mongoose)
 * - Snapshot של name+price בתוך ההזמנה
 *
 * Race Condition: שני משתמשים קונים את אותו מוצר במקביל עם מלאי 1
 * הפתרון: עדכון מותנה (רק אם stock >= quantity) במקום read-then-write
 */
const Order = require('../models/Order');
const Product = require('../models/Product');

async function createOrder(req, res) {
  const { items, fakePayment, fulfillmentMethod, shippingAddress } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  // authenticate כבר רץ — אבל בדיקה כפולה להגנה
  if (!req.user?._id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const method = fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery';
  const address = String(shippingAddress || '').trim();

  // ולידציה עסקית: משלוח דורש כתובת
  if (method === 'delivery' && address.length < 5) {
    return res.status(400).json({ error: 'נא להזין כתובת משלוח מלאה' });
  }

  const prepared = [];

  // שלב 1: ולידציה + הכנת פריטים (בלי לשנות מלאי עדיין)
  for (const item of items) {
    const productId = String(item.productId || item.id || '').trim();
    const quantity = Number(item.quantity);

    if (!productId || !Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Each item needs productId and quantity >= 1' });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({
        error: 'מוצר מהסל לא נמצא. ריקני את הסל והוסיפי מוצרים מחדש.',
      });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        error: `אין מספיק מלאי עבור ${product.name}`,
      });
    }

    prepared.push({
      productId: product._id,
      name: product.name,   // snapshot
      quantity,
      price: product.price, // snapshot
    });
  }

  // שלב 2: הורדת מלאי באופן אטומי (atomic update)
  for (const item of prepared) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock_quantity: { $gte: item.quantity } }, // תנאי!
      { $inc: { stock_quantity: -item.quantity } },
      { new: true } // מחזיר את המסמך אחרי העדכון
    );

    if (!updated) {
      return res.status(400).json({
        error: `אין מספיק מלאי עבור ${item.name}`,
      });
    }
  }

  const totalAmount = prepared.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // שלב 3: יצירת ההזמנה — אם נכשל, Rollback של המלאי
  try {
    const order = await Order.create({
      userId: req.user._id,
      items: prepared,
      totalAmount,
      status: fakePayment ? 'paid' : 'pending',
      paymentMethod: fakePayment ? 'fake_card' : 'none',
      fulfillmentMethod: method,
      shippingAddress: method === 'delivery' ? address : '',
    });

    return res.status(201).json({ order });
  } catch (err) {
    // Rollback: מחזירים מלאי לכל פריט שכבר הורד
    for (const item of prepared) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock_quantity: item.quantity } }
      );
    }
    console.error('createOrder failed:', err.message);
    return res.status(500).json({
      error: err.message || 'יצירת ההזמנה נכשלה',
    });
  }
}

module.exports = { createOrder };
