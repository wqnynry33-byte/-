/**
 * ============================================================================
 * Auth Routes — Router מודולרי
 * ============================================================================
 * Express Router = "מיני-אפליקציה" לנתיבים של מודול אחד.
 * ב-index.js: app.use('/api/auth', authRoutes)
 * אז POST /register כאן = POST /api/auth/register בפועל.
 *
 * למה Router נפרד? → Separation of Concerns, קוד מסודר, קל לתחזק.
 * HTTP Methods: POST ל-login/register כי שולחים body רגיש (סיסמה)
 *               (וגם logout משנה state בשרת — מוחק cookie)
 */
const express = require('express');
const { register, login, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
