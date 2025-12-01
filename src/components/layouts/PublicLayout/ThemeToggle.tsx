"use client";

import React from "react";

interface ThemeToggleProps {
  readonly children?: never;
}

/**
 * ThemeToggle component - disabled for now
 * Dark mode code is preserved for future phases, but currently only light mode is active
 * When ready to implement dark mode with design system, this component will be re-enabled
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = (): JSX.Element | null => {
  // Ensure dark class is never added to document (light mode only for now)
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    // Clear any theme preference from localStorage
    localStorage.removeItem('theme');
  }, []);

  // Return null - component is disabled for now
  return null;
};