/**
 * ============================================================================
 * Admin Users — ניהול משתמשים + הגנות עסקיות
 * ============================================================================
 * שאלות נפוצות:
 * - .select('name email role') → מחזיר רק שדות אלה (לא password!)
 * - למה לא למחוק את עצמך? → תישאר בלי גישה לניהול
 * - למה לא למחוק/להוריד את המנהל האחרון? → המערכת תישאר בלי admin
 * - countDocuments → סופר מסמכים לפי תנאי (יותר יעיל מ-find().length)
 * - PATCH על role → עדכון חלקי (רק שדה role)
 * - toString() על ObjectId → השוואת מחרוזות (ObjectId !== string בלי המרה)
 */
const User = require('../models/User');

async function listUsers(_req, res, next) {
  try {
    const users = await User.find()
      .select('name email role created_at') // אף פעם לא password_hash!
      .sort({ created_at: -1 });

    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    // הגנה: לא מוחקים את החשבון המחובר כרגע
    if (req.user._id.toString() === id) {
      return res.status(400).json({ error: 'לא ניתן למחוק את החשבון המחובר כרגע' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // הגנה: לא מוחקים את המנהל האחרון במערכת
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'לא ניתן למחוק את המנהל האחרון במערכת' });
      }
    }

    await User.findByIdAndDelete(id);
    return res.json({ message: 'User deleted', id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // הורדת admin → user: הגנות נוספות
    if (user.role === 'admin' && role === 'user') {
      if (req.user._id.toString() === id) {
        return res.status(400).json({ error: 'לא ניתן להסיר לעצמך הרשאת מנהל' });
      }

      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'לא ניתן להסיר את המנהל האחרון במערכת' });
      }
    }

    user.role = role;
    await user.save(); // שומר ומפעיל validators

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'User not found' });
    }
    return next(err);
  }
}

module.exports = { listUsers, deleteUser, updateUserRole };
