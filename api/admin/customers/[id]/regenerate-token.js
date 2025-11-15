// Vercel Serverless Function: POST /api/admin/customers/[id]/regenerate-token
// Regenerate customer token

import customers from '../../../customers.js';
import * as mailer from '../../../mailer-esm.js';

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

  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: 'id required' });
      return;
    }

    const updated = await customers.regenerateToken(id);
    if (!updated) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    try {
      mailer.sendWelcome(updated.email, updated.token);
    } catch (e) {
      console.warn('Could not send email:', e.message);
    }

    res.json({ ok: true, customer: updated });
  } catch (err) {
    console.error('[api/admin/customers/[id]/regenerate-token] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
}
