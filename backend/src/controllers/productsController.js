/**
 * ============================================================================
 * Products Controller — סינון, מיון, חיפוש (Query Parameters)
 * ============================================================================
 * שאלות נפוצות:
 * - מה ההבדל בין req.params ל-req.query?
 *   params = חלק מה-URL (/products/:id → req.params.id)
 *   query  = אחרי ? (/products?category=plates → req.query.category)
 * - מה זה $regex עם $options: 'i'? → חיפוש טקסט case-insensitive
 * - מה זה $or? → תנאי OR ב-MongoDB (שם או תיאור או חומר או צבע)
 * - sort: 1 = עולה, -1 = יורד
 * - CastError? → ObjectId לא תקין ב-URL (למשל /products/abc)
 * - lean()? → לא בשימוש כאן; מחזיר plain JS object במקום Mongoose Document (יותר מהיר)
 *
 * REST: GET = קריאה בלבד, לא משנה state בשרת
 */
const Product = require('../models/Product');

async function getProducts(req, res, next) {
  try {
    const { category, material, color, sort, q } = req.query;
    const filter = {}; // אובייקט סינון דינמי ל-MongoDB

    if (category) {
      if (!Product.CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: `Invalid category. Allowed: ${Product.CATEGORIES.join(', ')}`,
        });
      }
      filter.category = category;
    }

    if (material) {
      filter.material = material;
    }

    if (color) {
      filter.color = color;
    }

    // חיפוש חופשי (Search) — $regex = ביטוי רגולרי, 'i' = ignore case
    if (q && String(q).trim()) {
      const term = String(q).trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { material: { $regex: term, $options: 'i' } },
        { color: { $regex: term, $options: 'i' } },
      ];
    }

    // מיון: ברירת מחדל = חדש לישן; או לפי מחיר
    let sortOption = { created_at: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    const products = await Product.find(filter).sort(sortOption);
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' }); // 404 Not Found
    }

    return res.json({ product });
  } catch (err) {
    // CastError = id לא בפורמט ObjectId תקין
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return next(err);
  }
}

module.exports = { getProducts, getProductById };
