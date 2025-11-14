# Folder Structure - What Goes Where

## Your Local Machine (Ready to Upload)

```
d:\Working Apps\Working examplified version 3\
│
├── 📁 dist/                          ← FRONTEND (Upload to hosting)
│   ├── index.html                    ← Upload
│   └── 📁 assets/
│       └── index-BIP8DvFD.js         ← Upload
│
├── 📁 server/                        ← BACKEND (Upload to hosting or separate)
│   ├── index-new.js                  ← Upload
│   ├── package.json                  ← Upload
│   ├── generate-token.js             ← Upload
│   ├── customers.js                  ← Upload
│   ├── db.js                         ← Upload
│   ├── mailer-esm.js                 ← Upload
│   │
│   ├── 📁 middleware/                ← Upload folder
│   │   └── adminAuth.js
│   │
│   ├── 📁 data/                      ← Upload folder (or create if missing)
│   │   ├── customers.json            ← Auto-created
│   │   └── exams.json                ← Auto-created
│   │
│   └── 📁 outbox/                    ← Upload folder (or create if missing)
│       └── (email files created automatically)
│
├── 📁 components/                    ← For reference only
├── 📁 services/                      ← For reference only
│
├── 📄 DEPLOYMENT_READY.md            ← Start here!
├── 📄 QUICK_DEPLOYMENT.md            ← Simple steps
├── 📄 FILES_TO_UPLOAD.md             ← What to upload
├── 📄 DEPLOYMENT_GUIDE.md            ← Full guide
├── 📄 ADMIN_TOKEN_SETUP.md           ← Token info
├── 📄 CUSTOMER_CREATION_GUIDE.md     ← How to create students
│
├── 📄 package.json
├── 📄 vite.config.ts
├── 📄 tsconfig.json
└── ... (other project files)
```

---

## Web Hosting After Upload

### **Option 1: Single Host (Frontend + Backend)**

```
smartbarexam.com/
│
├── 📁 public_html/
│   │
│   ├── 📁 examplified/               ← Frontend
│   │   ├── index.html
│   │   └── 📁 assets/
│   │       ├── index-BIP8DvFD.js
│   │       └── index-BIP8DvFD.css
│   │
│   ├── 📁 server/                    ← Backend (if on same host)
│   │   ├── index-new.js
│   │   ├── package.json
│   │   ├── customers.js
│   │   ├── db.js
│   │   ├── 📁 middleware/
│   │   ├── 📁 data/
│   │   │   ├── customers.json
│   │   │   └── exams.json
│   │   └── 📁 outbox/
│   │
│   └── ... (other hosting files)
│
└── ... (other hosting folders)
```

### **Option 2: Separate Backend Host**

```
smartbarexam.com/                    (Shared Hosting)
├── 📁 public_html/
│   └── 📁 examplified/              ← Frontend
│       ├── index.html
│       └── 📁 assets/

Node.js Hosting (Render.com, Railway, etc)
├── 📁 server/                       ← Backend
│   ├── index-new.js
│   ├── package.json
│   ├── 📁 middleware/
│   ├── 📁 data/
│   └── 📁 outbox/
```

---

## Upload Checklist

### **Frontend Upload**

```
FROM: d:\Working Apps\Working examplified version 3\dist\
TO:   smartbarexam.com/public_html/examplified/

[ ] Create folder: examplified
[ ] Upload: index.html
[ ] Create folder: examplified/assets
[ ] Upload: assets/index-BIP8DvFD.js
[ ] Upload: assets/index-BIP8DvFD.css
[ ] Test: https://smartbarexam.com/examplified/
```

### **Backend Upload (if on same host)**

```
FROM: d:\Working Apps\Working examplified version 3\server\
TO:   smartbarexam.com/server/ (or hosting's app directory)

[ ] Create folder: server
[ ] Upload: index-new.js
[ ] Upload: package.json
[ ] Upload: customers.js
[ ] Upload: db.js
[ ] Upload: mailer-esm.js
[ ] Upload: generate-token.js
[ ] Create folder: server/middleware
[ ] Upload: middleware/adminAuth.js
[ ] Create folder: server/data
[ ] Create folder: server/outbox
[ ] Run: npm install
[ ] Set environment: SESSION_SECRET
[ ] Start server: node index-new.js
[ ] Test: https://smartbarexam.com/health
```

---

## File Sizes Reference

```
Frontend Bundle:
├── index.html              ~2 KB
├── index-BIP8DvFD.js       ~481 KB
└── index-BIP8DvFD.css      ~50 KB
─────────────────────────────────────
Total Frontend:            ~533 KB

Backend Files:
├── index-new.js            ~15 KB
├── customers.js            ~4 KB
├── db.js                   ~3 KB
├── mailer-esm.js           ~2 KB
├── generate-token.js       ~2 KB
└── middleware/adminAuth.js ~1 KB
─────────────────────────────────────
Total Backend (before npm install): ~27 KB
With node_modules:                   ~100+ MB
```

---

## FTP Upload Structure

When using FTP client (FileZilla, WinSCP, etc):

```
smartbarexam.com (root)
│
└── public_html/
    │
    ├── examplified/                    ← Create this folder
    │   ├── index.html                  ← Drag & drop from dist/
    │   └── assets/                     ← Create this folder
    │       └── index-BIP8DvFD.js       ← Drag & drop from dist/assets/
    │
    ├── server/                         ← Create this folder (if same host)
    │   ├── index-new.js                ← Drag & drop from local server/
    │   ├── package.json
    │   ├── customers.js
    │   ├── db.js
    │   ├── middleware/                 ← Create & upload
    │   ├── data/                       ← Create (empty)
    │   └── outbox/                     ← Create (empty)
    │
    └── ... (existing hosting files)
```

---

## cPanel File Manager Structure

```
1. Login to cPanel
2. File Manager
3. Go to: public_html/

4. CREATE NEW FOLDER: examplified
5. UPLOAD TO examplified/:
   - index.html
   - assets folder with index-BIP8DvFD.js

6. CREATE NEW FOLDER: server (if same host)
7. UPLOAD TO server/:
   - All server files (see Backend Upload list above)
```

---

## Deployment Verification

After uploading, verify structure:

```
✓ Can access: https://smartbarexam.com/examplified/
✓ Can see:   Login page (frontend loads)
✓ Can access: https://smartbarexam.com/examplified/admin
✓ Can test:  Admin login with token
✓ Can access: https://smartbarexam.com/health (if backend on same host)
✓ Response:  {"ok":true}
```

---

## Important Notes

1. **dist/ folder** is complete - just upload it
2. **server/ folder** needs `npm install` after upload
3. **data/ folder** will be auto-created when needed
4. **outbox/ folder** for development emails
5. All paths must match exactly

---

## Quick Reference

| What | From | To | Size |
|------|------|-----|------|
| Frontend | dist/ | public_html/examplified/ | 533 KB |
| Backend | server/ | public_html/server/ | 27 KB |
| Total Upload | - | - | ~560 KB |

---

## Questions?

Check these files:
- `QUICK_DEPLOYMENT.md` - Step by step
- `FILES_TO_UPLOAD.md` - Detailed file list
- `DEPLOYMENT_GUIDE.md` - Full guide

You're ready! 🚀
