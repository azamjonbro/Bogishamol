const jwt = require('jsonwebtoken');

function getJwtSecret() {
 const secret = process.env.JWT_SECRET;
 if (!secret || secret.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters.');
 }
 return secret;
}

/**
 * Middleware that verifies the JWT token from the Authorization header.
 * Attaches `req.user` with `{ id, username, role }`.
 */
function requireAuth(req, res, next) {
 const header = req.headers.authorization;
 if (!header || !header.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'Authentication required.' });
 }

 const token = header.slice(7);
 try {
  const payload = jwt.verify(token, getJwtSecret());
  req.user = { id: payload.sub, username: payload.username, role: payload.role };
  return next();
 } catch {
  return res.status(401).json({ error: 'Invalid or expired token.' });
 }
}

/**
 * Middleware that ensures the authenticated user has the admin role.
 * Must be placed after `requireAuth`.
 */
function requireAdmin(req, res, next) {
 if (!req.user || req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Admin access required.' });
 }
 return next();
}

/**
 * Generate a signed JWT for a user document.
 */
function signToken(user) {
 return jwt.sign(
  { sub: user._id, username: user.username, role: user.role },
  getJwtSecret(),
  { expiresIn: '24h' }
 );
}

module.exports = { requireAuth, requireAdmin, signToken };
