# Hostinger Token Generation Setup

Since your Hostinger shared hosting doesn't support Node.js, use this PHP-based token generator instead. It's much simpler and works on any standard web hosting!

## Quick Setup (5 minutes)

### Step 1: Upload Files to Hostinger

1. Open **Hostinger hPanel** → **File Manager**
2. Navigate to `public_html` folder
3. Upload these two files:
   - `generate-token.php` - Backend that creates tokens
   - `token-admin.html` - Frontend admin interface

### Step 2: Create Data Directory

1. In File Manager, right-click in `public_html`
2. Create a new folder named `data`
3. Set permissions: **Right-click** → **Permissions** → Set to **755**

### Step 3: Set Admin Password

1. Open `generate-token.php` in File Manager (right-click → Edit)
2. Find this line (top of file):
   ```php
   define('ADMIN_PASSWORD', 'your-secret-key-change-this');
   ```
3. Replace `'your-secret-key-change-this'` with a strong password
   - Example: `'ExamToken2024Secure!@#'`
4. Save the file

### Step 4: Test It

1. Visit: `https://smartbarexam.com/token-admin.html`
2. Enter your admin password
3. Enter a student email: `student@example.com`
4. Click "Generate Token"
5. Copy the token and test it

## How It Works

### Admin Creates Token
```
https://smartbarexam.com/token-admin.html
    ↓
Enter admin password + student email
    ↓
Click "Generate Token"
    ↓
Token displayed on screen + saved to data/customers.json
```

### Student Uses Token
```
https://smartbarexam.com/
    ↓
Login page
    ↓
Paste token
    ↓
Access exams
```

## Features

✅ **No Database Needed** - Uses JSON file storage  
✅ **Secure** - Protected with admin password  
✅ **Copy-Paste Friendly** - Easy token sharing  
✅ **Works Anywhere** - Standard PHP (all hostings support it)  
✅ **Persistent** - Tokens saved permanently  

## Data Storage

Tokens are saved in: `/public_html/data/customers.json`

Example file contents:
```json
{
  "customers": [
    {
      "id": "cust-1731685400",
      "email": "student1@example.com",
      "token": "cust_a1b2c3d4e5f6g7h8i9j0",
      "status": "active",
      "createdAt": "2024-11-15T10:30:00+00:00",
      "lastLogin": null
    },
    {
      "id": "cust-1731685500",
      "email": "student2@example.com",
      "token": "cust_k1l2m3n4o5p6q7r8s9t0",
      "status": "active",
      "createdAt": "2024-11-15T10:35:00+00:00",
      "lastLogin": null
    }
  ]
}
```

## Bulk Generate Tokens (Command Line)

If you need to generate many tokens at once, use this CLI script:

### Option A: Using Node.js (if available on hosting)
```bash
node api/create-customer.js student1@example.com
node api/create-customer.js student2@example.com
node api/create-customer.js student3@example.com
```

### Option B: Using PHP CLI (most hosting supports this)
```bash
php generate-token.php
```

## Troubleshooting

### "Failed to save customer" Error
**Cause:** `data/` folder doesn't have write permissions

**Fix:**
1. In File Manager, right-click `data` folder
2. Click "Permissions"
3. Set to **755** (read/write/execute)
4. Try again

### Token Not Appearing
**Cause:** Permissions issue or wrong folder

**Fix:**
1. Check `data/customers.json` exists
2. Check it has content (not empty)
3. Verify permissions are 644 for the file

### "Invalid admin_key" Error
**Cause:** Wrong password entered

**Fix:**
1. Check the password you set in `generate-token.php`
2. Make sure there are no typos
3. Try again

## Integration with Your App

### Update `App.tsx` to Use Hostinger Tokens

Make sure your login page reads from the same `data/customers.json`:

```tsx
const loginCustomer = async (token: string) => {
  // This token comes from the Hostinger generation
  const res = await fetch('/api/customer-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  if (res.ok) {
    const data = await res.json();
    // Login successful
    sessionStorage.setItem('customerToken', token);
    return data.customer;
  }
};
```

## Next Steps

1. ✅ Upload `generate-token.php` and `token-admin.html`
2. ✅ Create `/data` folder
3. ✅ Change admin password in `generate-token.php`
4. ✅ Visit `token-admin.html` and generate a test token
5. ✅ Test login with the generated token

## Security Notes

- **Change the default password!** The file ships with a placeholder
- **Use HTTPS** - Always access via `https://smartbarexam.com`
- **Limit access** - Consider password protecting `token-admin.html` in Hostinger
- **Backup tokens** - Download `data/customers.json` regularly
- **Monitor access** - Check PHP error logs if something fails

## Example Usage Flow

```
ADMIN:
1. Visit https://smartbarexam.com/token-admin.html
2. Enter admin password
3. Enter: student@school.com
4. Get token: cust_a1b2c3d4e5f6g7h8i9j0
5. Email token to student

STUDENT:
1. Visit https://smartbarexam.com
2. Click "Login"
3. Paste token: cust_a1b2c3d4e5f6g7h8i9j0
4. ✓ Logged in! Can take exams
```

---

**Questions?** Check the main `README.md` or `QUICK_START.md`
