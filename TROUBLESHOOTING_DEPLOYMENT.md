# Troubleshooting Deployment Issues

## Issue 1: Frontend is Blank White Page

### Check 1: Browser Console
1. Visit: `https://smartbarexam.com/examplified/`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for red errors - what do they say?

### Check 2: Files Actually Uploaded?
1. Open cPanel File Manager
2. Navigate to: `/public_html/examplified/`
3. Verify you see:
   - ✓ `index.html`
   - ✓ `assets` folder with `index-BIP8DvFD.js`

**If missing:** Re-upload the files from `dist/` folder

### Check 3: Correct Base Path?
The app is configured for `/examplified/` path. Verify in browser:
- URL shows: `https://smartbarexam.com/examplified/`
- Not: `https://smartbarexam.com/` (without examplified)

### Check 4: .htaccess for React Router
React apps need an `.htaccess` file to work correctly on Apache hosting.

Create file: `/public_html/examplified/.htaccess`
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /examplified/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /examplified/index.html [L]
</IfModule>
```

Then try again.

### Check 5: MIME Types
Some hosting requires proper MIME types for .js files.

In cPanel → MIME Types:
- `.js` → `application/javascript`
- `.css` → `text/css`

---

## Issue 2: Backend Cannot Be Reached (Port 4000)

### Understanding the Problem
Port 4000 might not be accessible from the internet because:

1. **Hosting doesn't expose custom ports**
   - Most shared hosting only allows ports 80 (HTTP) and 443 (HTTPS)
   - Port 4000 is blocked for security

2. **Backend on wrong host**
   - Did you upload backend to same hosting?
   - Is Node.js installed on your hosting?

### Solutions:

#### **Solution A: Use Same Domain (Recommended)**

Instead of `https://smartbarexam.com:4000/`, use proxy routes:

Update backend URL to use same domain:
```
/admin/*      → https://smartbarexam.com/admin/*
/exams        → https://smartbarexam.com/exams
/customers/*  → https://smartbarexam.com/customers/*
```

This requires an `.htaccess` proxy or subdomain.

#### **Solution B: Deploy Backend Separately**

Don't use port 4000. Instead:
- Deploy to **Render.com** (free)
- Deploy to **Railway.app** (free)
- Deploy to **Heroku** (paid)
- Use their provided domain

Then update frontend to point to new backend URL.

#### **Solution C: Ask Hosting for Custom Port**

Contact your hosting support:
```
"I need to run a Node.js backend server on port 4000. 
Can you open/forward this port?"
```

Most hosting will say no to shared hosting. You may need VPS.

---

## Quick Diagnosis Steps

### Step 1: Check Frontend Files Uploaded
```
Via cPanel File Manager:
1. Go to: public_html/examplified/
2. Should see:
   ✓ index.html (2 KB)
   ✓ assets folder
   ✓ Inside assets: index-BIP8DvFD.js (470 KB)
```

### Step 2: Check Backend Uploaded
```
Via cPanel File Manager or SSH:
1. Go to: /home/yourusername/server/
2. Should see:
   ✓ index-new.js
   ✓ package.json
   ✓ customers.js
   ✓ db.js
   ✓ middleware folder
   ✓ data folder (empty is OK)
```

### Step 3: Check Backend Running
```
Via cPanel Terminal or SSH:
1. cd /home/yourusername/server
2. node index-new.js
3. Should see: "✓ Backend server running on http://localhost:4000"
4. Press Ctrl+C to stop
```

### Step 4: Check Environment Variables
```
In hosting control panel, verify:
✓ SESSION_SECRET is set
✓ PORT is set to 4000
✓ NODE_ENV is set to production
```

### Step 5: Check Node.js Version
```
Via SSH Terminal:
node --version
npm --version

Should show:
v18.x.x or higher
npm 9.x.x or higher
```

---

## Most Likely Issues & Fixes

### Issue: Frontend shows blank white page
**Most likely cause:** Files not properly uploaded or wrong folder

**Fix:**
1. Re-upload all files from `dist/` folder
2. Verify files are in `/public_html/examplified/`
3. Check browser console for errors (F12)
4. Add `.htaccess` file for routing

### Issue: Port 4000 not accessible
**Most likely cause:** Shared hosting doesn't expose custom ports

**Fix:**
1. Use backend proxy through same domain
2. Or deploy backend to separate Node.js hosting (Render, Railway)
3. Or upgrade to VPS

### Issue: Backend runs locally but not on hosting
**Most likely cause:** Node.js not installed or different version

**Fix:**
1. Check Node.js installed: `node --version`
2. Run `npm install` in server folder
3. Check `index-new.js` for require/import errors
4. Check server logs for error messages

---

## Detailed Troubleshooting

### For Blank Frontend Page:

**In browser (F12 Console), what errors do you see?**

Common errors and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| `404 Not Found` on JS | Assets not uploaded | Re-upload assets folder |
| `CORS error` | Backend not responding | Configure backend proxy |
| `Cannot GET /examplified` | Wrong base path | Check vite.config.ts base path |
| Mixed content | HTTP/HTTPS mismatch | Use HTTPS everywhere |
| `index.html: 404` | File not uploaded | Upload to correct folder |

### For Backend Not Reachable:

**Run these tests:**

```bash
# Test 1: Is backend running locally?
curl http://localhost:4000/health
# Should return: {"ok":true}

# Test 2: Can you SSH to hosting?
ssh yourusername@smartbarexam.com
cd ~/server
node index-new.js
# Should start without errors

# Test 3: Is port open on hosting?
# Try: https://smartbarexam.com:4000/health
# If blocked, contact hosting support
```

---

## What Information to Provide

When contacting hosting support, provide:
1. What errors in browser console (F12)?
2. Are files uploaded to correct folder?
3. Is Node.js installed? (`node --version`)
4. Can you SSH to server?
5. What's the exact error from backend? (`node index-new.js`)

---

## Next Steps

**Tell me:**
1. What does browser console show? (F12 → Console)
2. Are frontend files uploaded to `/public_html/examplified/`?
3. Are backend files uploaded to `/home/yourusername/server/`?
4. Can you SSH to server and run `node index-new.js`?
5. What error does it show?

Once you answer these, I can give you the exact fix!
