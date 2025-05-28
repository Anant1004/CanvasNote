"use client";

import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out!');
  };

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm z-50">
      <span className="text-sm text-muted-foreground">
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