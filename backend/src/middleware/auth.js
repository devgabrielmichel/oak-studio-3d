import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'oak-studio-dev-secret-change-in-production';

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '8h' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação necessária.' });
  }
  try {
    req.user = jwt.verify(header.slice(7), secret);
    next();
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}
