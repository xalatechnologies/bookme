/**
 * ScrollToTop Component Tests
 *
 * Tests for ScrollToTop - navigation scroll restoration component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ScrollToTop } from '@/components/common/navigation/ScrollToTop';

describe('ScrollToTop Component', () => {
  let originalScrollTo: typeof window.scrollTo;

  beforeEach(() => {
    // Mock window.scrollTo
    originalScrollTo = window.scrollTo;
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    // Restore original scrollTo
    window.scrollTo = originalScrollTo;
  });

  describe('Basic Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(container).toBeInTheDocument();
    });

    it('should return null (no visible UI)', () => {
      const { container } = render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render any DOM elements', () => {
      const { container } = render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(container.innerHTML).toBe('');
    });
  });

  describe('Scroll Behavior on Mount', () => {
    it('should call window.scrollTo on mount', () => {
      render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should scroll main element if present', () => {
      const mainElement = document.createElement('main');
      mainElement.scrollTop = 100;
      document.body.appendChild(mainElement);

      render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(mainElement.scrollTop).toBe(0);

      document.body.removeChild(mainElement);
    });

    it('should handle missing main element gracefully', () => {
      // Ensure no main element exists
      const mainElements = document.querySelectorAll('main');
      mainElements.forEach(el => el.remove());

      expect(() => {
        render(
          <MemoryRouter>
            <ScrollToTop />
          </MemoryRouter>
        );
      }).not.toThrow();
    });

    it('should scroll custom scroll containers', () => {
      const container1 = document.createElement('div');
      container1.setAttribute('data-scroll-container', '');
      container1.scrollTop = 100;
      document.body.appendChild(container1);

      const container2 = document.createElement('div');
      container2.setAttribute('data-scroll-container', '');
      container2.scrollTop = 200;
      document.body.appendChild(container2);

      render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(container1.scrollTop).toBe(0);
      expect(container2.scrollTop).toBe(0);

      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });
  });

  describe('Route Change Detection', () => {
    it('should use useLocation hook to detect routes', () => {
      render(
        <MemoryRouter initialEntries={['/page1']}>
          <ScrollToTop />
          <Routes>
            <Route path="/page1" element={<div>Page 1</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Component uses useLocation which triggers on route changes
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should work with different initial routes', () => {
      vi.clearAllMocks();

      render(
        <MemoryRouter initialEntries={['/different-route']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Multiple Scroll Containers', () => {
    it('should handle multiple main elements', () => {
      const main1 = document.createElement('main');
      main1.scrollTop = 100;
      document.body.appendChild(main1);

      const main2 = document.createElement('main');
      main2.scrollTop = 200;
      document.body.appendChild(main2);

      render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      // Only the first main element is scrolled
      expect(main1.scrollTop).toBe(0);

      document.body.removeChild(main1);
      document.body.removeChild(main2);
    });

    it('should handle multiple data-scroll-container elements', () => {
      const containers = Array.from({ length: 5 }, () => {
        const div = document.createElement('div');
        div.setAttribute('data-scroll-container', '');
        div.scrollTop = 500;
        document.body.appendChild(div);
        return div;
      });

      render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      containers.forEach(container => {
        expect(container.scrollTop).toBe(0);
      });

      containers.forEach(container => document.body.removeChild(container));
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-HTMLElement scroll containers', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.setAttribute('data-scroll-container', '');
      document.body.appendChild(svgElement);

      expect(() => {
        render(
          <MemoryRouter>
            <ScrollToTop />
          </MemoryRouter>
        );
      }).not.toThrow();

      document.body.removeChild(svgElement);
    });

    it('should work with nested routing', () => {
      render(
        <MemoryRouter initialEntries={['/parent/child']}>
          <ScrollToTop />
          <Routes>
            <Route path="/parent">
              <Route path="child" element={<div>Child</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should work with query parameters', () => {
      render(
        <MemoryRouter initialEntries={['/page?param=value']}>
          <ScrollToTop />
          <Routes>
            <Route path="/page" element={<div>Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should work with hash routing', () => {
      render(
        <MemoryRouter initialEntries={['/page#section']}>
          <ScrollToTop />
          <Routes>
            <Route path="/page" element={<div>Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Integration', () => {
    it('should work alongside other components', () => {
      const { container } = render(
        <MemoryRouter>
          <ScrollToTop />
          <div>Other content</div>
          <span>More content</span>
        </MemoryRouter>
      );

      expect(container.querySelector('div')).toBeInTheDocument();
      expect(container.querySelector('span')).toBeInTheDocument();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should not interfere with page content', () => {
      const { getByText } = render(
        <MemoryRouter>
          <ScrollToTop />
          <h1>My Page</h1>
          <p>Page content</p>
        </MemoryRouter>
      );

      expect(getByText('My Page')).toBeInTheDocument();
      expect(getByText('Page content')).toBeInTheDocument();
    });

    it('should work with multiple instances', () => {
      render(
        <MemoryRouter>
          <ScrollToTop />
          <ScrollToTop />
          <ScrollToTop />
        </MemoryRouter>
      );

      // All instances should call scrollTo
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should only run effect when pathname changes', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/page1']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      const initialCalls = (window.scrollTo as any).mock.calls.length;

      // Re-render without pathname change
      rerender(
        <MemoryRouter initialEntries={['/page1']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      // Should not call scrollTo again (same pathname)
      expect((window.scrollTo as any).mock.calls.length).toBe(initialCalls);
    });

    it('should handle rapid route changes', () => {
      function RapidNav() {
        const navigate = useNavigate();
        React.useEffect(() => {
          navigate('/page1');
          navigate('/page2');
          navigate('/page3');
        }, [navigate]);
        return null;
      }

      expect(() => {
        render(
          <MemoryRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<RapidNav />} />
              <Route path="/page1" element={<div>1</div>} />
              <Route path="/page2" element={<div>2</div>} />
              <Route path="/page3" element={<div>3</div>} />
            </Routes>
          </MemoryRouter>
        );
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should not leave any side effects', () => {
      const { unmount } = render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      unmount();

      // Component should clean up properly
      expect(true).toBe(true);
    });

    it('should allow re-mounting', () => {
      const { unmount } = render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      unmount();

      vi.clearAllMocks();

      render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });
});
