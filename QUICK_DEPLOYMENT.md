# Quick Deployment Steps - smartbarexam.com/examplified

## What You Have Ready

✅ **Frontend Build** (in `dist/` folder)
- Ready to upload to web hosting
- Pre-configured for `/examplified/` path
- All assets optimized for production

✅ **Backend Files** (in `server/` folder)
- Ready to upload to web hosting or separate Node.js server
- Express.js server with all APIs
- Customer management system
- Admin authentication

---

## Deployment Process (Simple)

### Step 1: Prepare Frontend Files (Already Done!)
✅ Build created in: `d:\Working Apps\Working examplified version 3\dist\`

Files to upload:
- `dist/index.html` (main HTML file)
- `dist/assets/` (JavaScript, CSS, images)

### Step 2: Upload Frontend to Web Hosting

**Using cPanel/File Manager:**

1. Login to your hosting control panel
2. Go to **File Manager** → **public_html**
3. Create a new folder named **examplified**
4. Open the **examplified** folder
5. Upload all files from `dist/` folder:
   - Upload `index.html`
   - Upload entire `assets/` folder

**Directory structure after upload:**
```
public_html/
├── examplified/
│   ├── index.html          ← Upload this
│   ├── assets/             ← Upload this folder
│   │   ├── index-xxxx.js
│   │   └── index-xxxx.css
│   └── ... (any other static files)
```

**OR Using FTP:**
```
ftp://smartbarexam.com/
Connect → Navigate to /public_html/examplified/
Upload all files from dist/ folder
```

### Step 3: Test Frontend

Visit: **https://smartbarexam.com/examplified/**

You should see:
- Examplified login page
- Student access login interface
- No JavaScript errors

### Step 4: Upload Backend (Choose One Option)

#### **Option A: If Your Hosting Supports Node.js (Recommended)**

1. Connect to hosting via FTP or cPanel Terminal
2. Upload `server/` folder to your hosting
3. Install dependencies:
   ```bash
   cd server
   npm install
   ```
4. Create a startup script or use hosting's process manager
5. Set environment variables in hosting control panel:
   - `SESSION_SECRET` = any secure random string
   - `PORT` = 4000 (or your hosting port)

#### **Option B: Deploy Backend Separately (Alternative)**

Use a free Node.js hosting service:

**Recommended Services (with free tier):**
- **Render.com** (recommended - easiest)
- **Railway.app**
- **Heroku** (paid only now)
- **Replit**

**Steps for Render.com:**
1. Go to https://render.com
2. Create account
3. Click "New +"→ "Web Service"
4. Connect GitHub or upload code
5. Set environment variables
6. Deploy
7. Note the backend URL (e.g., `https://your-app.onrender.com`)

#### **Option C: Your Own VPS/Server**

- Purchase VPS (DigitalOcean, Linode, AWS)
- Install Node.js
- Upload `server/` folder
- Run: `node index-new.js`

---

## Step 5: Connect Frontend to Backend

After deploying backend, update the frontend to point to it.

**If backend is on SAME hosting:**
- Update proxy routes in frontend to point to backend port
- Already configured to `/admin/*` and `/exams` routes

**If backend is on DIFFERENT server:**
- Update frontend proxy configuration
- Edit `vite.config.ts` proxy targets to point to your backend URL

---

## File Summary: What to Upload

### **Frontend (to `/public_html/examplified/`)**
```
dist/
├── index.html                    (2.07 kB)
├── assets/
│   ├── index-BIP8DvFD.js         (481 kB)
│   └── index-BIP8DvFD.css        (styles)
```

### **Backend (to `/server/` or separate host)**
```
server/
├── index-new.js                  (main server)
├── package.json                  (dependencies)
├── generate-token.js             (token generator)
├── customers.js                  (customer management)
├── db.js                         (exam storage)
├── mailer-esm.js                (email handling)
├── middleware/
│   └── adminAuth.js             (authentication)
├── data/                         (will be created)
│   ├── customers.json
│   └── exams.json
└── outbox/                       (will be created)
    └── (email files)
```

---

## Testing After Deployment

### Test 1: Frontend Loads
```
Visit: https://smartbarexam.com/examplified/
Expected: Login page appears
```

### Test 2: Admin Login
```
1. Go to: https://smartbarexam.com/examplified/admin
2. Paste admin token:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI
3. Click Login
Expected: Admin dashboard appears
```

### Test 3: Create Student
```
1. In admin dashboard → Customer Access Management
2. Enter: student@test.com
3. Click: Create Customer
Expected: Student created, email saved to outbox
```

### Test 4: Student Login
```
1. Go to: https://smartbarexam.com/examplified/
2. Enter student email and token
3. Click Login
Expected: Available Exams dashboard appears
```

---

## Troubleshooting

### Frontend not loading (white page)
- Check browser console (F12)
- Verify files uploaded to correct path
- Try hard refresh (Ctrl+Shift+R)
- Check base path configuration

### Backend not working (API errors)
- Check if backend is running
- Verify backend URL in proxy config
- Check network tab in browser dev tools
- Look at backend server logs

### Admin token invalid
- Use the permanent token (no expiration)
- Check token hasn't been modified
- Verify `SESSION_SECRET` matches on backend

### CORS errors
- Already configured in `index-new.js`
- Make sure `changeOrigin: true` in proxy
- Verify backend CORS headers present

---

## Security Before Going Live

- [ ] Change `SESSION_SECRET` to unique strong string
- [ ] Use HTTPS (should be auto on hosting)
- [ ] Remove console.log debug statements
- [ ] Set up regular backups
- [ ] Monitor server logs
- [ ] Limit failed login attempts
- [ ] Keep Node.js updated

---

## After Deployment Support

**If something doesn't work:**

1. **Check frontend files uploaded** - Visit domain/examplified/
2. **Check browser console** - F12 → Console tab
3. **Check backend running** - Visit `/health` endpoint
4. **Check logs** - Backend server logs and hosting logs
5. **Check network requests** - F12 → Network tab

---

## Final Checklist

- [ ] Frontend build created (`dist/` folder)
- [ ] Frontend files uploaded to `/examplified/`
- [ ] Frontend accessible at `smartbarexam.com/examplified/`
- [ ] Backend deployed (same host or separate)
- [ ] Backend running and responding to `/health`
- [ ] Admin can login with token
- [ ] Admin can create student accounts
- [ ] Students can login and see exams
- [ ] Exams can be created/edited/deleted
- [ ] All features tested
- [ ] HTTPS working
- [ ] Backups configured

---

## Need Help?

Check these files for guidance:
- `DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `CUSTOMER_CREATION_GUIDE.md` - How to create student access
- `ADMIN_TOKEN_SETUP.md` - Admin token reference

Good luck deploying! 🚀
