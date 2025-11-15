// Vercel Serverless Function: GET /api/exams
// Get all exams (public endpoint, no auth required)

import db from '../../db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const exams = await db.getAllExams();
    res.json({ ok: true, exams });
  } catch (err) {
    console.error('[api/exams] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
}
