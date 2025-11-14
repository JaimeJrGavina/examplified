# Customer Access Management - Complete Guide

## Problem Solved ✅

The "create customer access management" was not working because:
1. **Backend server was not running** on port 4000
2. **Admin authentication token was missing or invalid**

Both issues are now fixed!

---

## Quick Start: Create Student Access

### Step 1: Verify Both Servers Are Running

**Frontend Server (Port 3000):**
```
✓ Should be running on http://localhost:3000/
```

**Backend Server (Port 4000):**
```
✓ Should be running on http://localhost:4000/
```

To check, open browser and visit:
- `http://localhost:3000/` - Frontend should load
- `http://localhost:4000/health` - Should return `{"ok":true}`

### Step 2: Get Your Admin Token

Your current admin token (NEVER EXPIRES):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI
```

**Expires:** NEVER - This is a permanent token

### Step 3: Login as Admin

1. Go to `http://localhost:3000/admin`
2. You'll see the **Admin Login** screen
3. Paste your admin token in the input field
4. Click **Login**

### Step 4: Create Student Access

Once logged in as admin, you'll see the **Admin Portal**:

1. **Exam Configuration** - Create/edit exams
2. **Customer Access Management** - This is what you need!

In the **Customer Access Management** section:

1. **Enter student email**: `student@example.com`
2. Click **Create Customer**
3. A welcome email will be sent to the student with their access token
4. Email contents saved in: `server/outbox/`

### Step 5: Share Token with Student

The system creates a unique token for each student. Example:
```
cust_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p
```

You can:
- Share via email (automatic)
- Copy from the customer list on admin dashboard
- Regenerate anytime with "Regenerate" button

### Step 6: Student Logs In

Student goes to `http://localhost:3000/` and:
1. Enters their email
2. Enters the token you provided
3. Gets access to all exams

---

## Understanding the Flow

```
┌─────────────────────────────────────────────────┐
│ Admin at http://localhost:3000/admin             │
│ (with valid admin token)                        │
└───────────────┬─────────────────────────────────┘
                │
                │ Creates Customer
                ▼
┌─────────────────────────────────────────────────┐
│ Backend API: POST /admin/customers              │
│ - Creates new customer record                   │
│ - Generates unique token                        │
│ - Queues welcome email                          │
└───────────────┬─────────────────────────────────┘
                │
                │ Welcome email with token
                ▼
┌─────────────────────────────────────────────────┐
│ Student receives email with:                    │
│ - Their email                                   │
│ - Their unique access token                     │
└───────────────┬─────────────────────────────────┘
                │
                │ Student logs in at http://localhost:3000/
                ▼
┌─────────────────────────────────────────────────┐
│ Student Dashboard                               │
│ - See all available exams                       │
│ - Start exams                                   │
│ - View results                                  │
└─────────────────────────────────────────────────┘
```

---

## API Endpoints Reference

### Protected Routes (Require Admin Token)

**Create Customer:**
```bash
POST /admin/customers
Header: Authorization: Bearer <ADMIN_TOKEN>
Body: { "email": "student@example.com" }
```

**Get All Customers:**
```bash
GET /admin/customers
Header: Authorization: Bearer <ADMIN_TOKEN>
```

**Delete Customer:**
```bash
DELETE /admin/customers/:id
Header: Authorization: Bearer <ADMIN_TOKEN>
```

**Regenerate Student Token:**
```bash
POST /admin/customers/:id/regenerate-token
Header: Authorization: Bearer <ADMIN_TOKEN>
```

### Public Routes (No Auth Needed)

**Student Login:**
```bash
POST /customer-login
Body: { "token": "cust_xxxxx" }
```

**Student Request Recovery:**
```bash
POST /customer-recover
Body: { "email": "student@example.com" }
```

---

## Troubleshooting

### Issue: "Admin token missing" error

**Solution:** 
1. Check your browser console (F12)
2. The token might not be stored in session storage
3. Try logging in again to `/admin`
4. Use the token from `ADMIN_TOKEN_SETUP.md`

### Issue: "Backend not available" or connection refused

**Solution:**
1. Start the backend server:
   ```bash
   cd "d:\Working Apps\Working examplified version 3\server"
   node index-new.js
   ```
2. Verify it says: `✓ Backend server running on http://localhost:4000`
3. Try the health check: `curl http://localhost:4000/health`

### Issue: "Failed to create customer"

**Possible causes:**
- Backend is down (see above)
- Email already exists - try with a different email
- Admin token is invalid or expired
- Check server logs in the terminal

### Issue: Email not arriving

**Note:** Emails are saved to: `server/outbox/`
- File system storage (no actual email sent in dev mode)
- Check the outbox folder to see the email contents

### Issue: Need a new admin token

**Solution:**
```bash
cd "d:\Working Apps\Working examplified version 3\server"
node generate-token.js 30
```

This generates a fresh 30-day token. Copy it and use it to log in again.

---

## Next Steps

### For Admins:
- ✅ Create exams in Admin Portal
- ✅ Create student access tokens
- ✅ Monitor students and submissions
- ✅ Regenerate tokens if needed

### For Students:
- ✅ Receive email with access token
- ✅ Login with token
- ✅ Take exams
- ✅ View results

---

## Key Files

- **Frontend:** `http://localhost:3000/`
- **Backend:** `http://localhost:4000/`
- **Admin Token:** `ADMIN_TOKEN_SETUP.md`
- **Backend Server:** `server/index-new.js`
- **Customers Database:** `server/data/customers.json`
- **Emails (dev):** `server/outbox/`

---

## Support

If something doesn't work:
1. Check that both servers are running
2. Verify your admin token is valid
3. Check the server terminal for error logs
4. Clear browser cache and try again
5. Regenerate a fresh admin token

Happy testing! 🚀
