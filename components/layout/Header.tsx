"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out!');
  };

  return (
    <div className={`fixed top-4 right-4 flex items-center gap-2 ${isDarkMode?"bg-white/20 text-white":"bg-gray-200"} backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm z-50`}>
      <span className="text-lg font-bold">
        {user.username}
      </span>
      <button
        onClick={handleLogout}
        className="p-1 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
        title="Logout"
      >
        <LogOut className="h-4 w-4 text-red-500" />
      </button>
    </div>
  );
} 