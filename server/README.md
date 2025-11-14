Signed-challenge auth server (demo)

Overview
- This small server demonstrates a signed-challenge auth flow and an email-based recovery mechanism.
- It is *demo-quality* (in-memory stores, file-based mail outbox). Do not use as-is in production.

Quick start (local)
1. Ensure you have Node.js installed (v14+ recommended).
2. Generate a key pair for your client (OpenSSL example):
   openssl genpkey -algorithm RSA -out client.key -pkeyopt rsa_keygen_bits:2048
   openssl rsa -pubout -in client.key -out client.pub.pem

3. Start the server:
   node server/index.js

4. Register your client (one-time):
   POST http://localhost:4000/register
   JSON body: { "clientId": "gavin-client", "publicKeyPem": "<contents of client.pub.pem>", "email": "you@example.com" }
   The server will write a verification file into server/outbox/ (check it and open the verify link with your browser or curl).

5. Authenticate (after verifying email):
   node server/client/auth-client.js http://localhost:4000 gavin-client ./client.key
   You should receive a token and a protected /admin response.

Recovery flow (email):
- If you lose your private key, POST to /request-recovery with { "email": "you@example.com" }.
- Check server/outbox/ for the recovery link and POST a new public key to /recover/:token with JSON { "newPublicKeyPem": "<PEM>" }.

Notes & next steps
- Replace in-memory stores with a database.
- Replace the file-based mailer with an SMTP or transactional email provider.
- Harden token secrets with environment variables and rotate them.
- Add rate-limiting and logging for auth endpoints.
