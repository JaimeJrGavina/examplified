# Hostinger Deployment Guide - Examplified

## Hostinger Setup Overview

Hostinger supports:
✅ Node.js applications
✅ Custom domains
✅ SSH/Terminal access
✅ Multiple ports
✅ Environment variables

---

## Step 1: Frontend Deployment (Easy)

### Upload Frontend to Hostinger:

1. **Login to Hostinger hPanel**
2. Go to **File Manager**
3. Navigate to **public_html**
4. Create folder: **examplified**
5. Upload from `dist/` folder:
   - Upload `index.html`
   - Upload `assets/` folder

**Verify:**
- Visit: `https://smartbarexam.com/examplified/`
- Should see login page (not blank)

### If Blank Page (Fix React Routing):

1. In **public_html/examplified/** create file: `.htaccess`
2. Add this content:

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

3. Save and refresh browser (Ctrl+Shift+R)

---

## Step 2: Backend Deployment on Hostinger (SSH Method)

**Your Single Web Hosting plan doesn't have Node.js Apps manager, but SSH is available - perfect!**

### Deploy Backend via SSH (RECOMMENDED)

If Hostinger's Node.js manager isn't available:

#### Step 1: Enable SSH Access (if not already enabled)

1. In hPanel → **Account Settings** → **SSH Access**
2. Make sure it shows **SSH is enabled**
3. Get your SSH credentials (usually shown there)

#### Step 2: Connect via SSH Terminal

**On Windows:** Use PuTTY or Windows Terminal
```powershell
ssh yourusername@smartbarexam.com
```

**On Mac/Linux:**
```bash
ssh yourusername@smartbarexam.com
```

When prompted, enter your **SSH password** (usually same as hPanel password)

#### Step 3: Create Backend Directory

Once logged in via SSH:

```bash
# Create directory for backend
mkdir -p ~/examplified-backend
cd ~/examplified-backend

# Check if Node.js is installed
node --version
npm --version
```

**If Node.js is NOT installed:**
Contact Hostinger support: "Can you install Node.js on my account?"
Most support Node.js by default on Single plans.

#### Step 4: Upload Backend Files via FTP

1. In hPanel → **File Manager** → **FTP Accounts** (or use credentials below)
2. Connect with FTP client:
   - Host: `smartbarexam.com`
   - Username: Your Hostinger username
   - Password: Your Hostinger password
   - Port: 21

3. Navigate to: `examplified-backend` folder
4. Upload these files:
   - `index-new.js`
   - `package.json`
   - `customers.js`
   - `db.js`
   - `mailer-esm.js`
   - `generate-token.js`
   - `create-customer.js`
   - `store.js`
   - Entire `middleware/` folder
   - Entire `client/` folder

5. Create these empty folders:
   - `data/`
   - `outbox/`

#### Step 5: Install Dependencies via SSH

SSH back in and run:

```bash
cd ~/examplified-backend
npm install
```

Wait 2-3 minutes for npm packages to install.

#### Step 6: Test Your Backend

```bash
# Test if it starts
node index-new.js
```

You should see:
```
Server running on http://localhost:3000
Customer Management Routes:
✓ POST /admin/customers
✓ GET /admin/customers
✓ DELETE /admin/customers/:id
...
```

**If it works, press Ctrl+C to stop it.**

#### Step 7: Keep Backend Running (Use PM2)

To keep your backend running even after SSH disconnect:

```bash
# Install PM2 globally
npm install -g pm2

# Start your backend with PM2
pm2 start index-new.js --name "examplified-api"

# Make sure it restarts on reboot
pm2 startup
pm2 save

# Check status
pm2 status
```

Now your backend stays running 24/7!

#### Step 8: Access Your Backend

Your backend will run on:
- **Local access (from server):** `http://localhost:3000`
- **From internet:** `https://smartbarexam.com:3000`

**OR (Better option):** Use a subdomain with proxy

---

## Step 3: Connect Frontend to Backend

Your backend is now running at: `https://smartbarexam.com:3000`

### Update Frontend Configuration

#### Option A: Point to Backend via Port (Easiest)

Your backend URL is: `https://smartbarexam.com:3000`

In `vite.config.ts`, update the backend URL:

```typescript
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    const backendUrl = isProduction 
      ? 'https://smartbarexam.com:3000'  // ← Your Hostinger backend
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

#### Option B: Use Subdomain (Better UX - No Visible Port)

If you want the backend accessible as `https://api.smartbarexam.com` instead of `:3000`:

1. In hPanel → **Addon Domains** or **Subdomains**
2. Create subdomain: `api.smartbarexam.com`
3. Point to: `~/examplified-backend/`
4. Update `vite.config.ts`:

```typescript
const backendUrl = isProduction 
  ? 'https://api.smartbarexam.com'  // ← Much cleaner!
  : 'http://localhost:4000';
```

Then update `.htaccess` in `/public_html/api/` (in the subdomain folder):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index-new.js [L,QSA]
</IfModule>
```

### Rebuild and Re-upload Frontend

```bash
npm run build
```

Upload new `dist/` folder to Hostinger `/public_html/examplified/`

---

## Step 4: Test Everything

### Test 1: Frontend Loads
```
Visit: https://smartbarexam.com/examplified/
Expected: Login page appears
```

### Test 2: Backend Health
```
Visit: https://examplified-api.yourdomain.com/health
Expected: {"ok":true}
```

### Test 3: Admin Login
```
1. Go to: https://smartbarexam.com/examplified/admin
2. Paste admin token
3. Click Login
Expected: Admin dashboard appears
```

### Test 4: Create Student
```
1. In admin dashboard → Customer Access Management
2. Enter: test@example.com
3. Click: Create Customer
Expected: Student created successfully
```

### Test 5: Student Login
```
1. Go to: https://smartbarexam.com/examplified/
2. Enter email and token (from test 4)
3. Click Login
Expected: Available Exams dashboard
```

---

## Hostinger-Specific Settings

### For Your Single Web Hosting Plan:

Your plan includes:
- ✅ SSH/Terminal access
- ✅ File Manager (FTP)
- ✅ 25 PHP Workers (good for concurrent requests)
- ✅ Node.js support (when installed)
- ✅ WP-CLI access
- ✅ Free SSL (HTTPS)

### CORS Configuration

Since backend is separate, CORS is already handled in `index-new.js`:

```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
```

### Port 3000 vs Port 80/443

**Port 3000 (Node.js):**
- For backend API
- Accessed at: `https://smartbarexam.com:3000`
- Should work on Single plan
- If blocked, contact support: "Can I run Node.js on port 3000?"

**Port 80/443 (Apache):**
- For frontend (automatically handled)
- Accessed at: `https://smartbarexam.com/examplified/`
- Always available

### Email in Development

Emails are saved to `~/examplified-backend/outbox/` folder:

View via SSH:
```bash
cat ~/examplified-backend/outbox/*.txt
```

Or via File Manager in hPanel.

### PM2 Process Manager

To keep backend running permanently with **PM2**:

```bash
# Install PM2
npm install -g pm2

# Start your backend
pm2 start index-new.js --name "examplified-api"

# Auto-restart on reboot
pm2 startup
pm2 save

# Check running processes
pm2 status
pm2 logs examplified-api
```

---

## Hostinger Troubleshooting for Single Plan

### Issue: Backend Won't Start

**Check Node.js is installed:**
```bash
node --version
npm --version
```

**If NOT installed:**
Contact Hostinger: "Is Node.js available on my Single Web Hosting plan?"

**If installed, check logs:**
```bash
cd ~/examplified-backend
node index-new.js
# Look for error messages
```

### Issue: Port 3000 Not Accessible

Hostinger Single plan may require special setup for custom ports.

**Solution 1: Contact Support**
"Can I access Node.js running on port 3000 from the internet?"

**Solution 2: Use Subdomain + Proxy (Workaround)**
Create subdomain `api.smartbarexam.com` and proxy requests to port 3000 via `.htaccess`

**Solution 3: Switch Backend Host**
Deploy backend to free tier (Render, Railway, Heroku)

### Issue: PM2 Not Starting on Reboot

```bash
# Reinstall PM2 startup
pm2 startup
pm2 save

# Check if it worked
pm2 status
```

### Issue: Still Getting Blank Frontend Page

**Fix React Routing:**
1. Verify `.htaccess` is in `/public_html/examplified/`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)

**Check file upload:**
```
Expected files:
/public_html/examplified/index.html
/public_html/examplified/assets/index-BIP8DvFD.js
```

### Issue: Backend API Calls Fail

**Check CORS:**
```bash
# Test backend directly
curl -i https://smartbarexam.com:3000/health
```

**Expected response:**
```
HTTP/2 200
{"ok":true}
```

If doesn't work, backend might not be running or port is blocked.

### Issue: Can't SSH or Connect

In hPanel:
1. Go to **SSH Access**
2. Make sure it says **SSH is enabled**
3. Get your SSH credentials again
4. Try different SSH client (PuTTY, Windows Terminal, MobaXterm)

---

## Hostinger SSH Commands Reference (For Your Single Plan)

```bash
# Connect via SSH
ssh yourusername@smartbarexam.com

# Check Node.js
node --version
npm --version

# Create backend directory
mkdir -p ~/examplified-backend
cd ~/examplified-backend

# Install dependencies
npm install

# Start server manually to test
node index-new.js

# Stop the server
# Press Ctrl+C

# Keep server running (use PM2)
npm install -g pm2
pm2 start index-new.js --name "examplified-api"
pm2 startup
pm2 save

# Check running processes
pm2 status
pm2 logs examplified-api

# View backend output files
cat ~/examplified-backend/outbox/*.txt

# Check if port 3000 is open
netstat -tuln | grep 3000

# Stop all Node processes
pm2 kill

# Check Node processes
ps aux | grep node
```

---

## Final Hostinger Single Plan Checklist

**Frontend Deployment:**
- [ ] Frontend files uploaded to `/public_html/examplified/`
- [ ] `.htaccess` file created in `/public_html/examplified/`
- [ ] Frontend loads at `https://smartbarexam.com/examplified/` (not blank)
- [ ] All assets loading (check F12 → Network tab)

**Backend Deployment (SSH):**
- [ ] SSH connection working
- [ ] Node.js installed (verify with `node --version`)
- [ ] Created `/home/yourusername/examplified-backend/` folder
- [ ] Backend files uploaded via FTP
- [ ] `npm install` completed successfully
- [ ] Backend starts manually: `node index-new.js`
- [ ] PM2 installed and configured
- [ ] Backend running with PM2: `pm2 status` shows "online"
- [ ] Backend URL is `https://smartbarexam.com:3000`

**Configuration:**
- [ ] `vite.config.ts` updated with correct backend URL
- [ ] Frontend rebuilt: `npm run build`
- [ ] New `dist/` folder uploaded to Hostinger
- [ ] `.htaccess` has React Router configuration

**Testing:**
- [ ] Frontend loads at `https://smartbarexam.com/examplified/`
- [ ] Backend responds: `https://smartbarexam.com:3000/health`
- [ ] Admin login works with token
- [ ] Student creation works
- [ ] Student login works
- [ ] Exam CRUD operations work

**Maintenance:**
- [ ] PM2 configured for auto-restart on reboot
- [ ] Monitor logs: `pm2 logs examplified-api`
- [ ] Check disk space regularly
- [ ] Backup data folder: `~/examplified-backend/data/`

---

## Support

**For Hostinger-specific help:**
- Login to hPanel
- Click **Support** → **Contact Us**
- Ask: "How to run a Node.js app with custom domain?"

**For app-specific help:**
- Check logs in hPanel
- Review `TROUBLESHOOTING_DEPLOYMENT.md`
- Check browser console (F12)

---

## You're Ready!

Everything is configured for Hostinger. Follow these steps and your app will be live! 🚀
