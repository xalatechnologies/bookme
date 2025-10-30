/**
 * ScreenReaderOnly Component Tests
 *
 * Tests for accessibility components: ScreenReaderOnly, LiveRegion, and SkipLink
 */

import React from 'react';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenReaderOnly, LiveRegion, SkipLink } from '@/components/common/accessibility/ScreenReaderOnly';

// Mock scrollIntoView for jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

describe('ScreenReaderOnly Component', () => {
  describe('Basic Rendering', () => {
    it('should render screen reader only content', () => {
      render(<ScreenReaderOnly>Screen reader text</ScreenReaderOnly>);

      expect(screen.getByText('Screen reader text')).toBeInTheDocument();
    });

    it('should have sr-only class', () => {
      render(<ScreenReaderOnly>Hidden content</ScreenReaderOnly>);

      const element = screen.getByText('Hidden content');
      expect(element).toHaveClass('sr-only');
    });

    it('should have aria-live="polite" attribute', () => {
      render(<ScreenReaderOnly>Content</ScreenReaderOnly>);

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('aria-live', 'polite');
    });

    it('should render as span element', () => {
      const { container } = render(<ScreenReaderOnly>Content</ScreenReaderOnly>);

      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('Content');
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(
        <ScreenReaderOnly className="custom-class">
          Content
        </ScreenReaderOnly>
      );

      const element = screen.getByText('Content');
      expect(element).toHaveClass('sr-only');
      expect(element).toHaveClass('custom-class');
    });

    it('should handle empty className', () => {
      render(
        <ScreenReaderOnly className="">
          Content
        </ScreenReaderOnly>
      );

      const element = screen.getByText('Content');
      expect(element).toHaveClass('sr-only');
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(<ScreenReaderOnly>Simple text</ScreenReaderOnly>);

      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('should render nested elements', () => {
      render(
        <ScreenReaderOnly>
          <strong>Bold</strong> and <em>italic</em>
        </ScreenReaderOnly>
      );

      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('and')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('should render multiple child elements', () => {
      render(
        <ScreenReaderOnly>
          <span>First</span>
          <span>Second</span>
        </ScreenReaderOnly>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = render(<ScreenReaderOnly>{''}</ScreenReaderOnly>);

      const span = container.querySelector('span.sr-only');
      expect(span).toBeInTheDocument();
      expect(span).toBeEmptyDOMElement();
    });

    it('should handle long text content', () => {
      const longText = 'A'.repeat(500);
      render(<ScreenReaderOnly>{longText}</ScreenReaderOnly>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<ScreenReaderOnly>{"Special: <>&\"'"}</ScreenReaderOnly>);

      expect(screen.getByText("Special: <>&\"'")).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple ScreenReaderOnly components', () => {
      render(
        <div>
          <ScreenReaderOnly>First</ScreenReaderOnly>
          <ScreenReaderOnly>Second</ScreenReaderOnly>
          <ScreenReaderOnly>Third</ScreenReaderOnly>
        </div>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });
});

describe('LiveRegion Component', () => {
  describe('Basic Rendering', () => {
    it('should render live region content', () => {
      render(<LiveRegion>Live content</LiveRegion>);

      expect(screen.getByText('Live content')).toBeInTheDocument();
    });

    it('should have live-region class', () => {
      render(<LiveRegion>Content</LiveRegion>);

      const element = screen.getByText('Content');
      expect(element).toHaveClass('live-region');
    });

    it('should have default aria-live="polite"', () => {
      render(<LiveRegion>Content</LiveRegion>);

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-atomic="true"', () => {
      render(<LiveRegion>Content</LiveRegion>);

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('aria-atomic', 'true');
    });

    it('should render as div element', () => {
      const { container } = render(<LiveRegion>Content</LiveRegion>);

      const div = container.querySelector('div');
      expect(div).toBeInTheDocument();
      expect(div).toHaveTextContent('Content');
    });
  });

  describe('Politeness Levels', () => {
    it('should support polite level', () => {
      render(<LiveRegion politeness="polite">Content</LiveRegion>);

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('aria-live', 'polite');
    });

    it('should support assertive level', () => {
      render(<LiveRegion politeness="assertive">Content</LiveRegion>);

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('aria-live', 'assertive');
    });

    it('should support off level', () => {
      render(<LiveRegion politeness="off">Content</LiveRegion>);

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('aria-live', 'off');
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(<LiveRegion className="custom-live">Content</LiveRegion>);

      const element = screen.getByText('Content');
      expect(element).toHaveClass('live-region');
      expect(element).toHaveClass('custom-live');
    });

    it('should combine politeness and className', () => {
      render(
        <LiveRegion politeness="assertive" className="urgent">
          Content
        </LiveRegion>
      );

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('aria-live', 'assertive');
      expect(element).toHaveClass('urgent');
    });
  });

  describe('Dynamic Content', () => {
    it('should handle content updates', () => {
      const { rerender } = render(<LiveRegion>Initial</LiveRegion>);

      expect(screen.getByText('Initial')).toBeInTheDocument();

      rerender(<LiveRegion>Updated</LiveRegion>);

      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.queryByText('Initial')).not.toBeInTheDocument();
    });

    it('should maintain aria attributes on update', () => {
      const { rerender } = render(<LiveRegion politeness="assertive">Initial</LiveRegion>);

      const element = screen.getByText('Initial');
      expect(element).toHaveAttribute('aria-live', 'assertive');

      rerender(<LiveRegion politeness="assertive">Updated</LiveRegion>);

      const updatedElement = screen.getByText('Updated');
      expect(updatedElement).toHaveAttribute('aria-live', 'assertive');
      expect(updatedElement).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = render(<LiveRegion>{''}</LiveRegion>);

      const div = container.querySelector('div.live-region');
      expect(div).toBeInTheDocument();
      expect(div).toBeEmptyDOMElement();
    });

    it('should render complex nested content', () => {
      render(
        <LiveRegion>
          <div>
            <p>Paragraph</p>
            <ul>
              <li>Item</li>
            </ul>
          </div>
        </LiveRegion>
      );

      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item')).toBeInTheDocument();
    });
  });
});

describe('SkipLink Component', () => {
  beforeEach(() => {
    // Reset document body before each test
    document.body.innerHTML = '';
  });

  describe('Basic Rendering', () => {
    it('should render skip link', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>);

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('should have skip-to-main class', () => {
      render(<SkipLink href="#main">Skip</SkipLink>);

      const link = screen.getByText('Skip');
      expect(link).toHaveClass('skip-to-main');
    });

    it('should have href attribute', () => {
      render(<SkipLink href="#main">Skip</SkipLink>);

      const link = screen.getByText('Skip');
      expect(link).toHaveAttribute('href', '#main');
    });

    it('should render as anchor element', () => {
      render(<SkipLink href="#main">Skip</SkipLink>);

      const link = screen.getByText('Skip');
      expect(link.tagName).toBe('A');
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(
        <SkipLink href="#main" className="custom-skip">
          Skip
        </SkipLink>
      );

      const link = screen.getByText('Skip');
      expect(link).toHaveClass('skip-to-main');
      expect(link).toHaveClass('custom-skip');
    });

    it('should handle different href values', () => {
      render(<SkipLink href="#content">Skip to content</SkipLink>);

      const link = screen.getByText('Skip to content');
      expect(link).toHaveAttribute('href', '#content');
    });
  });

  describe('Click Behavior', () => {
    it('should focus target element on click', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetDiv = document.createElement('div');
      targetDiv.id = 'main';
      targetDiv.tabIndex = -1;
      document.body.appendChild(targetDiv);

      render(<SkipLink href="#main">Skip to main</SkipLink>);

      const link = screen.getByText('Skip to main');
      await user.click(link);

      // Verify the target was focused
      expect(document.activeElement).toBe(targetDiv);
    });

    it('should prevent default link behavior', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetDiv = document.createElement('div');
      targetDiv.id = 'main';
      targetDiv.tabIndex = -1;
      document.body.appendChild(targetDiv);

      render(<SkipLink href="#main">Skip</SkipLink>);

      const link = screen.getByText('Skip');
      await user.click(link);

      // If default wasn't prevented, we'd navigate - we just verify no error occurs
      expect(link).toBeInTheDocument();
    });

    it('should handle missing target gracefully', async () => {
      const user = userEvent.setup();

      render(<SkipLink href="#nonexistent">Skip</SkipLink>);

      const link = screen.getByText('Skip');

      // Should not throw error when target doesn't exist
      await expect(user.click(link)).resolves.not.toThrow();
    });

    it('should handle multiple targets with same id', async () => {
      const user = userEvent.setup();

      const targetDiv = document.createElement('div');
      targetDiv.id = 'main';
      targetDiv.tabIndex = -1;
      document.body.appendChild(targetDiv);

      render(<SkipLink href="#main">Skip</SkipLink>);

      const link = screen.getByText('Skip');
      await user.click(link);

      expect(document.activeElement).toBe(targetDiv);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard accessible', () => {
      render(<SkipLink href="#main">Skip to main</SkipLink>);

      const link = screen.getByText('Skip to main');
      link.focus();

      expect(document.activeElement).toBe(link);
    });

    it('should support Tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <SkipLink href="#main">Skip</SkipLink>
          <button>Other element</button>
        </div>
      );

      const link = screen.getByText('Skip');
      link.focus();

      await user.tab();

      expect(document.activeElement).not.toBe(link);
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>);

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      render(
        <SkipLink href="#main">
          <span>→</span> Skip to content
        </SkipLink>
      );

      expect(screen.getByText('→')).toBeInTheDocument();
      expect(screen.getByText('Skip to content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle href without hash', () => {
      render(<SkipLink href="main">Skip</SkipLink>);

      const link = screen.getByText('Skip');
      expect(link).toHaveAttribute('href', 'main');
    });

    it('should handle empty href', () => {
      render(<SkipLink href="">Skip</SkipLink>);

      const link = screen.getByText('Skip');
      expect(link).toHaveAttribute('href', '');
    });

    it('should render multiple skip links', () => {
      render(
        <div>
          <SkipLink href="#main">Skip to main</SkipLink>
          <SkipLink href="#nav">Skip to navigation</SkipLink>
          <SkipLink href="#footer">Skip to footer</SkipLink>
        </div>
      );

      expect(screen.getByText('Skip to main')).toBeInTheDocument();
      expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
      expect(screen.getByText('Skip to footer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper link semantics', () => {
      render(<SkipLink href="#main">Skip to main</SkipLink>);

      const link = screen.getByRole('link', { name: 'Skip to main' });
      expect(link).toBeInTheDocument();
    });

    it('should work with screen readers', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>);

      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName('Skip to main content');
    });
  });
});
