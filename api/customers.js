import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// In-memory cache for Vercel's ephemeral filesystem
let dataCache = null;
let cacheInitialized = false;

function load() {
  try {
    // Try to load from file first (for local dev and initial deploy)
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const raw = fs.readFileSync(CUSTOMERS_FILE, 'utf8');
      dataCache = JSON.parse(raw);
      cacheInitialized = true;
      return dataCache;
    }
  } catch (err) {
    console.warn('Error loading customers from file:', err.message);
  }
  
  // If cache is already initialized, return it (for Vercel's ephemeral fs)
  if (cacheInitialized && dataCache) {
    return dataCache;
  }
  
  // Initialize default cache
  dataCache = { customers: [], recoveryTokens: [] };
  cacheInitialized = true;
  return dataCache;
}

function save(data) {
  // Update in-memory cache first (critical for Vercel)
  dataCache = data;
  cacheInitialized = true;
  
  try {
    // Try to persist to file (works on local, may fail on Vercel)
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('⚠️  Warning: Could not write customers to file. Using in-memory storage.', err.message);
    console.warn('   This is normal on Vercel. For persistent storage, use Vercel KV or a database.');
    // Still return true since data is cached in memory
    return true;
  }
}

function generateToken() {
  return 'cust_' + crypto.randomBytes(12).toString('hex');
}

function getAllCustomers() {
  return load().customers;
}

function getCustomerById(id) {
  const d = load();
  return d.customers.find(c => c.id === id) || null;
}

function getCustomerByEmail(email) {
  const d = load();
  return d.customers.find(c => c.email === email) || null;
}

function getCustomerByToken(token) {
  const d = load();
  return d.customers.find(c => c.token === token) || null;
}

function createCustomer({ email }) {
  const d = load();
  if (d.customers.find(c => c.email === email)) {
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
  d.customers.push(customer);
  save(d);
  return customer;
}

function deleteCustomer(id) {
  const d = load();
  const filtered = d.customers.filter(c => c.id !== id);
  if (filtered.length === d.customers.length) return false;
  d.customers = filtered;
  save(d);
  return true;
}

function regenerateToken(id) {
  const d = load();
  const idx = d.customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  d.customers[idx].token = generateToken();
  d.customers[idx].updatedAt = new Date().toISOString();
  save(d);
  return d.customers[idx];
}

// Recovery token lifecycle
function createRecoveryToken(email, expiresInMinutes = 60) {
  const d = load();
  const token = 'recover_' + crypto.randomBytes(12).toString('hex');
  const record = {
    recoveryToken: token,
    email,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60000).toISOString(),
    used: false,
  };
  d.recoveryTokens = d.recoveryTokens || [];
  d.recoveryTokens.push(record);
  save(d);
  return record;
}

function getRecoveryToken(token) {
  const d = load();
  d.recoveryTokens = d.recoveryTokens || [];
  return d.recoveryTokens.find(r => r.recoveryToken === token) || null;
}

function consumeRecoveryToken(token) {
  const d = load();
  d.recoveryTokens = d.recoveryTokens || [];
  const idx = d.recoveryTokens.findIndex(r => r.recoveryToken === token);
  if (idx === -1) return null;
  const rec = d.recoveryTokens[idx];
  if (rec.used) return null;
  if (new Date(rec.expiresAt) < new Date()) return null;
  d.recoveryTokens[idx].used = true;
  save(d);
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
