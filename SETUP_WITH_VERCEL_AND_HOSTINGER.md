# Setup Guide: Vercel Frontend + Hostinger Backend

Your current setup:
- **Frontend**: `smartbarexam.com` on Vercel (React app)
- **Backend**: API routes on Vercel (not working well)
- **Shared Hosting**: Hostinger (PHP support)

**New approach**: Keep frontend on Vercel, use Hostinger PHP for token generation.

---

## Option A: Best Solution - Use API Route on Vercel

Since you already have smartbarexam.com pointing to Vercel, let's fix the Vercel API instead of switching to Hostinger.

### The Real Problem with Vercel

Your Express.js API on Vercel is failing because:
1. Vercel serverless functions have strict request timeouts (10-30 seconds)
2. The Vercel KV initialization is taking too long
3. The rewrite rules aren't working correctly

### Solution: Simplify the API

Let me fix the `/api/index.js` to work reliably on Vercel:

```javascript
// Simple, fast API that doesn't depend on heavy imports
import express from 'express';
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// SIMPLE health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Export for Vercel
export default app;
```

---

## Option B: Use Hostinger + Custom Domain

### Setup Custom Domain on Hostinger

1. **In Hostinger hPanel:**
   - Go to "Domains" section
   - Add a subdomain: `api.smartbarexam.com` pointing to Hostinger

2. **Update Vercel to use Hostinger API:**
   - Edit `App.tsx` or create `.env.production`:
   ```
   VITE_API_URL=https://api.smartbarexam.com
   ```

3. **Update frontend API calls:**
   ```typescript
   const API_BASE = import.meta.env.VITE_API_URL || '/api';
   
   const createCustomer = async (email: string) => {
     const res = await fetch(`${API_BASE}/admin/customers`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
       body: JSON.stringify({ email })
     });
     return res.json();
   };
   ```

---

## Option C: Simplest - Just Use PHP Token Generator on Hostinger

If you don't need a complex backend:

1. **Keep frontend on Vercel** (`smartbarexam.com`)
2. **Use PHP token generator on Hostinger** (no custom domain needed)
3. **Store tokens** in Hostinger's `/data/customers.json`
4. **Update frontend** to accept manually-created tokens

### How it works:
- Admin generates tokens via PHP (no public interface needed)
- Tokens stored in simple JSON file
- Frontend login accepts any valid token format

### Update `App.tsx` for manual token flow:

```typescript
const [customerToken, setCustomerToken] = React.useState('');

const handleCustomerLogin = async () => {
  // Token manually provided by admin
  if (customerToken.startsWith('cust_')) {
    // Valid token format
    sessionStorage.setItem('customerToken', customerToken);
    // Redirect to exams
  }
};

return (
  <input 
    placeholder="Enter your student token" 
    value={customerToken}
    onChange={(e) => setCustomerToken(e.target.value)}
  />
);
```

---

## RECOMMENDED: Hybrid Approach

**Keep everything simple:**

1. ✅ Frontend stays on Vercel at `smartbarexam.com`
2. ✅ Admin generates tokens via `generate-token.php` (local file, no API)
3. ✅ Tokens saved to `data/customers.json` (persistent)
4. ✅ Admin manually gives tokens to students
5. ✅ Students login with token on frontend

### Why this works:
- No complex backend needed
- No Vercel serverless issues
- No API routing problems
- Just simple token validation

---

## My Recommendation

**Don't try to fix Vercel's serverless API - it's too complex for this use case.**

Instead:

### For Testing/Demo:
Use hardcoded tokens in your frontend:
```typescript
const DEMO_TOKENS = ['cust_test123456789012', 'cust_demo987654321098'];
const isValidToken = (token: string) => DEMO_TOKENS.includes(token);
```

### For Production:
1. Use the PHP token generator on Hostinger (via download/local use)
2. Store tokens in a simple JSON file
3. Admin manually creates tokens
4. Students use tokens to login

---

## Next Steps

**Which approach do you want?**

1. **Fix Vercel API** (make it actually work)
2. **Use Hostinger PHP generator** (simpler, more reliable)
3. **Hardcoded demo tokens** (fastest for testing)
4. **Custom domain for Hostinger** (most professional)

Let me know and I'll implement it!
