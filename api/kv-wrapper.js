// Safe KV wrapper for Vercel
// This module safely handles Vercel KV connections with graceful fallbacks

let kv = null;
let kvAvailable = false;

// Try to import KV at module load time
try {
  // @ts-ignore
  const kvModule = require('@vercel/kv');
  kv = kvModule.kv || kvModule.default;
  if (kv) {
    kvAvailable = true;
    console.log('✓ Vercel KV module loaded');
  }
} catch (e) {
  // KV not available - this is expected in local development
  console.log('ℹ️  Vercel KV not available (using in-memory storage)');
}

/**
 * Get KV client, returns null if not available
 */
export function getKV() {
  return kv;
}

/**
 * Check if KV is available
 */
export function isKVAvailable() {
  return kvAvailable && kv !== null;
}

/**
 * Safely get a value from KV with fallback
 */
export async function kvGet(key) {
  if (!kv) return null;
  try {
    return await kv.get(key);
  } catch (err) {
    console.error('KV get error:', err.message);
    return null;
  }
}

/**
 * Safely set a value in KV with fallback
 */
export async function kvSet(key, value, options) {
  if (!kv) return false;
  try {
    await kv.set(key, value, options);
    return true;
  } catch (err) {
    console.error('KV set error:', err.message);
    return false;
  }
}

/**
 * Safely delete a value from KV
 */
export async function kvDel(key) {
  if (!kv) return false;
  try {
    await kv.del(key);
    return true;
  } catch (err) {
    console.error('KV del error:', err.message);
    return false;
  }
}

export default {
  getKV,
  isKVAvailable,
  kvGet,
  kvSet,
  kvDel,
};
