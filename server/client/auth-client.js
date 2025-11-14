// Simple Node client that performs the signed-challenge flow.
// Usage: node auth-client.js <serverUrl> <clientId> <path-to-private-key-pem>

const fetch = (global.fetch) ? global.fetch : require('node-fetch'); // use built-in fetch in Node18+, otherwise node-fetch
const fs = require('fs');
const crypto = require('crypto');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node auth-client.js <serverUrl> <clientId> <path-to-private-key-pem>');
    process.exit(2);
  }
  const [serverUrl, clientId, keyPath] = args;
  const priv = fs.readFileSync(keyPath, 'utf8');

  const challengeRes = await fetch(`${serverUrl}/challenge/${clientId}`);
  if (!challengeRes.ok) {
    console.error('Failed to get challenge', await challengeRes.text());
    process.exit(2);
  }
  const { nonce } = await challengeRes.json();
  const signer = crypto.createSign('SHA256');
  signer.update(nonce);
  signer.end();
  const signature = signer.sign(priv).toString('base64');

  const authRes = await fetch(`${serverUrl}/auth/${clientId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature }),
  });
  if (!authRes.ok) {
    console.error('Auth failed', await authRes.text());
    process.exit(2);
  }
  const { token } = await authRes.json();
  console.log('Received token:', token);

  // call protected endpoint
  const adminRes = await fetch(`${serverUrl}/admin`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('Admin response status:', adminRes.status);
  console.log(await adminRes.json());
}

main().catch(err => { console.error(err); process.exit(2); });
