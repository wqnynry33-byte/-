/**
 * ============================================================================
 * Admin Orders — רשימת הזמנות + עדכון סטטוס + populate
 * ============================================================================
 * populate('userId', 'name email') — נושא מבחן קלאסי!
 * במקום לקבל רק ObjectId של המשתמש, מקבלים:
 *   userId: { _id: '...', name: 'Renan', email: '...' }
 *
 * זה כמו JOIN ב-SQL, אבל ב-MongoDB/Mongoose.
 * הפרמטר השני ('name email') = שדות להחזיר מהמסמך המקושר.
 *
 * סטטוסים אפשריים: pending → paid → shipped (או cancelled)
 */
const Order = require('../models/Order');

async function listOrders(_req, res, next) {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email') // JOIN לוגית ל-User
      .sort({ created_at: -1 });

    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'shipped', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ order });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Order not found' });
    }
    return next(err);
  }
}

module.exports = { listOrders, updateOrderStatus };
