import User from '../models/User.js';

/**
 * Middleware: reads session_id cookie, looks up User, attaches req.user.
 * Returns 401 if missing or invalid.
 */
const requireAuth = async (req, res, next) => {
  const sessionId = req.cookies?.session_id;
  if (!sessionId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  try {
    const user = await User.findOne({ sessionId });
    if (!user) {
      return res.status(401).json({ message: 'Session invalid or expired.' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    res.status(500).json({ message: 'Auth check failed.' });
  }
};

export default requireAuth;
