# Backend Exam Storage System

## Overview

Your exams are now persisted to a JSON file (`server/data/exams.json`) on the backend. Every exam you create in the Admin Dashboard is automatically saved and can be loaded on the frontend.

## How It Works

### 1. Admin Creates Exam (Backend Dashboard)
- You fill out exam details (title, subject, questions, answers) in the Admin Dashboard
- Click **"Publish Exam"** → sends `POST /admin/exams` with your admin token
- Backend saves the exam to `server/data/exams.json`

### 2. Frontend Loads Exams (Dashboard Page)
- App starts → fetches `GET /exams` (public, no auth required)
- Displays all saved exams for students to take

### 3. Student Takes Exam
- Selects an exam from Dashboard
- Answers questions (in-memory)
- Submits exam → result displayed

## API Endpoints

### Protected Admin Routes (require Bearer token)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/exams` | List all exams |
| GET | `/admin/exams/:id` | Get specific exam |
| POST | `/admin/exams` | Create new exam |
| PUT | `/admin/exams/:id` | Update exam |
| DELETE | `/admin/exams/:id` | Delete exam |

### Public Routes (no auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/exams` | List all exams (for students) |
| GET | `/exams/:id` | Get specific exam (for taking) |

## Local Testing

### 1. Start Backend Server

```bash
npm install express  # if not already installed
node .\server\index-new.js
```

You should see:
```
✓ Backend server running on http://localhost:4000

Protected routes (require Bearer token):
  GET    /admin/exams
  POST   /admin/exams
  ...

Public routes (no auth):
  GET    /exams
  GET    /exams/:id
```

### 2. Start Frontend Dev Server (in another terminal)

```bash
npm run dev
```

### 3. Test Flow

1. **Admin Dashboard** → Enter token → Create exam → Click "Publish"
2. **Check backend storage:**
   ```bash
   cat .\server\data\exams.json
   ```
3. **Dashboard** → Refresh page → New exam appears in the list
4. **Test the exam** → Take it as a student

## Data Storage

Exams are stored in:
```
server/data/exams.json
```

Example structure:
```json
[
  {
    "id": "exam-1763012801",
    "title": "Contracts",
    "subject": "Bar Exam",
    "description": "Contract law essentials",
    "durationMinutes": 60,
    "questions": [
      {
        "id": "q1",
        "text": "Fact pattern...",
        "type": "ESSAY",
        "modelAnswer": "Answer..."
      }
    ],
    "createdBy": "admin",
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T10:00:00.000Z"
  }
]
```

## Deployment to Hostinger

### Option 1: Simple Node.js Hosting (Recommended)

1. **Upload to Hostinger**
   - Connect via SFTP or Git
   - Upload entire `Examplified/` folder
   - Create `/server/data/` directory (for exam storage)

2. **Set environment**
   ```bash
   npm install
   npm run build  # builds frontend to dist/
   node server/index-new.js
   ```

3. **Serve frontend from `dist/`**
   - Configure Hostinger to serve static files from `dist/`
   - Backend runs on a Node.js port (e.g., 4000)

### Option 2: Use Existing Hostinger Setup (If Already Using Node)

If your site already uses Node.js:
1. Place backend server at `server/index-new.js`
2. Ensure `server/data/` is writable
3. Start server with your process manager (PM2, systemd, etc.)

### Option 3: Shared Hosting with PHP (Alternative)

If you only have PHP hosting:
- Use a database or managed API service (Firebase, MongoDB Atlas)
- Build a simple PHP API to save/load exams as JSON
- Still deploy the React frontend as static files

## Migration to Real Database (Future)

When you're ready to scale beyond file storage:

1. **Replace `server/db.js`** with a database driver:
   ```javascript
   // Use MongoDB, PostgreSQL, SQLite, etc.
   const db = require('./db-mongo'); // or db-postgres, etc.
   ```

2. **No API changes needed** — the endpoints stay the same

3. **Recommended services:**
   - **MongoDB Atlas** (free tier, cloud)
   - **PostgreSQL** (via Hostinger or PlanetScale)
   - **SQLite** (file-based, works on shared hosting)

## Troubleshooting

### Exams not saving?
- Check if backend is running: `curl http://localhost:4000/health`
- Check browser console for fetch errors
- Verify admin token is valid

### Exams lost after restart?
- Exams are stored in `server/data/exams.json` (persistent)
- If file doesn't exist, check directory permissions
- Make sure `server/data/` exists and is writable

### Frontend not loading exams?
- Backend must be running for dynamic loading
- If backend is down, mock exams are used as fallback
- Check browser Network tab to see `/exams` request status

## Next Steps

1. ✅ Backend storage implemented
2. ⬜ Customer login system (codes from email receipts)
3. ⬜ Deploy to smartbarexam.com/examplified

Ready to deploy or add customer login?
