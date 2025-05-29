"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeToggleButton({
  className,
}: { 
  className?: string; 
}) {
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <Button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={cn(
        'rounded-full w-12 h-12 p-0',
        isDarkMode
          ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
          : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50',
        className
      )}
      variant="outline"
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
} 