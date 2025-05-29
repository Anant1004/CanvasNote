"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedTheme = localStorage.getItem('brainstorming-canvas-theme');
      if (savedTheme) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
  }, [isClient]);

  // Save theme to localStorage
  useEffect(() => {
    if (!isClient) return;

    try {
      localStorage.setItem('brainstorming-canvas-theme', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [isDarkMode, isClient]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 