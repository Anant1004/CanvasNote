"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          toast.error('User already exists. Please login or use different credentials.');
        } else {
          toast.error(data.error || 'Failed to register');
        }
        return;
      }

      login(data.token, data.user);
      toast.success('Successfully registered and logged in!');
    } catch (err: any) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md p-6 ${isDarkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}>
      <h2 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="text-base font-bold mb-1 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={`w-full focus-visible:ring-0 focus-visible:ring-offset-0 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-base font-bold mb-1 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full focus-visible:ring-0 focus-visible:ring-offset-0 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="text-base font-bold mb-1 flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full relative"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register'
          )}
        </Button>
      </form>
    </Card>
  );
} 