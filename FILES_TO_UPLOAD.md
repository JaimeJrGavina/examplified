# Files to Upload - Deployment Package

## 📁 Frontend Files to Upload

**Location:** `d:\Working Apps\Working examplified version 3\dist\`

**Upload TO:** `smartbarexam.com:/public_html/examplified/`

### Files:
```
dist/
├── index.html                          ← Upload
├── assets/
│   ├── index-BIP8DvFD.js              ← Upload
│   └── index-BIP8DvFD.css             ← Upload
```

**Total Size:** ~500 KB

**Upload Steps:**
1. Create folder: `examplified` in `/public_html/`
2. Upload `index.html` into `examplified/`
3. Create subfolder `assets` inside `examplified/`
4. Upload all files from `dist/assets/` into `examplified/assets/`

**Verify:** Visit `https://smartbarexam.com/examplified/` - Should see login page

---

## 📁 Backend Files to Upload (If Same Host)

**Location:** `d:\Working Apps\Working examplified version 3\server\`

**Upload TO:** `smartbarexam.com:/home/yourusername/server/` (or ask hosting for Node.js location)

### Core Files to Upload:
```
server/
├── index-new.js                        ← Main server (REQUIRED)
├── package.json                        ← Dependencies (REQUIRED)
├── generate-token.js                   ← Token generator (optional)
├── customers.js                        ← Customer management (REQUIRED)
├── db.js                               ← Database (REQUIRED)
├── mailer-esm.js                       ← Email system (REQUIRED)
├── middleware/
│   └── adminAuth.js                    ← Authentication (REQUIRED)
├── data/                               ← Create empty folder
│   ├── customers.json                  ← Will be created automatically
│   └── exams.json                      ← Will be created automatically
└── outbox/                             ← Create empty folder
    └── (email files created automatically)
```

**Dependencies Installation:**
```bash
cd server
npm install
```

This installs:
- express (web server)
- Other dependencies from package.json

---

## 🔑 Important Configuration

### Environment Variables to Set:

**On hosting control panel or `.env` file:**

```
SESSION_SECRET=your-secure-random-string-here
PORT=4000
NODE_ENV=production
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Verification Checklist

After uploading:

### Frontend Test:
- [ ] Visit `https://smartbarexam.com/examplified/`
- [ ] Page loads without errors
- [ ] Login form appears

### Backend Test (if on same host):
- [ ] Visit `https://smartbarexam.com/health` (or backend domain)
- [ ] Returns `{"ok":true}`
- [ ] Check server logs for errors

### Full Test:
- [ ] Admin login works
- [ ] Can create customer
- [ ] Student can login
- [ ] Exams visible
- [ ] Can take exam

---

## 📊 File Size Reference

| File | Size | Type |
|------|------|------|
| index.html | 2.1 KB | HTML |
| index-BIP8DvFD.js | 481 KB | JavaScript |
| index-BIP8DvFD.css | ~50 KB | CSS |
| **Total Frontend** | **~533 KB** | **Minified** |
| **Backend** | **~50 KB** | **Node.js files** |

---

## 🔗 URLs After Deployment

| Component | URL |
|-----------|-----|
| **Frontend** | `https://smartbarexam.com/examplified/` |
| **Student Login** | `https://smartbarexam.com/examplified/` |
| **Admin Login** | `https://smartbarexam.com/examplified/admin` |
| **Backend Health** | `https://smartbarexam.com/health` (or backend domain) |

---

## 📝 Additional Notes

### About `dist/` Folder:
- Contains optimized production-ready files
- Already minified and compressed
- All source code removed
- Ready to upload as-is

### About `server/` Folder:
- Contains Node.js server code
- Needs `npm install` after upload
- Requires port 4000 or hosting configuration
- Data stored in `data/` folder

### About Build Process:
- Run `npm run build` whenever you change frontend code
- Re-upload new `dist/` folder to hosting
- Backend doesn't need rebuild if not changed

---

## 🚀 Quick Upload Summary

1. **Frontend (from `dist/` → hosting `examplified/`)**
   - Copy `index.html`
   - Copy `assets/` folder

2. **Backend (from `server/` → hosting)**
   - Copy all server files
   - Create `data/` folder (empty)
   - Run `npm install`

3. **Configuration**
   - Set `SESSION_SECRET` environment variable
   - Set backend URL in frontend if separate

4. **Test**
   - Load frontend URL
   - Test admin login
   - Test student creation
   - Test student login

---

## 💡 Tips

- **Keep backups** of original files
- **Test staging** before going live
- **Monitor logs** first 24 hours
- **Document changes** you make
- **Security first** - use strong SESSION_SECRET

---

## 🆘 Support Files

Refer to these for more information:
- `QUICK_DEPLOYMENT.md` - Step-by-step deployment
- `DEPLOYMENT_GUIDE.md` - Detailed guide
- `ADMIN_TOKEN_SETUP.md` - Admin token reference
- `CUSTOMER_CREATION_GUIDE.md` - Customer creation

Good luck! 🎉
