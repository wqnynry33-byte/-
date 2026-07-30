/**
 * ============================================================================
 * מודל Product — Schema עם enum, min, indexes
 * ============================================================================
 * שאלות נפוצות:
 * - מה זה index? → מבנה נתונים שמאיץ חיפושים/סינונים על שדה מסוים
 * - למה index על category? → רוב השאילתות מסננות לפי קטגוריה
 * - מה זה enum ב-category? → רק 4 ערכים מותרים — ולידציה ברמת DB
 * - min: 0 על price/stock? → מונע מחירים/מלאי שליליים
 * - module.exports.CATEGORIES? → מייצאים את המערך לשימוש ב-controllers (DRY)
 */
const mongoose = require('mongoose');

const CATEGORIES = ['plates', 'glasses', 'cutlery', 'tablecloths'];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },
    image_url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    stock_quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    material: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    dimensions: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes — מאיצים סינון לפי קטגוריה/חומר (Shop page filters)
productSchema.index({ category: 1 }); // 1 = סדר עולה (ascending)
productSchema.index({ material: 1 });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
