"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that scrolls to the top of the page
 * whenever the route changes. This ensures users always start
 * at the top when navigating between pages.
 * 
 * This component handles the specific layout structure used in this application:
 * - Admin and User layouts use a <main> element with overflow-y-auto
 * - The actual scroll container is the <main> element, not document.documentElement
 * - This component scrolls both window and the main element to ensure compatibility
 * 
 * Technical implementation:
 * - Uses useLocation hook to detect route changes
 * - useEffect with pathname dependency triggers on every navigation
 * - window.scrollTo(0, 0) for general compatibility
 * - mainElement.scrollTop = 0 for the actual scroll container
 * 
 * This is a simple and reliable solution that works with BrowserRouter
 * and handles the specific layout requirements of this application.
 */
export const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately when route changes
    // This handles both document-level scrolling and layout-specific scrolling
    window.scrollTo(0, 0);
    
    // Handle layout-specific scroll containers
    // Admin and User layouts use <main> element with overflow-y-auto
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
    
    // Additional scroll containers that might exist
    // This ensures compatibility with any future layout changes
    const scrollContainers = document.querySelectorAll('[data-scroll-container]');
    scrollContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.scrollTop = 0;
      }
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;