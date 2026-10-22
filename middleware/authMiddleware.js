// middleware/authMiddleware.js
// Protects private routes using JSON Web Tokens (JWT)
const jwt = require('jsonwebtoken');

// Middleware to verify if user is logged in
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Please log in first.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

// Middleware for admin-only operations
function requireAdmin(req, res, next) {
  requireAuth(req, res, function () {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access restricted to administrators only.' });
    }
  });
}

// Optional auth: Populates req.user if token is present, but doesn't block guest users
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Ignore invalid token for optional routes
    }
  }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
