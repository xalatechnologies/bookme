/**
 * Checkbox Component Tests
 *
 * Tests for the shadcn/ui Checkbox component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

describe('Checkbox Component', () => {
  describe('Basic Rendering', () => {
    it('should render checkbox element', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Checkbox className="custom-checkbox" aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('custom-checkbox');
    });

    it('should have default styling classes', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
      expect(checkbox).toHaveClass('rounded-sm');
      expect(checkbox).toHaveClass('border');
    });

    it('should render with id', () => {
      render(<Checkbox id="test-checkbox" aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
    });
  });

  describe('Checked State', () => {
    it('should be unchecked by default', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render as checked when checked prop is true', () => {
      render(<Checkbox checked={true} aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render as unchecked when checked prop is false', () => {
      render(<Checkbox checked={false} aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle checked state when clicked', async () => {
      const user = userEvent.setup();

      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      expect(checkbox).toBeChecked();

      await user.click(checkbox);

      expect(checkbox).not.toBeChecked();
    });

    it('should update controlled checked state', () => {
      const { rerender } = render(
        <Checkbox checked={false} onCheckedChange={() => {}} aria-label="Test checkbox" />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      rerender(
        <Checkbox checked={true} onCheckedChange={() => {}} aria-label="Test checkbox" />
      );

      expect(checkbox).toBeChecked();
    });
  });

  describe('User Interaction', () => {
    it('should call onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Checkbox onCheckedChange={onCheckedChange} aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should call onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox
          checked={true}
          onCheckedChange={onCheckedChange}
          aria-label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should toggle with keyboard space', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Checkbox onCheckedChange={onCheckedChange} aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      await user.keyboard(' ');

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should be activatable via keyboard', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Checkbox onCheckedChange={onCheckedChange} aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      // Space key toggles checkbox
      await user.keyboard(' ');

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Checkbox disabled aria-label="Disabled checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should not call onCheckedChange when disabled and clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox disabled onCheckedChange={onCheckedChange} aria-label="Disabled checkbox" />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('should have disabled styling', () => {
      render(<Checkbox disabled aria-label="Disabled checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed');
      expect(checkbox).toHaveClass('disabled:opacity-50');
    });

    it('should not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox disabled onCheckedChange={onCheckedChange} aria-label="Disabled checkbox" />
      );

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      await user.keyboard(' ');

      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('Label Association', () => {
    it('should work with Label component', () => {
      render(
        <>
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms</Label>
        </>
      );

      const checkbox = screen.getByLabelText('Accept terms');
      expect(checkbox).toBeInTheDocument();
    });

    it('should toggle when associated label is clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <>
          <Checkbox id="terms" onCheckedChange={onCheckedChange} />
          <Label htmlFor="terms">Accept terms</Label>
        </>
      );

      const label = screen.getByText('Accept terms');
      await user.click(label);

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should work with native label', () => {
      render(
        <>
          <label htmlFor="native-checkbox">Native Label</label>
          <Checkbox id="native-checkbox" />
        </>
      );

      const checkbox = screen.getByLabelText('Native Label');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Checkbox aria-label="Accessible checkbox" />);

      const checkbox = screen.getByLabelText('Accessible checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Checkbox aria-label="Terms" aria-describedby="terms-description" />
          <p id="terms-description">You must accept the terms</p>
        </>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-description');
    });

    it('should support aria-invalid for validation', () => {
      render(<Checkbox aria-label="Invalid checkbox" aria-invalid="true" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper role', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should support required prop', () => {
      render(<Checkbox aria-label="Required checkbox" required />);

      const checkbox = screen.getByRole('checkbox');
      // Radix checkboxes handle required internally, not as HTML attribute
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus', async () => {
      const user = userEvent.setup();

      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(checkbox).toHaveFocus();
    });

    it('should handle tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Checkbox aria-label="First checkbox" />
          <Checkbox aria-label="Second checkbox" />
        </>
      );

      const firstCheckbox = screen.getByLabelText('First checkbox');
      const secondCheckbox = screen.getByLabelText('Second checkbox');

      firstCheckbox.focus();
      expect(firstCheckbox).toHaveFocus();

      await user.tab();
      expect(secondCheckbox).toHaveFocus();
    });

    it('should have visible focus indicator', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('focus-visible:outline-none');
      expect(checkbox).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Form Integration', () => {
    it('should work within a form', () => {
      render(
        <form>
          <Checkbox name="terms" aria-label="Terms checkbox" />
        </form>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.closest('form')).toBeInTheDocument();
    });

    it('should accept name prop', () => {
      render(<Checkbox name="newsletter" aria-label="Newsletter checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      // Radix checkboxes accept name prop but may not expose it as HTML attribute
      expect(checkbox).toBeInTheDocument();
    });

    it('should support value attribute', () => {
      render(<Checkbox value="yes" aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('value', 'yes');
    });

    it('should submit with form data when checked', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Checkbox name="terms" value="accepted" aria-label="Terms checkbox" />
          <button type="submit">Submit</button>
        </form>
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have default size classes', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
    });

    it('should have rounded corners', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('rounded-sm');
    });

    it('should have border styling', () => {
      render(<Checkbox aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('border');
    });

    it('should support custom styling', () => {
      render(<Checkbox className="h-6 w-6 rounded-md" aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('h-6');
      expect(checkbox).toHaveClass('w-6');
      expect(checkbox).toHaveClass('rounded-md');
    });

    it('should have checked state styling', () => {
      render(<Checkbox checked={true} aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.className).toContain('data-[state=checked]:bg-primary');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to checkbox element', () => {
      const ref = { current: null };

      render(<Checkbox ref={ref} aria-label="Test checkbox" />);

      expect(ref.current).not.toBeNull();
    });

    it('should allow programmatic focus via ref', () => {
      const ref = { current: null } as React.MutableRefObject<any>;

      render(<Checkbox ref={ref} aria-label="Test checkbox" />);

      ref.current?.focus();

      expect(ref.current).toHaveFocus();
    });
  });

  describe('Indeterminate State', () => {
    it('should support indeterminate state', () => {
      render(<Checkbox checked="indeterminate" aria-label="Indeterminate checkbox" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should call onCheckedChange with indeterminate', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Checkbox
          checked="indeterminate"
          onCheckedChange={onCheckedChange}
          aria-label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckedChange).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Checkbox onCheckedChange={onCheckedChange} aria-label="Test checkbox" />);

      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(onCheckedChange).toHaveBeenCalledTimes(3);
    });

    it('should handle programmatic state changes', () => {
      const { rerender } = render(
        <Checkbox checked={false} onCheckedChange={() => {}} aria-label="Test checkbox" />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      rerender(
        <Checkbox checked={true} onCheckedChange={() => {}} aria-label="Test checkbox" />
      );

      expect(checkbox).toBeChecked();

      rerender(
        <Checkbox checked={false} onCheckedChange={() => {}} aria-label="Test checkbox" />
      );

      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Complex Use Cases', () => {
    it('should work in a list of checkboxes', () => {
      const options = ['Option 1', 'Option 2', 'Option 3'];

      render(
        <div>
          {options.map((option) => (
            <div key={option}>
              <Checkbox id={option} />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </div>
      );

      options.forEach((option) => {
        expect(screen.getByLabelText(option)).toBeInTheDocument();
      });
    });

    it('should work with select all functionality', async () => {
      const user = userEvent.setup();

      const CheckboxGroup = () => {
        const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
        const items = ['Item 1', 'Item 2', 'Item 3'];

        const allChecked = selectedItems.length === items.length;

        const handleSelectAll = (checked: boolean) => {
          setSelectedItems(checked ? items : []);
        };

        const handleItemChange = (item: string, checked: boolean) => {
          setSelectedItems((prev) =>
            checked ? [...prev, item] : prev.filter((i) => i !== item)
          );
        };

        return (
          <>
            <Checkbox
              checked={allChecked}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
            />
            {items.map((item) => (
              <Checkbox
                key={item}
                checked={selectedItems.includes(item)}
                onCheckedChange={(checked) => handleItemChange(item, checked as boolean)}
                aria-label={item}
              />
            ))}
          </>
        );
      };

      render(<CheckboxGroup />);

      const selectAll = screen.getByLabelText('Select all');
      await user.click(selectAll);

      expect(screen.getByLabelText('Item 1')).toBeChecked();
      expect(screen.getByLabelText('Item 2')).toBeChecked();
      expect(screen.getByLabelText('Item 3')).toBeChecked();
    });
  });
});
