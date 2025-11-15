import React, { useState } from 'react';
import { Shield, LogIn, ArrowLeft, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
  onBackToStudentLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBackToStudentLogin }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token.trim()) {
      setError('Admin token cannot be empty.');
      return;
    }
    setLoading(true);

    try {
      const trimmedToken = token.trim();
      
      // Accept the admin token if it looks valid (any reasonable length token)
      // In production, validate against backend
      if (trimmedToken.length < 10) {
        throw new Error('Token must be at least 10 characters');
      }

      // For now, accept any valid-looking admin token
      // Later, we can add backend validation
      sessionStorage.setItem('adminToken', trimmedToken);
      console.log('✓ Admin token accepted');
      onLogin(trimmedToken);

    } catch (err: any) {
      setError(err.message);
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 text-white rounded-xl shadow-2xl p-8 border-t-8 border-indigo-500">
        <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-2">Admin Portal</h2>
        <p className="text-center text-gray-400 mb-8">Secure sign-in for instructors.</p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your admin token"
              className="w-full pl-4 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-4 flex items-center gap-2"><ShieldAlert size={18} /><span>{error}</span></div>}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center gap-2 transition-colors">
            {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Verifying...</span></> : <><LogIn size={18} /><span>Sign In</span></>}
          </button>
        </form>

        <div className="text-center mt-6">
          <button onClick={onBackToStudentLogin} className="text-sm text-gray-400 hover:underline flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft size={14} /> Back to Student Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;