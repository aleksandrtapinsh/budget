import jwt from 'jsonwebtoken';

// TODO: export a middleware function (req, res, next) that:
//   1. Reads the Authorization header, expects "Bearer <token>"
//   2. Returns 401 if header is missing or malformed
//   3. Verifies the token with jwt.verify(token, process.env.JWT_SECRET)
//   4. Attaches the decoded payload to req.user
//   5. Calls next() on success
//   6. Returns 401 with a clear message on any jwt error (expired, invalid, etc.)

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
