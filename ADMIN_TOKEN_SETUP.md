# Backend Admin Access with Signed Token

## Your Admin Token

**Save this token securely** (in a `.env` file or password manager). This is your 30-day admin access token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI
```

**Expiration:** NEVER EXPIRES (Permanent Token)

## How to Use This Token

### Option 1: cURL (command line)

```bash
# Test the admin endpoint
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI" \
  http://localhost:4000/admin

# Fetch admin stats
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI" \
  http://localhost:4000/admin/stats
```

### Option 2: JavaScript/Fetch (frontend or Node)

```javascript
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI';

async function fetchAdminData() {
  const res = await fetch('http://localhost:4000/admin/stats', {
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
  });
  
  const data = await res.json();
  console.log(data);
}

fetchAdminData();
```

### Option 3: React Component (for AdminDashboard)

```tsx
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/admin/stats', {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {stats && (
        <div>
          <h1>Dashboard Stats</h1>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

## Backend Setup (Node.js with Express)

### 1. Install dependencies

```bash
npm install express
```

### 2. Start the server

```bash
# Use the new admin-enabled server:
node server/index-new.js
```

You should see:
```
✓ Backend server running on http://localhost:4000

Protected routes (require Bearer token):
  GET    /admin
  GET    /admin/stats
  POST   /admin/exams
  POST   /admin/codes

Public routes:
  GET    /health
  POST   /customer-access
```

### 3. Test protected routes

```bash
# This will succeed (with your token)
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzMDg1NjI1fQ.s4AYvoyXbDMWOuXuca0txTaQrwFQ6LmjlDCV-yB2NAI" http://localhost:4000/admin/stats

# This will fail (no token)
curl http://localhost:4000/admin/stats
# Response: { "error": "Authorization header required" }
```

## Generate a New Token (if this one expires)

```bash
node server/generate-token.js 30
```

This will output a fresh 30-day token.

## Security Notes

- **Keep the token private** — treat it like a password.
- **Rotate periodically** — regenerate every 30–90 days.
- **Use HTTPS in production** — never send tokens over plain HTTP.
- **Store securely** — use environment variables or a secure vault, not hardcoded in source.
- **Monitor access** — log all admin API calls and alert on failures.

## Next: Customer Login System

Once backend is working, we'll implement the customer code-based login:
1. You send a receipt email.
2. You generate a unique code: `POST /admin/codes` with customer email.
3. You share the code with the customer.
4. Customer uses the code to access exams: `POST /customer-access` with code.

Ready to test?
