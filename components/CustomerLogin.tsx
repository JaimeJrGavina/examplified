import React, { useState } from 'react';
import { KeyRound, LogIn, ShieldAlert } from 'lucide-react';

interface CustomerLoginProps {
  onLogin: (token: string) => void;
  openRecovery: () => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLogin, openRecovery }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token.trim()) {
      setError('Login token cannot be empty.');
      return;
    }
    setLoading(true);

    try {
      // First, try to validate via API (if backend is available)
      try {
        const res = await fetch('/customer-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim() }),
        });

        if (res.ok) {
          sessionStorage.setItem('customerToken', token.trim());
          onLogin(token.trim());
          return;
        }
      } catch (apiErr) {
        // API not available, fall through to local validation
        console.log('API not available, using local token validation');
      }

      // Fallback: Local token validation (for tokens generated via local-token-generator.html)
      const trimmedToken = token.trim();
      
      // Check if token has valid format (starts with 'cust_')
      if (!trimmedToken.startsWith('cust_')) {
        throw new Error('Invalid token format. Token should start with "cust_"');
      }

      // Accept any token in valid format (they're stored in browser localStorage by the generator)
      // In production, you would validate against a database
      sessionStorage.setItem('customerToken', trimmedToken);
      onLogin(trimmedToken);

    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d3e50] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border-t-8 border-blue-500">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Student Access</h2>
        <p className="text-center text-gray-500 mb-8">Enter your exam token to begin.</p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your login token"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center gap-2"><ShieldAlert size={18} /><span>{error}</span></div>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2 transition-colors">
            {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Verifying...</span></> : <><LogIn size={18} /><span>Login</span></>}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="#" onClick={(e) => { e.preventDefault(); openRecovery(); }} className="text-sm text-blue-600 hover:underline">Forgot or lost your token?</a>
        </div>

        <div className="text-center mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Are you an administrator?</p>
          <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/admin'); window.location.reload(); }} className="text-sm text-orange-600 hover:underline font-semibold">Admin Login</a>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;