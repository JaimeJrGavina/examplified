import crypto from 'crypto';

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function verifyToken(token, secret) {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;
    
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    // Check expiration only if exp field exists
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload;
  } catch (e) {
    return null;
  }
}

export function adminAuth(req, res, next) {
  const secret = process.env.SESSION_SECRET || 'admin-secret-change-in-production';
  const auth = req.headers.authorization;
  
  if (!auth) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid auth format. Use: Authorization: Bearer <token>' });
  }
  
  const payload = verifyToken(parts[1], secret);
  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  // Attach payload to request for use in route handlers
  req.admin = payload;
  next();
}

export default adminAuth;
