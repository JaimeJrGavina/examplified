// Vercel Serverless Function: POST /api/customer-login
// Customer login with token (public endpoint)

import customers from '../customers.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { token: rawToken } = req.body || {};
    const token = rawToken?.trim();
    if (!token) {
      res.status(400).json({ error: 'token required' });
      return;
    }

    const cust = await customers.getCustomerByToken(token);
    if (!cust) {
      res.status(404).json({ error: 'Invalid token' });
      return;
    }

    res.json({ ok: true, customer: cust });
  } catch (err) {
    console.error('[api/customer-login] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
}
