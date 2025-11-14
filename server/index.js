/*
Simple signed-challenge auth server with email-based recovery flow.
- No external dependencies (uses built-in crypto, fs, http libs and Express which is commonly available.
- This is a lightweight demo for local testing. In production: persist stores (DB), use a real mailer, rotate secrets.
*/

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const store = require('./store');
const mailer = require('./mailer');

const app = express();
app.use(express.json());

const HMAC_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateToken(payload, expiresInSeconds = 10 * 60) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = base64url(JSON.stringify({ ...payload, exp }));
  const sig = crypto.createHmac('sha256', HMAC_SECRET).update(`${header}.${body}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', HMAC_SECRET).update(`${header}.${body}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Register a client (store public key + email)
// Body: { clientId, publicKeyPem, email }
app.post('/register', (req, res) => {
  const { clientId, publicKeyPem, email } = req.body || {};
  if (!clientId || !publicKeyPem || !email) return res.status(400).json({ error: 'clientId, publicKeyPem and email required' });
  if (store.clients.has(clientId)) return res.status(400).json({ error: 'client already exists' });
  store.clients.set(clientId, { publicKeyPem, email, verified: false });

  // issue email verification token
  const token = base64url(crypto.randomBytes(24));
  const exp = Date.now() + 1000 * 60 * 60; // 1 hour
  store.verificationTokens.set(token, { clientId, exp });
  const link = `http://localhost:${process.env.PORT || 4000}/verify-email/${token}`;
  mailer.sendVerification(email, link);

  res.json({ ok: true, message: 'registered, verification email sent' });
});

// Verify email (click link -> marks client verified)
app.get('/verify-email/:token', (req, res) => {
  const { token } = req.params;
  const entry = store.verificationTokens.get(token);
  if (!entry) return res.status(400).send('Invalid or expired token');
  if (Date.now() > entry.exp) {
    store.verificationTokens.delete(token);
    return res.status(400).send('Token expired');
  }
  const { clientId } = entry;
  const client = store.clients.get(clientId);
  if (!client) return res.status(400).send('Unknown client');
  client.verified = true;
  store.verificationTokens.delete(token);
  res.send('Email verified — you can now authenticate using your private key');
});

// Get challenge
app.get('/challenge/:clientId', (req, res) => {
  const { clientId } = req.params;
  const client = store.clients.get(clientId);
  if (!client || !client.verified) return res.status(404).json({ error: 'unknown or unverified client' });
  const nonce = base64url(crypto.randomBytes(32));
  store.challenges.set(clientId, { nonce, exp: Date.now() + 1000 * 60 }); // 60s expiry
  res.json({ nonce });
});

// Authenticate: client signs nonce and sends signature
// Body: { signature }
app.post('/auth/:clientId', (req, res) => {
  const { clientId } = req.params;
  const { signature } = req.body || {};
  if (!signature) return res.status(400).json({ error: 'signature required' });
  const client = store.clients.get(clientId);
  const chall = store.challenges.get(clientId);
  if (!client || !client.verified || !chall) return res.status(400).json({ error: 'invalid auth attempt' });
  if (Date.now() > chall.exp) { store.challenges.delete(clientId); return res.status(400).json({ error: 'challenge expired' }); }

  const verifier = crypto.createVerify('SHA256');
  verifier.update(chall.nonce);
  verifier.end();
  let ok = false;
  try {
    ok = verifier.verify(client.publicKeyPem, Buffer.from(signature, 'base64'));
  } catch (e) {
    ok = false;
  }

  store.challenges.delete(clientId);
  if (!ok) return res.status(403).json({ error: 'invalid signature' });

  const token = generateToken({ clientId }, 60 * 60); // 1 hour
  res.json({ token });
});

// Request recovery: provide email, server will email a recovery token link
// Body: { email }
app.post('/request-recovery', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  // find client
  const entry = Array.from(store.clients.entries()).find(([id, c]) => c.email === email);
  if (!entry) return res.status(404).json({ error: 'no client for that email' });
  const [clientId] = entry;
  const token = base64url(crypto.randomBytes(24));
  const exp = Date.now() + 1000 * 60 * 30; // 30 minutes
  store.recoveryTokens.set(token, { clientId, exp });
  const link = `http://localhost:${process.env.PORT || 4000}/recover/${token}`;
  mailer.sendRecovery(email, link);
  res.json({ ok: true, message: 'recovery email sent if the email is known' });
});

// Recover: POST with new public key to replace old key using token
// Body: { newPublicKeyPem }
app.post('/recover/:token', (req, res) => {
  const { token } = req.params;
  const { newPublicKeyPem } = req.body || {};
  if (!newPublicKeyPem) return res.status(400).json({ error: 'newPublicKeyPem required' });
  const entry = store.recoveryTokens.get(token);
  if (!entry) return res.status(400).json({ error: 'invalid token' });
  if (Date.now() > entry.exp) { store.recoveryTokens.delete(token); return res.status(400).json({ error: 'token expired' }); }
  const { clientId } = entry;
  const client = store.clients.get(clientId);
  if (!client) return res.status(400).json({ error: 'unknown client' });
  client.publicKeyPem = newPublicKeyPem;
  client.verified = true; // treat recovery as verification
  store.recoveryTokens.delete(token);
  res.json({ ok: true, message: 'public key updated' });
});

// Protected demo route
app.get('/admin', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'authorization header required' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid auth format' });

  const payload = verifyToken(parts[1]);
  if (!payload) return res.status(401).json({ error: 'invalid or expired token' });
  res.json({ ok: true, message: `Hello ${payload.clientId}, welcome to the protected admin area` });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Signed-challenge auth server running on http://localhost:${port}`);
  const outDir = path.join(__dirname, 'outbox');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
});
