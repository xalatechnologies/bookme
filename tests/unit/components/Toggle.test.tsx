/**
 * Toggle Component Tests
 *
 * Tests for the shadcn/ui Toggle component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '@/components/ui/toggle';

describe('Toggle Component', () => {
  describe('Basic Rendering', () => {
    it('should render toggle button', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render as button element', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle.tagName).toBe('BUTTON');
    });

    it('should render children correctly', () => {
      render(<Toggle aria-label="Test toggle">Bold</Toggle>);

      expect(screen.getByText('Bold')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Toggle className="custom-toggle" aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('custom-toggle');
    });

    it('should have default styling classes', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('inline-flex');
      expect(toggle).toHaveClass('items-center');
      expect(toggle).toHaveClass('justify-center');
      expect(toggle).toHaveClass('rounded-md');
      expect(toggle).toHaveClass('text-sm');
      expect(toggle).toHaveClass('font-medium');
    });
  });

  describe('Pressed State', () => {
    it('should be unpressed by default', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'off');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('should render as pressed when pressed prop is true', () => {
      render(<Toggle pressed={true} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'on');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should render as unpressed when pressed prop is false', () => {
      render(<Toggle pressed={false} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'off');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('should toggle pressed state when clicked', async () => {
      const user = userEvent.setup();

      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'off');

      await user.click(toggle);

      expect(toggle).toHaveAttribute('data-state', 'on');

      await user.click(toggle);

      expect(toggle).toHaveAttribute('data-state', 'off');
    });

    it('should update controlled pressed state', () => {
      const { rerender } = render(
        <Toggle pressed={false} onPressedChange={() => {}} aria-label="Test toggle">Toggle</Toggle>
      );

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'off');

      rerender(
        <Toggle pressed={true} onPressedChange={() => {}} aria-label="Test toggle">Toggle</Toggle>
      );

      expect(toggle).toHaveAttribute('data-state', 'on');
    });
  });

  describe('User Interaction', () => {
    it('should call onPressedChange when clicked', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      render(<Toggle onPressedChange={onPressedChange} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      await user.click(toggle);

      expect(onPressedChange).toHaveBeenCalledTimes(1);
      expect(onPressedChange).toHaveBeenCalledWith(true);
    });

    it('should call onPressedChange with false when unpressing', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      render(
        <Toggle
          pressed={true}
          onPressedChange={onPressedChange}
          aria-label="Test toggle"
        >
          Toggle
        </Toggle>
      );

      const toggle = screen.getByRole('button');
      await user.click(toggle);

      expect(onPressedChange).toHaveBeenCalledWith(false);
    });

    it('should toggle with keyboard space', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      render(<Toggle onPressedChange={onPressedChange} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      toggle.focus();

      await user.keyboard(' ');

      expect(onPressedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle with keyboard enter', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      render(<Toggle onPressedChange={onPressedChange} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      toggle.focus();

      await user.keyboard('{Enter}');

      expect(onPressedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Toggle disabled aria-label="Disabled toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toBeDisabled();
    });

    it('should not call onPressedChange when disabled and clicked', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      render(
        <Toggle disabled onPressedChange={onPressedChange} aria-label="Disabled toggle">
          Toggle
        </Toggle>
      );

      const toggle = screen.getByRole('button');
      await user.click(toggle);

      expect(onPressedChange).not.toHaveBeenCalled();
    });

    it('should have disabled styling', () => {
      render(<Toggle disabled aria-label="Disabled toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('disabled:pointer-events-none');
      expect(toggle).toHaveClass('disabled:opacity-50');
    });

    it('should not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      render(
        <Toggle disabled onPressedChange={onPressedChange} aria-label="Disabled toggle">
          Toggle
        </Toggle>
      );

      const toggle = screen.getByRole('button');
      toggle.focus();

      await user.keyboard(' ');

      expect(onPressedChange).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Toggle variant="default" aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('bg-transparent');
    });

    it('should render outline variant', () => {
      render(<Toggle variant="outline" aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('border');
      expect(toggle).toHaveClass('border-input');
      expect(toggle).toHaveClass('bg-transparent');
    });

    it('should use default variant when no variant specified', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Toggle size="default" aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-10');
      expect(toggle).toHaveClass('px-3');
    });

    it('should render small size', () => {
      render(<Toggle size="sm" aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-9');
      expect(toggle).toHaveClass('px-2.5');
    });

    it('should render large size', () => {
      render(<Toggle size="lg" aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-11');
      expect(toggle).toHaveClass('px-5');
    });

    it('should use default size when no size specified', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('h-10');
      expect(toggle).toHaveClass('px-3');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      toggle.focus();

      expect(toggle).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Toggle aria-label="Bold text">B</Toggle>);

      const toggle = screen.getByLabelText('Bold text');
      expect(toggle).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Toggle aria-label="Format" aria-describedby="toggle-description">Bold</Toggle>
          <p id="toggle-description">Toggle bold formatting</p>
        </>
      );

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-describedby', 'toggle-description');
    });

    it('should have proper aria-pressed attribute', () => {
      render(<Toggle pressed={true} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update aria-pressed when toggled', async () => {
      const user = userEvent.setup();

      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');

      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Focus Management', () => {
    it('should handle focus', async () => {
      const user = userEvent.setup();

      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      await user.click(toggle);

      expect(toggle).toHaveFocus();
    });

    it('should handle tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Toggle aria-label="First toggle">First</Toggle>
          <Toggle aria-label="Second toggle">Second</Toggle>
        </>
      );

      const firstToggle = screen.getByLabelText('First toggle');
      const secondToggle = screen.getByLabelText('Second toggle');

      firstToggle.focus();
      expect(firstToggle).toHaveFocus();

      await user.tab();
      expect(secondToggle).toHaveFocus();
    });

    it('should have visible focus indicator', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('focus-visible:outline-none');
      expect(toggle).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(<Toggle aria-label="Bold">Bold</Toggle>);

      expect(screen.getByText('Bold')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      render(
        <Toggle aria-label="Bold">
          <svg data-testid="bold-icon" width="16" height="16">
            <text>B</text>
          </svg>
        </Toggle>
      );

      expect(screen.getByTestId('bold-icon')).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
      render(
        <Toggle aria-label="Bold">
          <svg data-testid="icon" width="16" height="16">
            <text>B</text>
          </svg>
          <span>Bold</span>
        </Toggle>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Toggle id="bold-toggle" aria-label="Bold">Bold</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('id', 'bold-toggle');
    });

    it('should support data attributes', () => {
      render(<Toggle data-testid="my-toggle" aria-label="Toggle">Toggle</Toggle>);

      expect(screen.getByTestId('my-toggle')).toBeInTheDocument();
    });

    it('should support title attribute', () => {
      render(<Toggle title="Toggle bold" aria-label="Bold">Bold</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('title', 'Toggle bold');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to toggle element', () => {
      const ref = { current: null };

      render(<Toggle ref={ref} aria-label="Test toggle">Toggle</Toggle>);

      expect(ref.current).not.toBeNull();
    });

    it('should allow programmatic focus via ref', () => {
      const ref = { current: null } as React.MutableRefObject<any>;

      render(<Toggle ref={ref} aria-label="Test toggle">Toggle</Toggle>);

      ref.current?.focus();

      expect(ref.current).toHaveFocus();
    });
  });

  describe('Use Cases', () => {
    it('should work as text formatting toggle', () => {
      render(<Toggle aria-label="Bold text">B</Toggle>);

      expect(screen.getByLabelText('Bold text')).toBeInTheDocument();
    });

    it('should work in toolbar with multiple toggles', () => {
      render(
        <div role="toolbar">
          <Toggle aria-label="Bold">B</Toggle>
          <Toggle aria-label="Italic">I</Toggle>
          <Toggle aria-label="Underline">U</Toggle>
        </div>
      );

      expect(screen.getByLabelText('Bold')).toBeInTheDocument();
      expect(screen.getByLabelText('Italic')).toBeInTheDocument();
      expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    });

    it('should work as view mode toggle', () => {
      render(<Toggle aria-label="Grid view">Grid</Toggle>);

      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      render(<Toggle onPressedChange={onPressedChange} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');

      await user.click(toggle);
      await user.click(toggle);
      await user.click(toggle);

      expect(onPressedChange).toHaveBeenCalledTimes(3);
    });

    it('should handle programmatic state changes', () => {
      const { rerender } = render(
        <Toggle pressed={false} onPressedChange={() => {}} aria-label="Test toggle">Toggle</Toggle>
      );

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveAttribute('data-state', 'off');

      rerender(
        <Toggle pressed={true} onPressedChange={() => {}} aria-label="Test toggle">Toggle</Toggle>
      );

      expect(toggle).toHaveAttribute('data-state', 'on');

      rerender(
        <Toggle pressed={false} onPressedChange={() => {}} aria-label="Test toggle">Toggle</Toggle>
      );

      expect(toggle).toHaveAttribute('data-state', 'off');
    });

    it('should handle empty toggle', () => {
      const { container } = render(<Toggle aria-label="Empty toggle" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Multiple Toggles', () => {
    it('should render multiple toggles independently', () => {
      render(
        <div>
          <Toggle aria-label="Toggle 1">1</Toggle>
          <Toggle aria-label="Toggle 2">2</Toggle>
          <Toggle aria-label="Toggle 3">3</Toggle>
        </div>
      );

      expect(screen.getByLabelText('Toggle 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle 3')).toBeInTheDocument();
    });

    it('should maintain individual state', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Toggle aria-label="Toggle 1">1</Toggle>
          <Toggle aria-label="Toggle 2">2</Toggle>
        </div>
      );

      const toggle1 = screen.getByLabelText('Toggle 1');
      const toggle2 = screen.getByLabelText('Toggle 2');

      await user.click(toggle1);

      expect(toggle1).toHaveAttribute('data-state', 'on');
      expect(toggle2).toHaveAttribute('data-state', 'off');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on feature flag', () => {
      const hasFeature = true;

      render(
        <div>
          {hasFeature && <Toggle aria-label="New feature">Feature</Toggle>}
        </div>
      );

      expect(screen.getByLabelText('New feature')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const hasFeature = false;

      render(
        <div>
          {hasFeature && <Toggle aria-label="New feature">Feature</Toggle>}
        </div>
      );

      expect(screen.queryByLabelText('New feature')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have rounded corners', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('rounded-md');
    });

    it('should have transition colors', () => {
      render(<Toggle aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('transition-colors');
    });

    it('should support custom styling', () => {
      render(<Toggle className="bg-blue-500 text-white" aria-label="Custom">Custom</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle).toHaveClass('bg-blue-500');
      expect(toggle).toHaveClass('text-white');
    });

    it('should have pressed state styling', () => {
      render(<Toggle pressed={true} aria-label="Test toggle">Toggle</Toggle>);

      const toggle = screen.getByRole('button');
      expect(toggle.className).toContain('data-[state=on]:bg-accent');
      expect(toggle.className).toContain('data-[state=on]:text-accent-foreground');
    });
  });

  describe('Complex Scenarios', () => {
    it('should work in formatting toolbar', () => {
      render(
        <div className="flex gap-1" role="toolbar">
          <Toggle size="sm" variant="outline" aria-label="Bold">
            <strong>B</strong>
          </Toggle>
          <Toggle size="sm" variant="outline" aria-label="Italic">
            <em>I</em>
          </Toggle>
          <Toggle size="sm" variant="outline" aria-label="Underline">
            <u>U</u>
          </Toggle>
        </div>
      );

      expect(screen.getByLabelText('Bold')).toBeInTheDocument();
      expect(screen.getByLabelText('Italic')).toBeInTheDocument();
      expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    });

    it('should work with different variants and sizes', () => {
      render(
        <div>
          <Toggle variant="default" size="sm" aria-label="Small default">Small</Toggle>
          <Toggle variant="outline" size="lg" aria-label="Large outline">Large</Toggle>
        </div>
      );

      const smallToggle = screen.getByLabelText('Small default');
      const largeToggle = screen.getByLabelText('Large outline');

      expect(smallToggle).toHaveClass('h-9');
      expect(largeToggle).toHaveClass('h-11');
      expect(largeToggle).toHaveClass('border');
    });
  });
});
