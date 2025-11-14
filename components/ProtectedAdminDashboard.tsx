import React, { useState, useEffect } from 'react';
import { ShieldX, ShieldCheck, Loader2 } from 'lucide-react';
import AdminDashboard from './AdminDashboard'; // Assuming the actual dashboard UI is in a separate component
import { Exam } from '../types';

interface ProtectedAdminDashboardProps {
  onSaveExam: (newExam: Exam) => void;
  onBack: () => void;
  onBackToDashboard?: () => void;
}

type AuthStatus = 'PENDING' | 'AUTHENTICATED' | 'FAILED';

const ProtectedAdminDashboard: React.FC<ProtectedAdminDashboardProps> = ({ onSaveExam, onBack, onBackToDashboard }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('PENDING');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = sessionStorage.getItem('adminToken');

      if (!storedToken) {
        setAuthStatus('FAILED');
        return;
      }

      try {
        const response = await fetch('/admin', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          setToken(storedToken);
          setAuthStatus('AUTHENTICATED');
        } else {
          sessionStorage.removeItem('adminToken'); // Clean up invalid token
          setAuthStatus('FAILED');
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setAuthStatus('FAILED');
      }
    };

    verifyToken();
  }, []);

  if (authStatus === 'PENDING') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#2d3e50] text-white">
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <h2 className="text-2xl font-bold">Verifying Admin Access...</h2>
        <p className="text-gray-300">Please wait while we secure your session.</p>
      </div>
    );
  }

  if (authStatus === 'FAILED') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-red-900 text-white">
        <ShieldX className="w-24 h-24 mb-6" />
        <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
        <p className="text-xl text-red-200 mb-8">You do not have permission to view this page.</p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-200 text-gray-800 rounded font-bold text-lg shadow-lg hover:bg-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (authStatus === 'AUTHENTICATED' && token) {
    return (
      <div className="h-screen flex flex-col">
        <>
          <div className="bg-green-800 text-white p-2 text-center text-sm font-semibold flex items-center justify-center gap-2 flex-shrink-0">
              <ShieldCheck size={16} />
              <span>Admin session verified and secure.</span>
          </div>
          <AdminDashboard
              onSaveExam={onSaveExam}
              onBack={onBack}
              token={token}
              onBackToDashboard={onBackToDashboard}
          />
        </>
      </div>
    );
  }

  return null; // Should not be reached
};

export default ProtectedAdminDashboard;