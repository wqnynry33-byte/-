/**
 * ============================================================================
 * Admin Routes — Protected + Authorized (admin בלבד)
 * ============================================================================
 * router.use(authenticate, requireAdmin)
 * → כל הנתיבים מתחת רצים רק אחרי שני ה-middleware האלה!
 * → אין צורך לחזור על authenticate בכל נתיב בנפרד.
 *
 * Authentication (401) → Authorization (403) → Controller
 *
 * CRUD מלא על products + ניהול users + ניהול orders
 * PATCH = עדכון חלקי (רק role / רק status)
 * PUT   = עדכון מוצר (שולחים את כל השדות)
 */
const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/adminProductsController');
const { listUsers, deleteUser, updateUserRole } = require('../controllers/adminUsersController');
const { listOrders, updateOrderStatus } = require('../controllers/adminOrdersController');

const router = express.Router();

// Middleware ברמת Router — חל על כל הנתיבים למטה
router.use(authenticate, requireAdmin);

router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/orders', listOrders);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
