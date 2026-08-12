/**
 * ============================================================================
 * Holidays Routes — Public endpoint שעוטף API חיצוני
 * ============================================================================
 * GET /api/holidays/featured
 *   → החג הקרוב + מוצרים מומלצים מהקטגוריה המתאימה
 *
 * Public — אין צורך ב-auth (כמו GET /products)
 */
const express = require('express');
const { getFeaturedHoliday } = require('../controllers/holidaysController');

const router = express.Router();

router.get('/featured', getFeaturedHoliday);

module.exports = router;
