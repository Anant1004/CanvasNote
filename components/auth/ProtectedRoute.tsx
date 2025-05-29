"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);
  const { isDarkMode } = useTheme();

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="w-full max-w-md space-y-8">
          {showLogin ? (
            <>
              <LoginForm />
              <p className={`text-center mt-4 ${isDarkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                Don't have an account?{' '}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Register
                </button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm />
              <p className={`text-center mt-4 ${isDarkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                Already have an account?{' '}
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 