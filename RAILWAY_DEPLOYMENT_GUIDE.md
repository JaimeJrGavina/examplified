# Railway.app Backend Deployment Guide

## What is Railway?
Railway is a cloud platform that lets you deploy Node.js apps for free. Your backend will run on Railway's servers, accessible from anywhere.

---

## Step 1: Sign Up to Railway

1. Go to: https://railway.app/
2. Click **Sign up** (top right)
3. Choose login method:
   - GitHub (easiest)
   - Google
   - Email

4. Complete sign up

---

## Step 2: Prepare Your Backend Files

Before deploying to Railway, you need to prepare your backend code.

### Create a Deployment Package

1. On your computer, go to: `d:\Working Apps\Working examplified version 3\server\`
2. Copy these files to a new folder called `examplified-backend`:
   - `index-new.js` (rename to `index.js` or keep as is)
   - `package.json`
   - `customers.js`
   - `db.js`
   - `mailer-esm.js`
   - `generate-token.js`
   - `create-customer.js`
   - `store.js`
   - Entire `middleware/` folder
   - Entire `client/` folder

3. Create two empty folders inside:
   - `data/`
   - `outbox/`

### Your folder structure should look like:
```
examplified-backend/
├── index-new.js
├── package.json
├── customers.js
├── db.js
├── mailer-esm.js
├── generate-token.js
├── create-customer.js
├── store.js
├── middleware/
├── client/
├── data/
└── outbox/
```

---

## Step 3: Create GitHub Repository (EASIEST METHOD)

Railway integrates best with GitHub.

### Option A: Using GitHub Desktop (Easy)

1. Download: https://desktop.github.com/
2. Open GitHub Desktop
3. Click **File** → **New Repository**
4. Fill in:
   - **Name:** `examplified-backend`
   - **Local Path:** Choose where to save locally
   - **Initialize repository with README:** Check this

5. Click **Create Repository**
6. In Finder/Explorer, copy your backend files into this folder
7. Back in GitHub Desktop:
   - You'll see your files in the left panel
   - **Summary:** "Initial commit"
   - Click **Commit to main**
   - Click **Publish repository**
   - Click **Publish** again

8. You now have a GitHub repo!

### Option B: Upload via Website

1. Go to: https://github.com/new
2. Create new repo:
   - **Repository name:** `examplified-backend`
   - **Public** (so Railway can access it)
   - Click **Create repository**

3. GitHub shows you commands. Follow them to upload your files.

---

## Step 4: Deploy to Railway from GitHub

### In Railway Dashboard:

1. Login to Railway: https://railway.app/dashboard
2. Click **Create New Project**
3. Select **Deploy from GitHub**
4. Authorize Railway to access GitHub
5. Select your repo: **examplified-backend**
6. Select **main** branch
7. Click **Deploy**

Railway will automatically:
- Detect Node.js
- Run `npm install`
- Start your app

**Wait 2-3 minutes for deployment...**

---

## Step 5: Configure Environment Variables

Once deployed:

1. In Railway dashboard, click your project
2. Go to **Variables** tab
3. Add these variables:
   - **PORT** = `3000`
   - **NODE_ENV** = `production`

4. Click **Save**

Railway will restart your app automatically.

---

## Step 6: Get Your Backend URL

In Railway dashboard:

1. Click your project
2. Go to **Settings** tab
3. Look for **Domains**
4. You'll see a URL like:
   ```
   https://examplified-backend-production.up.railway.app
   ```

**Copy this URL!**

---

## Step 7: Test Your Backend

Test if Railway backend is working:

```
Visit: https://examplified-backend-production.up.railway.app/health
```

Expected response: `{"ok":true}`

If you see this, your backend is live! ✅

---

## Step 8: Update Your Frontend

Now connect your frontend to Railway backend.

### Edit vite.config.ts

Open your local `vite.config.ts` and update the backend URL:

```typescript
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    const backendUrl = isProduction 
      ? 'https://examplified-backend-production.up.railway.app'  // ← Your Railway URL
      : 'http://localhost:4000';
    
    return {
      base: isProduction ? '/examplified/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/admin/': {
            target: backendUrl,
            changeOrigin: true,
          },
          '/exams': {
            target: backendUrl,
            changeOrigin: true,
          },
          '/health': {
            target: backendUrl,
            changeOrigin: true,
          },
          '/customer-access': {
            target: backendUrl,
            changeOrigin: true,
          },
          '/customer-login': {
            target: backendUrl,
            changeOrigin: true,
          },
          '/customer-recover': {
            target: backendUrl,
            changeOrigin: true,
          },
        },
      },
      // ... rest of config
    };
});
```

### Rebuild Frontend

```bash
cd "d:\Working Apps\Working examplified version 3"
npm run build
```

### Re-upload to Hostinger

Upload the new `dist/` folder to Hostinger's `/public_html/examplified/`

---

## Step 9: Test Full Application

1. Go to: `https://smartbarexam.com/examplified/`
2. Should see login page
3. Admin login: Paste your admin token
4. Should see admin dashboard
5. Test creating a student
6. Test student login

---

## Railway Dashboard Commands

```bash
# View live logs
# In Railway dashboard → Logs tab

# View environment variables
# Settings → Variables tab

# Restart app
# Settings → Restart

# Stop/Start app
# Settings → Deploy or Pause

# Monitor CPU/Memory usage
# Observability tab
```

---

## Troubleshooting Railway

### App Won't Start

**Check Logs:**
1. In Railway dashboard → **Logs** tab
2. Look for error messages
3. Common issues:
   - `module not found` - missing file in git repo
   - `npm ERR` - missing dependency in package.json
   - `PORT already in use` - Railway handles this automatically

**Fix:**
1. Update GitHub repo with missing files
2. Railway auto-redeploys
3. Check logs again

### Backend Responds Slowly

**Normal** - Free tier has shared resources. Responses may take 5-10 seconds on first request.

### Want to Upgrade?

Railway's free tier works great for development/testing. If you need:
- Faster performance
- Custom domain
- More resources

Upgrade plan in Railway dashboard ($5-20/month).

---

## Your Deployment Summary

| Component | Location | URL |
|-----------|----------|-----|
| **Frontend** | Hostinger (`/public_html/examplified/`) | `https://smartbarexam.com/examplified/` |
| **Backend** | Railway | `https://examplified-backend-production.up.railway.app` |
| **Admin Token** | Your hPanel → Stored | Use in login |
| **Data Storage** | Railway (`/data/` folder) | Persistent |

---

## Next Steps Checklist

- [ ] Sign up to Railway.app
- [ ] Create GitHub repo with backend files
- [ ] Deploy to Railway
- [ ] Add environment variables in Railway
- [ ] Test backend health endpoint
- [ ] Update vite.config.ts with Railway URL
- [ ] Rebuild frontend: `npm run build`
- [ ] Re-upload `dist/` to Hostinger
- [ ] Test full application at `https://smartbarexam.com/examplified/`
- [ ] Test admin login
- [ ] Test student creation
- [ ] Test student login

---

## Support

**Railway Issues:**
- Check Logs in dashboard
- Railway Docs: https://docs.railway.app/

**Your App Issues:**
- Browser console (F12)
- Network tab to see API calls
- Check both frontend and backend URLs match

---

## You're Almost There! 🚀

Once deployed:
1. Your frontend is live at `smartbarexam.com/examplified/`
2. Your backend is live on Railway
3. They're connected and working together
4. You can create students and they can take exams

Let me know when you've deployed to Railway and I'll help with any issues!
