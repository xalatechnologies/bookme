/**
 * Badge Component Tests
 *
 * Tests for the shadcn/ui Badge component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge Component', () => {
  describe('Basic Rendering', () => {
    it('should render badge element', () => {
      render(<Badge>Badge Text</Badge>);

      expect(screen.getByText('Badge Text')).toBeInTheDocument();
    });

    it('should render as div element', () => {
      const { container } = render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('DIV');
    });

    it('should render children correctly', () => {
      render(<Badge>New</Badge>);

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Badge className="custom-badge">Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('custom-badge');
    });

    it('should have default styling classes', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('border');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('font-semibold');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Badge variant="default">Default</Badge>);

      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('border-transparent');
      expect(badge).toHaveClass('bg-primary');
    });

    it('should render secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);

      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary');
    });

    it('should render destructive variant', () => {
      render(<Badge variant="destructive">Error</Badge>);

      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('should render outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>);

      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
    });

    it('should use default variant when no variant specified', () => {
      render(<Badge>No Variant</Badge>);

      const badge = screen.getByText('No Variant');
      expect(badge).toHaveClass('bg-primary');
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(<Badge>Text Badge</Badge>);

      expect(screen.getByText('Text Badge')).toBeInTheDocument();
    });

    it('should render number content', () => {
      render(<Badge>42</Badge>);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
      render(
        <Badge>
          <span>🔔</span> Notifications
        </Badge>
      );

      expect(screen.getByText('🔔')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should render only icon', () => {
      render(<Badge>✓</Badge>);

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Badge>
          <span>New</span>
          <span>5</span>
        </Badge>
      );

      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have rounded-full class', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have inline-flex display', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('inline-flex');
    });

    it('should have small text size', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('text-xs');
    });

    it('should have semibold font weight', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('font-semibold');
    });

    it('should support custom styling', () => {
      render(<Badge className="bg-blue-500 text-white">Custom</Badge>);

      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('bg-blue-500');
      expect(badge).toHaveClass('text-white');
    });

    it('should have padding classes', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-0.5');
    });
  });

  describe('Accessibility', () => {
    it('should be identifiable by text', () => {
      render(<Badge>Status Badge</Badge>);

      expect(screen.getByText('Status Badge')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Badge aria-label="New notifications">3</Badge>);

      const badge = screen.getByLabelText('New notifications');
      expect(badge).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Badge aria-describedby="badge-desc">New</Badge>
          <p id="badge-desc">This indicates new items</p>
        </>
      );

      const badge = screen.getByText('New');
      expect(badge).toHaveAttribute('aria-describedby', 'badge-desc');
    });

    it('should support role attribute', () => {
      render(<Badge role="status">Live</Badge>);

      const badge = screen.getByText('Live');
      expect(badge).toHaveAttribute('role', 'status');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Badge id="status-badge">Status</Badge>);

      const badge = screen.getByText('Status');
      expect(badge).toHaveAttribute('id', 'status-badge');
    });

    it('should support data attributes', () => {
      render(<Badge data-testid="custom-badge">Badge</Badge>);

      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    it('should support title attribute', () => {
      render(<Badge title="This is a badge">Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('title', 'This is a badge');
    });
  });

  describe('Use Cases', () => {
    it('should work as notification badge', () => {
      render(
        <div>
          Messages
          <Badge variant="destructive">5</Badge>
        </div>
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should work as status indicator', () => {
      render(<Badge variant="secondary">Active</Badge>);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should work as category tag', () => {
      render(<Badge variant="outline">JavaScript</Badge>);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('should work in a list of badges', () => {
      const tags = ['React', 'TypeScript', 'Vitest'];

      render(
        <div>
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      );

      tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it('should work with count display', () => {
      render(
        <div>
          Cart
          <Badge>12</Badge>
        </div>
      );

      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty badge', () => {
      const { container } = render(<Badge />);

      const badge = container.firstChild;
      expect(badge).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(100);
      render(<Badge>{longText}</Badge>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Badge>Badge & More</Badge>);

      expect(screen.getByText('Badge & More')).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      render(<Badge>徽章 🎖️</Badge>);

      expect(screen.getByText(/徽章/)).toBeInTheDocument();
    });

    it('should handle numeric zero', () => {
      render(<Badge>0</Badge>);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle boolean content', () => {
      render(<Badge>{true && 'Active'}</Badge>);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Multiple Badges', () => {
    it('should render multiple badges independently', () => {
      render(
        <div>
          <Badge variant="default">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      );

      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('should maintain individual styling', () => {
      render(
        <div>
          <Badge variant="default">Badge 1</Badge>
          <Badge variant="secondary">Badge 2</Badge>
        </div>
      );

      const badge1 = screen.getByText('Badge 1');
      const badge2 = screen.getByText('Badge 2');

      expect(badge1).toHaveClass('bg-primary');
      expect(badge2).toHaveClass('bg-secondary');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on count', () => {
      const count = 5;

      render(<div>{count > 0 && <Badge>{count}</Badge>}</div>);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const count = 0;

      render(<div>{count > 0 && <Badge>{count}</Badge>}</div>);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should render different variants based on value', () => {
      const status = 'error';

      render(
        <Badge variant={status === 'error' ? 'destructive' : 'default'}>
          {status}
        </Badge>
      );

      const badge = screen.getByText('error');
      expect(badge).toHaveClass('bg-destructive');
    });
  });

  describe('Complex Content', () => {
    it('should render with nested elements', () => {
      render(
        <Badge>
          <strong>Bold</strong> Text
        </Badge>
      );

      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should render with SVG icon', () => {
      render(
        <Badge>
          <svg data-testid="badge-icon" width="12" height="12">
            <circle cx="6" cy="6" r="6" />
          </svg>
          Icon Badge
        </Badge>
      );

      expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
      expect(screen.getByText('Icon Badge')).toBeInTheDocument();
    });
  });

  describe('Focus Behavior', () => {
    it('should have focus styles', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('focus:outline-none');
      expect(badge).toHaveClass('focus:ring-2');
    });

    it('should be focusable when tabIndex is set', () => {
      render(<Badge tabIndex={0}>Focusable</Badge>);

      const badge = screen.getByText('Focusable');
      badge.focus();

      expect(badge).toHaveFocus();
    });
  });

  describe('Hover Behavior', () => {
    it('should have hover styles for default variant', () => {
      render(<Badge variant="default">Hover</Badge>);

      const badge = screen.getByText('Hover');
      expect(badge.className).toContain('hover:bg-primary/80');
    });

    it('should have hover styles for secondary variant', () => {
      render(<Badge variant="secondary">Hover</Badge>);

      const badge = screen.getByText('Hover');
      expect(badge.className).toContain('hover:bg-secondary/80');
    });

    it('should have hover styles for destructive variant', () => {
      render(<Badge variant="destructive">Hover</Badge>);

      const badge = screen.getByText('Hover');
      expect(badge.className).toContain('hover:bg-destructive/80');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should work as email unread counter', () => {
      const unreadCount = 23;

      render(
        <div>
          <span>Inbox</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" aria-label={`${unreadCount} unread emails`}>
              {unreadCount}
            </Badge>
          )}
        </div>
      );

      const badge = screen.getByLabelText('23 unread emails');
      expect(badge).toHaveTextContent('23');
    });

    it('should work as product tag collection', () => {
      const tags = ['New Arrival', 'Sale', 'Limited Edition'];

      render(
        <div>
          {tags.map((tag, index) => (
            <Badge
              key={tag}
              variant={index === 0 ? 'default' : 'secondary'}
            >
              {tag}
            </Badge>
          ))}
        </div>
      );

      expect(screen.getByText('New Arrival')).toHaveClass('bg-primary');
      expect(screen.getByText('Sale')).toHaveClass('bg-secondary');
      expect(screen.getByText('Limited Edition')).toHaveClass('bg-secondary');
    });

    it('should work as status indicator with color coding', () => {
      const getStatusVariant = (status: string) => {
        if (status === 'success') return 'default';
        if (status === 'error') return 'destructive';
        return 'secondary';
      };

      const status = 'error';

      render(
        <Badge variant={getStatusVariant(status)}>
          {status.toUpperCase()}
        </Badge>
      );

      const badge = screen.getByText('ERROR');
      expect(badge).toHaveClass('bg-destructive');
    });
  });
});
