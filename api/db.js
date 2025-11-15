// Exam storage using Vercel KV (with fallback to file-based for local dev)
// In production: uses Vercel KV for persistent storage

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load Vercel KV if available (production on Vercel)
// Falls back to file-based storage otherwise
let kv = null;
let usingKV = false;
let kvInitialized = false;

(async () => {
  try {
    const { kv: kvClient } = await import('@vercel/kv');
    kv = kvClient;
    if (kv) {
      usingKV = true;
      kvInitialized = true;
      console.log('✓ Vercel KV initialized for exams');
    }
  } catch (err) {
    console.log('ℹ️  Vercel KV not available for exams, using file-based storage');
    usingKV = false;
  }
})();

// KV key for exams storage
const EXAMS_KEY = 'examplified:exams';

// File-based fallback for local development
let localExamsCache = null;

async function loadExams() {
  
  try {
    if (usingKV && kv) {
      const data = await kv.get(EXAMS_KEY);
      if (data) return data;
    } else {
      // Try to load from file for local dev
      if (fs.existsSync(EXAMS_FILE)) {
        const data = fs.readFileSync(EXAMS_FILE, 'utf8');
        localExamsCache = JSON.parse(data);
        return localExamsCache;
      }
      if (localExamsCache) return localExamsCache;
    }
  } catch (err) {
    console.warn('Error loading exams:', err.message);
  }
  
  // Return default cache
  return [];
}

async function saveExams(exams) {
  try {
    if (usingKV && kv) {
      // Save to Vercel KV (no expiration, persistent)
      await kv.set(EXAMS_KEY, exams);
      return true;
    } else {
      // Fallback to file-based storage
      localExamsCache = exams;
      try {
        fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2), 'utf8');
      } catch (err) {
        console.warn('Could not write exams to file:', err.message);
      }
      return true;
    }
  } catch (err) {
    console.error('Error saving exams:', err.message);
    localExamsCache = exams;
    return false;
  }
}

async function getAllExams() {
  return await loadExams();
}

async function getExamById(id) {
  const exams = await loadExams();
  return exams.find(e => e.id === id) || null;
}

async function createExam(exam) {
  const exams = await loadExams();
  const newExam = {
    ...exam,
    id: exam.id || `exam-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  exams.push(newExam);
  await saveExams(exams);
  return newExam;
}

async function updateExam(id, updates) {
  const exams = await loadExams();
  const index = exams.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  exams[index] = {
    ...exams[index],
    ...updates,
    id, // don't allow id change
    updatedAt: new Date().toISOString(),
  };
  await saveExams(exams);
  return exams[index];
}

async function deleteExam(id) {
  const exams = await loadExams();
  const filtered = exams.filter(e => e.id !== id);
  if (filtered.length === exams.length) return false; // not found
  await saveExams(filtered);
  return true;
}

export default {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
