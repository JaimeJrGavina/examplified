import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

interface CustomerLoginProps {
  onLogin: (email: string) => void;
  openRecovery: () => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);

    try {
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }
      if (password.length < 4) {
        throw new Error('Password must be at least 4 characters');
      }

      // Store credentials and login
      sessionStorage.setItem('customerEmail', email);
      sessionStorage.setItem('customerPassword', password);
      console.log('✓ Login successful:', email);
      onLogin(email);

    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d3e50] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border-t-8 border-blue-500">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Student Access</h2>
        <p className="text-center text-gray-500 mb-8">Login with your email and password.</p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="relative mb-6">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2 transition-colors">
            {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Logging in...</> : <><LogIn size={18} />Login</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;