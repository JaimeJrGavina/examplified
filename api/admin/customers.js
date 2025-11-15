// Vercel Serverless Function: POST /api/admin/customers
// Create a new customer

import customers from '../customers.js';
import * as mailer from '../mailer-esm.js';
import adminAuth from '../middleware/adminAuth.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.substring(7);
    
    // Verify admin token (simplified - in production use proper JWT validation)
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const { email } = req.body || {};
    if (!email) {
      res.status(400).json({ error: 'email required' });
      return;
    }

    console.log('[api/admin/customers] Creating customer for email:', email);
    const customer = await customers.createCustomer({ email });
    console.log('[api/admin/customers] Customer created:', customer.id);

    // Send welcome email (ignore errors)
    try {
      mailer.sendWelcome(customer.email, customer.token);
    } catch (e) {
      console.warn('Could not send welcome email:', e.message);
    }

    res.status(201).json({ ok: true, customer });
  } catch (err) {
    console.error('[api/admin/customers] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
}
