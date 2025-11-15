// Simple file-based persistent storage for exams
// In production: replace with a real database (MongoDB, PostgreSQL, etc.)
// Note: On Vercel, uses in-memory cache due to ephemeral filesystem

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

// In-memory cache for Vercel's ephemeral filesystem
let examsCache = null;
let cacheitialized = false;

function loadExams() {
  try {
    // Try to load from file first (for local dev and initial deploy)
    if (fs.existsSync(EXAMS_FILE)) {
      const data = fs.readFileSync(EXAMS_FILE, 'utf8');
      examsCache = JSON.parse(data);
      cacheitialized = true;
      return examsCache;
    }
  } catch (err) {
    console.warn('Error loading exams from file:', err.message);
  }
  
  // If cache is already initialized, return it (for Vercel's ephemeral fs)
  if (cacheitialized && examsCache) {
    return examsCache;
  }
  
  // Initialize default cache
  examsCache = [];
  cacheitialized = true;
  return examsCache;
}

function saveExams(exams) {
  // Update in-memory cache first (critical for Vercel)
  examsCache = exams;
  cacheitialized = true;
  
  try {
    // Try to persist to file (works on local, may fail on Vercel)
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(exams, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('⚠️  Warning: Could not write exams to file. Using in-memory storage.', err.message);
    console.warn('   This is normal on Vercel. For persistent storage, use Vercel KV or a database.');
    // Still return true since data is cached in memory
    return true;
  }
}

function getAllExams() {
  return loadExams();
}

function getExamById(id) {
  const exams = loadExams();
  return exams.find(e => e.id === id) || null;
}

function createExam(exam) {
  const exams = loadExams();
  const newExam = {
    ...exam,
    id: exam.id || `exam-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  exams.push(newExam);
  saveExams(exams);
  return newExam;
}

function updateExam(id, updates) {
  const exams = loadExams();
  const index = exams.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  exams[index] = {
    ...exams[index],
    ...updates,
    id, // don't allow id change
    updatedAt: new Date().toISOString(),
  };
  saveExams(exams);
  return exams[index];
}

function deleteExam(id) {
  const exams = loadExams();
  const filtered = exams.filter(e => e.id !== id);
  if (filtered.length === exams.length) return false; // not found
  saveExams(filtered);
  return true;
}

export default {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
