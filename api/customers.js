import crypto from 'crypto';
import { kv } from '@vercel/kv';

// Keys used in Vercel KV
const CUSTOMERS_KEY = 'examplified:customers';
const RECOVERY_TOKENS_KEY = 'examplified:recovery-tokens';

// In-memory fallback for local development when KV is not available
let localDataCache = null;
let usingKV = false;

async function initKV() {
  try {
    // Test KV connection
    await kv.set('_test_connection', '1', { ex: 1 });
    usingKV = true;
    console.log('✓ Vercel KV connected');
    return true;
  } catch (err) {
    console.log('ℹ️  Vercel KV not available, using in-memory storage (local development)');
    usingKV = false;
    return false;
  }
}

// Initialize KV on module load
initKV();

async function load() {
  try {
    if (usingKV) {
      const data = await kv.get(CUSTOMERS_KEY);
      if (data) return data;
    } else {
      // Fallback to in-memory cache for local dev
      if (localDataCache) return localDataCache;
    }
  } catch (err) {
    console.warn('Error loading from KV:', err.message);
  }
  
  // Return default structure
  return { customers: [], recoveryTokens: [] };
}

async function save(data) {
  try {
    if (usingKV) {
      // Save to Vercel KV (no expiration, persistent)
      await kv.set(CUSTOMERS_KEY, data);
      return true;
    } else {
      // Fallback to in-memory cache
      localDataCache = data;
      return true;
    }
  } catch (err) {
    console.error('Error saving to KV:', err.message);
    localDataCache = data;
    return false;
  }
}

function generateToken() {
  return 'cust_' + crypto.randomBytes(12).toString('hex');
}

async function getAllCustomers() {
  const d = await load();
  return d.customers || [];
}

async function getCustomerById(id) {
  const d = await load();
  return (d.customers || []).find(c => c.id === id) || null;
}

async function getCustomerByEmail(email) {
  const d = await load();
  return (d.customers || []).find(c => c.email === email) || null;
}

async function getCustomerByToken(token) {
  const d = await load();
  return (d.customers || []).find(c => c.token === token) || null;
}

async function createCustomer({ email }) {
  const d = await load();
  if ((d.customers || []).find(c => c.email === email)) {
    throw new Error('Email already exists');
  }
  const customer = {
    id: `cust-${Date.now()}`,
    email,
    token: generateToken(),
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  d.customers = d.customers || [];
  d.customers.push(customer);
  await save(d);
  return customer;
}

async function deleteCustomer(id) {
  const d = await load();
  const filtered = (d.customers || []).filter(c => c.id !== id);
  if (filtered.length === (d.customers || []).length) return false;
  d.customers = filtered;
  await save(d);
  return true;
}

async function regenerateToken(id) {
  const d = await load();
  const idx = (d.customers || []).findIndex(c => c.id === id);
  if (idx === -1) return null;
  d.customers[idx].token = generateToken();
  d.customers[idx].updatedAt = new Date().toISOString();
  await save(d);
  return d.customers[idx];
}

// Recovery token lifecycle
async function createRecoveryToken(email, expiresInMinutes = 60) {
  const d = await load();
  const token = 'recover_' + crypto.randomBytes(12).toString('hex');
  const record = {
    recoveryToken: token,
    email,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60000).toISOString(),
    used: false,
  };
  d.recoveryTokens = d.recoveryTokens || [];
  d.recoveryTokens.push(record);
  await save(d);
  return record;
}

async function getRecoveryToken(token) {
  const d = await load();
  d.recoveryTokens = d.recoveryTokens || [];
  return d.recoveryTokens.find(r => r.recoveryToken === token) || null;
}

async function consumeRecoveryToken(token) {
  const d = await load();
  d.recoveryTokens = d.recoveryTokens || [];
  const idx = d.recoveryTokens.findIndex(r => r.recoveryToken === token);
  if (idx === -1) return null;
  const rec = d.recoveryTokens[idx];
  if (rec.used) return null;
  if (new Date(rec.expiresAt) < new Date()) return null;
  d.recoveryTokens[idx].used = true;
  await save(d);
  return rec;
}

export default {
  getAllCustomers,
  getCustomerById,
  getCustomerByEmail,
  getCustomerByToken,
  createCustomer,
  deleteCustomer,
  regenerateToken,
  createRecoveryToken,
  getRecoveryToken,
  consumeRecoveryToken,
};
