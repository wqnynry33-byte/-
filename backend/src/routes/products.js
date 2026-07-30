/**
 * ============================================================================
 * Products Routes — נתיבים ציבוריים (ללא auth!)
 * ============================================================================
 * סדר הנתיבים חשוב:
 *   GET /       → רשימה
 *   GET /:id    → מוצר בודד
 *
 * אם היינו שמים /:id לפני נתיב כמו /featured —
 * Express היה תופס "featured" כ-id!
 *
 * אלה Public endpoints — כל אחד יכול לקרוא מוצרים בלי להתחבר.
 */
const express = require('express');
const { getProducts, getProductById } = require('../controllers/productsController');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
