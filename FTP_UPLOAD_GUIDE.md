# FTP Upload Guide for Backend Files

Since Node.js isn't installed on your Hostinger account, you have two options:

## Option 1: Contact Hostinger Support (RECOMMENDED)
**Ask them:** "Can you install Node.js on my account? I need it for a Node.js application."

Most Hostinger accounts support Node.js by default. They can enable it in seconds.

**Once Node.js is installed, come back and run:**
```bash
cd examplified-backend
npm install
npm install -g pm2
pm2 start index-new.js --name "examplified-api"
pm2 startup
pm2 save
```

---

## Option 2: Upload Files via FTP (Do This First)

Even without Node.js installed yet, upload your backend files now so they're ready.

### Step 1: Download FileZilla (Free FTP Client)

Download from: https://filezilla-project.org/

### Step 2: Connect to Your Server

1. Open **FileZilla**
2. Go to: **File** → **Site Manager**
3. Click **New site**
4. Fill in:
   - **Protocol:** SFTP (SSH File Transfer Protocol)
   - **Host:** `145.79.25.49`
   - **Port:** `65002`
   - **Username:** `u365106728`
   - **Password:** (Your SSH password)

5. Click **Connect**

### Step 3: Navigate to examplified-backend Folder

In the right panel (Remote Site):
- You should see your home directory
- Double-click `examplified-backend` folder to enter it

### Step 4: Upload Backend Files

From your computer (left panel):
- Navigate to: `d:\Working Apps\Working examplified version 3\server\`

**Upload these files to `examplified-backend` folder:**
- `index-new.js`
- `package.json`
- `customers.js`
- `db.js`
- `mailer-esm.js`
- `generate-token.js`
- `create-customer.js`
- `store.js`

**Upload these folders:**
- `middleware/` (right-click → upload folder)
- `client/` (right-click → upload folder)

### Step 5: Verify Upload in SSH

Back in your SSH terminal, type:
```bash
ls -la examplified-backend/
```

You should see:
```
-rw-r--r-- index-new.js
-rw-r--r-- package.json
-rw-r--r-- customers.js
...
drwxr-xr-x middleware
drwxr-xr-x client
drwxr-xr-x data
drwxr-xr-x outbox
```

---

## Your Backend Files Checklist

```
✓ examplified-backend/
  ├─ index-new.js
  ├─ package.json
  ├─ customers.js
  ├─ db.js
  ├─ mailer-esm.js
  ├─ generate-token.js
  ├─ create-customer.js
  ├─ store.js
  ├─ middleware/
  │  └─ adminAuth.js
  ├─ client/
  │  └─ auth-client.js
  ├─ data/          (empty, for storing data)
  └─ outbox/        (empty, for emails)
```

---

## Next Steps

1. **Contact Hostinger Support** → Ask for Node.js installation
2. **Download FileZilla** → Upload backend files via SFTP
3. **Once Node.js is installed**, run `npm install` in your SSH terminal
4. **Start backend with PM2:**
   ```bash
   pm2 start index-new.js --name "examplified-api"
   pm2 startup
   pm2 save
   ```

5. **Test:** Visit `https://smartbarexam.com:3000/health`

---

## Your SSH Credentials (Saved for Reference)

```
Host: 145.79.25.49
Port: 65002
Username: u365106728
Password: (Your password)
```

Use these in FileZilla too!
