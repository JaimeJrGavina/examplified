# Vercel Deployment Notes

## Current Limitation: File-Based Storage

The current implementation uses JSON files for data storage (`customers.json`, `exams.json`). While this works perfectly for **local development and traditional server deployments**, Vercel's serverless architecture has a **filesystem limitation**:

- Vercel serverless functions have **ephemeral filesystems**
- Files written during a request won't persist after the function ends
- This means new customer tokens created in the admin dashboard won't be saved permanently

## Pre-Loaded Student Tokens

To work around this limitation temporarily, the following student tokens are **pre-loaded** in the system:

### Available Student Tokens:
```
Email: seolearnerph@gmail.com
Token: cust_b7dd83a83b398a9fff2b53d2

Email: test@gmail.com
Token: cust_aa3a19d41908bfb2c51000bb
```

Use these tokens to test the student login functionality.

## How to Fix This Permanently

### Option 1: Use Vercel KV (Recommended for Vercel)
Vercel's KV provides a Redis-like data store:
1. Enable Vercel KV in your Vercel project
2. Install: `npm install @vercel/kv`
3. Replace file-based storage with KV operations
4. Estimated implementation time: 2-3 hours

### Option 2: Use a Database Service
Options include:
- **Supabase** (PostgreSQL) - Free tier available
- **MongoDB** (NoSQL) - Atlas free tier available
- **Firebase** (Realtime Database)
- **PlanetScale** (MySQL)

Each requires:
1. Creating an account and database
2. Modifying `api/customers.js` and `api/db.js` to use the database
3. Setting connection strings in Vercel environment variables
4. Estimated implementation time: 3-4 hours

### Option 3: Deploy Backend Separately
Use a traditional Node.js host for the backend:
- **Railway** (supports Node.js, easy deployment)
- **Render** (free tier available)
- **Heroku** (alternative)
- **DigitalOcean** (App Platform)

Update frontend to point to backend URL instead of `/api/`.

## Current Status

✅ Frontend deploys and works
✅ Admin authentication works
✅ Exam viewing works (pre-loaded exams)
✅ Student login works (with pre-loaded tokens)

⚠️ Creating new customer tokens doesn't persist
⚠️ Creating new exams doesn't persist (admin-only for now)

## Next Steps

1. **For immediate testing**: Use the pre-loaded tokens above
2. **For production**: Implement one of the permanent solutions above

## Testing the Current System

1. Visit: https://smartbarexam.com
2. Student Login: Click "Admin Login" → enter admin token
3. Create a customer (won't persist, but you can see the UI works)
4. Or use pre-loaded student token to test student flow

---

For questions or implementation help, refer to the backend documentation in `/api/README.md`.
