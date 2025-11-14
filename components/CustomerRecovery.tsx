import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

const CustomerRecovery: React.FC<Props> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/customer-recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
      if (!res.ok) {
        setStatus(data?.error || text || 'Failed to send recovery');
      } else {
        setStatus('Recovery email sent. Check the outbox (server/outbox) during local testing.');
      }
    } catch (err: any) {
      setStatus(err.message || 'Failed to request recovery');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recover Token</h2>
        <p className="text-sm text-gray-600 mb-4">Enter the email you used when you were registered. We'll send a recovery link.</p>
        <form onSubmit={handleRequest}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full border rounded p-3 mb-3" />
          {status && <div className="text-sm text-gray-700 mb-3">{status}</div>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading || !email.trim()} className="flex-1 bg-blue-600 text-white py-2 rounded">{loading ? 'Sending...' : 'Send Recovery Email'}</button>
            <button type="button" onClick={onClose} className="flex-1 border rounded py-2">Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerRecovery;
