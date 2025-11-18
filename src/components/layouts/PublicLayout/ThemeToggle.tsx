"use client";

import React, { useState, useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  readonly children?: never;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = (): JSX.Element => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Toggle 
      pressed={theme === 'dark'}
      onPressedChange={toggleTheme}
      className="border rounded-md px-3 py-1"
    >
      {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Toggle>
  );
};