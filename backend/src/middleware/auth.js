const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  console.log('Auth middleware - Header:', header);
  console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    console.log('Auth middleware - Payload:', payload);
    req.user = payload;
    next();
  } catch (e) {
    console.log('Auth middleware - Token verification failed:', e.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;




