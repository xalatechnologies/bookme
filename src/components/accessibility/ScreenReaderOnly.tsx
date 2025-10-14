"use client";

import React from "react";

/**
 * Props interface for ScreenReaderOnly component
 */
interface ScreenReaderOnlyProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

/**
 * Screen reader only component
 * 
 * Renders content that is only visible to screen readers and other assistive technologies.
 * Useful for providing additional context or instructions that sighted users don't need.
 */
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <span 
      className={`sr-only ${className}`}
      aria-live="polite"
    >
      {children}
    </span>
  );
};

/**
 * Live region component for dynamic content announcements
 * 
 * Announces changes to screen readers when content updates dynamically.
 */
export const LiveRegion: React.FC<{
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly politeness?: 'polite' | 'assertive' | 'off';
}> = ({ 
  children, 
  className = "",
  politeness = 'polite'
}) => {
  return (
    <div 
      className={`live-region ${className}`}
      aria-live={politeness}
      aria-atomic="true"
    >
      {children}
    </div>
  );
};

/**
 * Skip link component for keyboard navigation
 * 
 * Provides a way for keyboard users to skip to main content.
 */
export const SkipLink: React.FC<{
  readonly href: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}> = ({ 
  href, 
  children, 
  className = "" 
}) => {
  return (
    <a
      href={href}
      className={`skip-to-main ${className}`}
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.focus();
          target.scrollIntoView();
        }
      }}
    >
      {children}
    </a>
  );
};

