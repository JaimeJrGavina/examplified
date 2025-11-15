// Vercel Serverless Function: GET,DELETE /api/admin/customers
// Get all customers or delete a specific customer

import customers from '../../customers.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
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

    if (req.method === 'GET') {
      if (id) {
        // Get single customer
        const customer = await customers.getCustomerById(id);
        if (!customer) {
          res.status(404).json({ error: 'Customer not found' });
          return;
        }
        res.json({ ok: true, customer });
      } else {
        // Get all customers
        const all = await customers.getAllCustomers();
        res.json({ ok: true, count: all.length, customers: all });
      }
    } else if (req.method === 'DELETE') {
      if (!id) {
        res.status(400).json({ error: 'id required' });
        return;
      }
      const deleted = await customers.deleteCustomer(id);
      if (!deleted) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json({ ok: true, message: 'Customer deleted' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('[api/admin/customers/[id]] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
}
