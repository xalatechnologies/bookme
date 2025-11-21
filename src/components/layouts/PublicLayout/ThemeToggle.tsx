"use client";

import React from "react";

interface ThemeToggleProps {
  readonly children?: never;
}

/**
 * ThemeToggle component - disabled (dark mode removed)
 * Dark mode will be re-implemented properly with a design system in the future
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = (): JSX.Element => {
  // Ensure dark class is never added to document
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    // Clear any theme preference from localStorage
    localStorage.removeItem('theme');
  }, []);

  // Return null - component is disabled
  return null;
};