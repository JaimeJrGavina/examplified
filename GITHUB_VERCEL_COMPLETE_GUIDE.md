# Deploy Everything to GitHub + Vercel

## What We're Doing

Creating ONE GitHub repo with:
- Frontend (React/Vite) in root
- Backend (Node.js API) in `/api` folder
- Deploy everything to Vercel

---

## Step 1: Create GitHub Repo Structure

Your final repo structure will look like:

```
examplified/
├── package.json (frontend)
├── vite.config.ts
├── index.html
├── src/
│   ├── App.tsx
│   ├── components/
│   └── ...
├── api/
│   ├── index-new.js (or index.js)
│   ├── package.json
│   ├── customers.js
│   ├── db.js
│   └── ...
├── .gitignore
└── README.md
```

---

## Step 2: Prepare Files Locally (On Your Computer)

### Option A: Using GitHub Desktop (Easiest)

1. **Open GitHub Desktop**
2. Click **File** → **New Repository**
3. Fill in:
   - **Name:** `examplified`
   - **Local Path:** Desktop (or anywhere)
   - **Git ignore:** Node

4. Click **Create Repository**

### Option B: Create Folder Manually

On your Desktop, create folder: `examplified`

---

## Step 3: Copy Your Files

### Copy Frontend Files

From: `d:\Working Apps\Working examplified version 3\`

Copy these to your `examplified` folder:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `src/` folder (entire)
- `components/` folder (entire)
- `services/` folder (entire)
- `.gitignore` (if exists)
- `README.md`

### Copy Backend Files

Create a subfolder: `examplified/api/`

Copy from: `d:\Working Apps\Working examplified version 3\server\`

Copy these INTO `examplified/api/`:
- `index-new.js` (rename to `index.js`)
- `package.json`
- `customers.js`
- `db.js`
- `mailer-esm.js`
- `generate-token.js`
- `create-customer.js`
- `store.js`
- `middleware/` folder
- `client/` folder
- `data/` folder (create empty)
- `outbox/` folder (create empty)

---

## Step 4: Update vite.config.ts

Edit your `vite.config.ts` for Vercel:

```typescript
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    const backendUrl = isProduction 
      ? '/api'  // Vercel will handle this
      : 'http://localhost:4000';
    
    return {
      base: '/',  // Changed from '/examplified/'
      server: {
        port: 3000,
        proxy: {
          '/api/': {
            target: backendUrl,
            changeOrigin: true,
          },
        },
      },
      // ... rest
    };
});
```

---

## Step 5: Create .gitignore

Create file: `examplified/.gitignore`

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
api/node_modules/
api/dist/
```

---

## Step 6: Commit and Push to GitHub

### Using GitHub Desktop:

1. In GitHub Desktop, you'll see all your files
2. At bottom, fill:
   - **Summary:** `Initial commit - Full app`
   - **Description:** `Frontend + Backend for Examplified`

3. Click **Commit to main**
4. Click **Publish repository**
5. Uncheck "Keep this code private"
6. Click **Publish**

### Using Command Line:

```bash
cd examplified
git init
git add .
git commit -m "Initial commit - Full app"
git branch -M main
git remote add origin https://github.com/yourusername/examplified.git
git push -u origin main
```

---

## Step 7: Deploy to Vercel

1. Go to: https://vercel.com/
2. Click **Import Project**
3. Select **Import Git Repository**
4. Find and select: `examplified`
5. Click **Import**

### Configure:

- **Framework Preset:** Vite
- **Root Directory:** `./` (or leave blank)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Add Environment Variables (Optional):

- `VITE_API_URL` = `/api`

### Click **Deploy**

Vercel will:
1. Build your frontend
2. Deploy your backend API
3. Give you a URL like `examplified.vercel.app`

---

## Step 8: Connect Your Domain

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Domains**
4. Add domain: `smartbarexam.com`
5. Update DNS records in Hostinger to point to Vercel

(Vercel will show you exact DNS records needed)

---

## Result

- 🌐 Domain: `smartbarexam.com` (your custom domain)
- 🚀 Frontend: Deployed on Vercel
- ⚙️ Backend: Deployed on Vercel (`/api` routes)
- ✅ Everything together, one platform

---

## Quick Checklist

- [ ] Create GitHub repo named `examplified`
- [ ] Copy frontend files to root
- [ ] Copy backend files to `api/` folder
- [ ] Update `vite.config.ts` base to `/` and backend to `/api`
- [ ] Create `.gitignore`
- [ ] Commit and push to GitHub
- [ ] Import into Vercel
- [ ] Deploy
- [ ] Update DNS in Hostinger
- [ ] Test at `smartbarexam.com`

---

## Done! 🎉

Your app is now on GitHub + Vercel with your custom domain!
