# Quick Start: Persistent Exam Storage

## 🚀 5-Minute Setup

### Step 1: Install Express (if not already installed)
```powershell
npm install express
```

### Step 2: Start the Backend Server
```powershell
node .\server\index-new.js
```

You should see:
```
✓ Backend server running on http://localhost:4000
...
Exams stored in: D:\Examplified\server\data\exams.json
```

### Step 3: Start Frontend (in a new terminal)
```powershell
npm run dev
```

### Step 4: Test the Flow

1. **Go to http://localhost:5173** (or whatever port Vite shows)
2. **Click "Backend Dashboard"**
3. **Enter your admin token:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDEyODAxfQ.SLRjAKMlBnemUpStjBojsZ5su_wWiua13-MxXRu1y0s
   ```

4. **Create a test exam:**
   - Title: "Contracts 101"
   - Subject: "Bar Exam"
   - Add a few questions with answers
   - Click **"Publish Exam"**

5. **Check backend storage:**
   ```powershell
   Get-Content .\server\data\exams.json | ConvertFrom-Json | ConvertTo-Json
   ```

6. **Refresh Dashboard page:**
   - Your exam should appear in the exam list!

## 📁 What Was Created

```
server/
├── index-new.js          ← Main backend server (CRUD + auth)
├── db.js                 ← Persistent storage (exams.json)
├── data/
│   └── exams.json        ← Your exams (auto-created)
└── middleware/
    └── adminAuth.js      ← Token validation
```

## 🔌 Key API Endpoints

### Save an Exam (Admin Only)
```bash
POST /admin/exams
Header: Authorization: Bearer <your-token>
Body: {
  "title": "Contracts",
  "subject": "Bar Exam",
  "durationMinutes": 60,
  "questions": [...]
}
```

### Load All Exams (Public)
```bash
GET /exams
```

### Load One Exam (Public)
```bash
GET /exams/:id
```

## 📝 Frontend Changes

- **AdminDashboard.tsx**: Now sends exams to backend on "Publish"
- **App.tsx**: Automatically loads exams from backend on startup
- **ProtectedAdminDashboard.tsx**: Token login required

## ⚠️ Important Notes

- Exams are stored in **`server/data/exams.json`** (JSON file)
- This is perfect for small-to-medium scale (hundreds of exams)
- When you deploy, make sure `server/data/` directory is writable
- Backend must be running for the app to save/load exams dynamically
- If backend is down, fallback to mock exams (frontend still works)

## 🚢 Deploy to Hostinger

1. Upload entire folder to Hostinger via SFTP
2. Create `server/data/` directory
3. Run backend with Node process manager
4. Point domain to `dist/` folder (frontend)
5. Backend runs on a separate port (e.g., 4000)

See **BACKEND_STORAGE.md** for detailed deployment instructions.

## 🎯 Next Step

Ready to add **customer login** (pay receipt → code → access)?

Let me know when you want to proceed!
