/**
 * ============================================================================
 * Orders Routes — Protected Route (דורש Authentication)
 * ============================================================================
 * שרשרת Middleware: asyncHandler(authenticate) → asyncHandler(createOrder)
 * 1. authenticate בודק JWT → אם נכשל: 401, אם הצליח: next()
 * 2. createOrder רץ עם req.user זמין
 *
 * למה asyncHandler? → תופס Promise rejections ומעביר ל-error handler
 *
 * רק משתמש מחובר יכול ליצור הזמנה!
 */
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createOrder } = require('../controllers/ordersController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(authenticate), asyncHandler(createOrder));

module.exports = router;
