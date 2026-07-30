/**
 * ============================================================================
 * Admin Products — CRUD מלא (Create, Read, Update, Delete)
 * ============================================================================
 * REST Mapping (חייבים לדעת למבחן!):
 *   GET    /api/admin/products      → listProducts   (Read all)
 *   POST   /api/admin/products      → createProduct  (Create)  → 201
 *   PUT    /api/admin/products/:id  → updateProduct  (Update)  → החלפה/עדכון מלא
 *   DELETE /api/admin/products/:id  → deleteProduct  (Delete)
 *
 * PUT vs PATCH:
 *   PUT   = עדכון מלא (או החלפת המשאב)
 *   PATCH = עדכון חלקי של שדות ספציפיים
 *
 * findByIdAndUpdate options:
 *   new: true        → מחזיר את המסמך אחרי העדכון (לא לפני)
 *   runValidators: true → מפעיל ולידציות Schema גם בעדכון
 *
 * כל הנתיבים מוגנים ב-authenticate + requireAdmin (ראו routes/admin.js)
 */
const Product = require('../models/Product');

function pickProductFields(body) {
  return {
    name: body.name?.trim(),
    description: body.description?.trim(),
    price: Number(body.price),
    category: body.category,
    image_url: body.image_url?.trim(),
    stock_quantity: Number(body.stock_quantity ?? 0),
    material: body.material?.trim() || '',
    color: body.color?.trim() || '',
    dimensions: body.dimensions?.trim() || '',
  };
}

function validateProductInput(fields, { partial = false } = {}) {
  const required = ['name', 'description', 'price', 'category', 'image_url'];

  if (!partial) {
    for (const key of required) {
      if (fields[key] === undefined || fields[key] === '' || Number.isNaN(fields[key])) {
        return `Missing or invalid field: ${key}`;
      }
    }
  }

  if (fields.category && !Product.CATEGORIES.includes(fields.category)) {
    return `Invalid category. Allowed: ${Product.CATEGORIES.join(', ')}`;
  }

  if (fields.price !== undefined && (Number.isNaN(fields.price) || fields.price < 0)) {
    return 'Price must be a non-negative number';
  }

  if (
    fields.stock_quantity !== undefined &&
    (Number.isNaN(fields.stock_quantity) || fields.stock_quantity < 0)
  ) {
    return 'Stock quantity must be a non-negative number';
  }

  return null;
}

async function listProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ created_at: -1 });
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const fields = pickProductFields(req.body);
    const error = validateProductInput(fields);
    if (error) {
      return res.status(400).json({ error });
    }

    const product = await Product.create(fields);
    return res.status(201).json({ product }); // 201 = Created
  } catch (err) {
    return next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const fields = pickProductFields(req.body);
    const error = validateProductInput(fields, { partial: true });
    if (error) {
      return res.status(400).json({ error });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ message: 'Product deleted', id: product._id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Product not found' });
    }
    return next(err);
  }
}

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
