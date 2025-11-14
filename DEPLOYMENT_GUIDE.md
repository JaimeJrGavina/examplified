# Deployment Guide - smartbarexam.com/examplified

## Deployment Overview

Your Examplified application consists of **two parts**:

### 1. **Frontend** (React/Vite)
- Built into static files (HTML, CSS, JS)
- Uploaded to: `/examplified/` on your web hosting

### 2. **Backend** (Node.js/Express)
- Runs as a Node.js server
- Can run on the same hosting or separately

---

## Step 1: Build the Frontend

```bash
cd "d:\Working Apps\Working examplified version 3"
npm run build
```

This creates a `dist/` folder with optimized production files.

**Output:** 
- `dist/index.html`
- `dist/assets/` (JavaScript bundles)
- Ready to upload to web hosting

---

## Step 2: Prepare Backend for Deployment

The backend consists of:
- `server/index-new.js` - Main server file
- `server/package.json` - Dependencies
- `server/data/` - Database folder (exams, customers)
- `server/middleware/` - Auth middleware
- `server/outbox/` - Email storage

### Backend Deployment Options:

#### **Option A: Deploy to Hosting with Node.js Support** (Recommended)
- Upload `server/` folder to hosting
- Run: `node index-new.js` on your hosting
- Set environment variable: `SESSION_SECRET=your-secret-key`

#### **Option B: Deploy to Separate Server** (e.g., Heroku, Render, Railway)
- Frontend on shared hosting
- Backend on Node.js hosting service

---

## Step 3: Update Configuration for Production

### 3.1: Update Frontend Base Path
Your app will be at `smartbarexam.com/examplified/`, so we need to update the Vite config:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/examplified/',  // Add this
  // ... rest of config
});
```

### 3.2: Update Backend URLs
The frontend needs to know where to find the backend. Update your environment:

- **Development**: `http://localhost:4000`
- **Production**: `https://smartbarexam.com/api` or your backend URL

---

## Step 4: Rebuild with Production Config

```bash
# Navigate to project
cd "d:\Working Apps\Working examplified version 3"

# Install dependencies (if needed)
npm install

# Build for production
npm run build
```

---

## Step 5: Upload to Web Hosting

### Using cPanel/FTP:

1. **Connect via FTP** to your hosting
2. **Create folder** `/public_html/examplified/`
3. **Upload** contents of `dist/` folder to `/public_html/examplified/`
   - Upload `index.html`
   - Upload `assets/` folder
   - Upload other static files

### Directory Structure on Hosting:
```
/public_html/
├── examplified/          ← Your app here
│   ├── index.html
│   ├── assets/
│   │   ├── main.xxxx.js
│   │   ├── main.xxxx.css
│   │   └── ...
│   └── ...
└── ... (other hosting files)
```

---

## Step 6: Deploy Backend

### If hosting supports Node.js:

1. **Upload** `server/` folder to your hosting
2. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```
3. **Set environment variables**:
   - `SESSION_SECRET=your-admin-secret-key`
   - `PORT=4000` (or hosting port)

4. **Start the server** (using hosting control panel or SSH)

### If hosting does NOT support Node.js:

Deploy backend separately to:
- **Heroku** (free tier available)
- **Render.com** (free tier)
- **Railway.app** (free tier)
- **Your own VPS**

---

## Step 7: Configure API Endpoint

Update frontend to point to production backend:

**File:** `src/constants.ts` or create `.env.production`

```typescript
// Production backend URL
const API_BASE_URL = 'https://smartbarexam.com/api'; // or your backend URL
```

Or update in `vite.config.ts`:

```typescript
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    // ...
    server: {
      proxy: {
        '/api/': {
          target: isProduction 
            ? 'https://smartbarexam.com' 
            : 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
```

---

## Step 8: Test Production Deployment

After uploading:

1. **Visit frontend**: `https://smartbarexam.com/examplified/`
2. **Check if it loads** - Should see the student login
3. **Test admin login**: Visit `/admin` route
4. **Verify backend connection**: Check network requests in browser dev tools

---

## Troubleshooting

### Frontend not loading:
- Check base path in `vite.config.ts`
- Verify files uploaded to correct directory
- Check browser console for errors (F12)
- Enable CORS if needed

### Backend not responding:
- Verify backend is running on hosting
- Check firewall/port settings
- Verify `SESSION_SECRET` environment variable set
- Check backend server logs

### CORS errors:
- Add CORS headers to backend (already done in `index-new.js`)
- Verify `changeOrigin: true` in proxy config

### Session/Token issues:
- Ensure `SESSION_SECRET` is consistent
- Check sessionStorage in browser
- Clear cookies/cache and try again

---

## Security Checklist

Before going live:

- [ ] Change `SESSION_SECRET` to a strong random string
- [ ] Use HTTPS (request SSL certificate from hosting)
- [ ] Set environment variables properly
- [ ] Remove debug logs from production code
- [ ] Set up database backups
- [ ] Enable rate limiting for APIs
- [ ] Monitor server logs

---

## Directory Structure (Final)

```
Your Hosting (smartbarexam.com):
├── public_html/
│   ├── examplified/        ← React frontend (built files)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   │
│   └── api/                ← Node.js backend (if on same host)
│       ├── index-new.js
│       ├── package.json
│       ├── server/
│       ├── data/
│       └── ...
```

---

## Quick Deployment Checklist

- [ ] Run `npm run build`
- [ ] Update `vite.config.ts` with `base: '/examplified/'`
- [ ] Configure backend URL in frontend
- [ ] Upload `dist/` folder to hosting
- [ ] Upload `server/` folder (if same host)
- [ ] Set environment variables
- [ ] Test frontend loads
- [ ] Test admin login
- [ ] Test customer creation
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts

---

## Need Help?

- Frontend issues → Check Vite config and build output
- Backend issues → Check Node.js server logs
- API issues → Check network tab in browser dev tools
- Deployment issues → Check hosting control panel

Good luck! 🚀
