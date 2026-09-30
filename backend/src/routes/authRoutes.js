const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { requireAuth, signToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Brute-force protection: max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 10,
 standardHeaders: true,
 legacyHeaders: false,
 message: { error: 'Juda ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.' },
});

/**
 * POST /api/auth/login — authenticate and return JWT
 */
router.post('/login', loginLimiter, async (req, res) => {
 const { username, password } = req.body;

 if (!username || !password) {
  return res.status(400).json({ error: 'Username va parol talab qilinadi.' });
 }

 const user = await User.findOne({
  username: String(username).toLowerCase().trim(),
  isActive: true,
 }).select('+passwordHash');

 if (!user) {
  return res.status(401).json({ error: 'Username yoki parol noto\'g\'ri.' });
 }

 const isValid = await user.verifyPassword(String(password));
 if (!isValid) {
  return res.status(401).json({ error: 'Username yoki parol noto\'g\'ri.' });
 }

 const token = signToken(user);
 return res.json({
  data: {
   token,
   user: {
    id: user._id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
   },
  },
 });
});

/**
 * GET /api/auth/me — return current user info from token
 */
router.get('/me', requireAuth, async (req, res) => {
 const user = await User.findById(req.user.id);
 if (!user || !user.isActive) {
  return res.status(401).json({ error: 'User not found or inactive.' });
 }
 return res.json({ data: user });
});

module.exports = router;
