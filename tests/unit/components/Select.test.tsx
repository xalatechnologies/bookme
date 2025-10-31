/**
 * Select Component Tests
 *
 * Tests for the shadcn/ui Select component
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';

// Mock pointer capture and scroll methods for Radix UI Select
beforeEach(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.scrollIntoView = () => {};
});

describe('Select Component', () => {
  describe('Basic Rendering', () => {
    it('should render select trigger', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    it('should have combobox role', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('role', 'combobox');
    });

    it('should display placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('h-10');
      expect(trigger).toHaveClass('w-full');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('justify-between');
    });

    it('should apply custom className to trigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger" data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });
  });

  describe('User Interactions', () => {
    it('should open dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });
    });

    it('should select item on click', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      await waitFor(() => {
        expect(trigger).toHaveTextContent('Option 1');
      });
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      const option1 = screen.getByText('Option 1');
      await user.click(option1);

      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('SelectItem', () => {
    it('should render select items', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1" data-testid="item-1">Option 1</SelectItem>
            <SelectItem value="opt2" data-testid="item-2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
        expect(screen.getByTestId('item-2')).toBeInTheDocument();
      });
    });

    it('should have option role', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" data-testid="item-1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        const item = screen.getByTestId('item-1');
        expect(item).toHaveAttribute('role', 'option');
      });
    });

    it('should apply custom className to SelectItem', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" className="custom-item" data-testid="item-1">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        const item = screen.getByTestId('item-1');
        expect(item).toHaveClass('custom-item');
      });
    });
  });

  describe('Disabled State', () => {
    it('should render disabled trigger', () => {
      render(
        <Select>
          <SelectTrigger disabled data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled', '');
    });

    it('should not open when disabled trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger disabled data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should render disabled SelectItem', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" disabled data-testid="item-1">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        const item = screen.getByTestId('item-1');
        expect(item).toHaveAttribute('data-disabled', '');
      });
    });

    it('should not select disabled item', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" disabled>Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      const disabledOption = screen.getByText('Option 1');
      await user.click(disabledOption);

      // Trigger should still show placeholder
      expect(trigger).toHaveTextContent('Select');
    });
  });

  describe('Controlled Select', () => {
    it('should work as controlled component', () => {
      const { rerender } = render(
        <Select value="option1">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveTextContent('Option 1');

      rerender(
        <Select value="option2">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(trigger).toHaveTextContent('Option 2');
    });

    it('should call onValueChange callback', async () => {
      const user = userEvent.setup();
      let selectedValue = '';
      const handleChange = (value: string) => {
        selectedValue = value;
      };

      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 2'));

      await waitFor(() => {
        expect(selectedValue).toBe('option2');
      });
    });
  });

  describe('Default Value', () => {
    it('should render with default value', () => {
      render(
        <Select defaultValue="option2">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveTextContent('Option 2');
    });

    it('should allow changing from default value', async () => {
      const user = userEvent.setup();

      render(
        <Select defaultValue="option1">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveTextContent('Option 1');

      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 2'));

      await waitFor(() => {
        expect(trigger).toHaveTextContent('Option 2');
      });
    });
  });

  describe('SelectGroup and SelectLabel', () => {
    it('should render SelectGroup with SelectLabel', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Fruits')).toBeInTheDocument();
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
      });
    });

    it('should render multiple SelectGroups', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Fruits')).toBeInTheDocument();
        expect(screen.getByText('Vegetables')).toBeInTheDocument();
      });
    });
  });

  describe('SelectSeparator', () => {
    it('should render SelectSeparator', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator data-testid="separator" />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('separator')).toBeInTheDocument();
      });
    });

    it('should apply custom className to separator', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator className="custom-separator" data-testid="separator" />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('custom-separator');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Enter key to open', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      trigger.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should support Space key to open', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      trigger.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should support Escape key to close', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Choose option" data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Choose option');
    });

    it('should have aria-expanded attribute', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should support required attribute', () => {
      render(
        <Select required>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(
        <Select>
          <SelectTrigger id="my-select" data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('id', 'my-select');
    });

    it('should support data attributes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="my-select">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('my-select')).toBeInTheDocument();
    });

    it('should support dir attribute', () => {
      render(
        <Select dir="rtl">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to SelectTrigger', () => {
      const ref = { current: null };

      render(
        <Select>
          <SelectTrigger ref={ref} data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to SelectItem', async () => {
      const user = userEvent.setup();
      const ref = { current: null };

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" ref={ref} data-testid="item-1">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty SelectContent', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent />
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      await user.click(trigger);

      // Should not crash
      expect(trigger).toBeInTheDocument();
    });

    it('should handle many SelectItems', async () => {
      const user = userEvent.setup();
      const options = Array.from({ length: 50 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      await user.click(screen.getByTestId('select-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Option 0')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Selects', () => {
    it('should render multiple independent selects', () => {
      render(
        <>
          <Select>
            <SelectTrigger data-testid="select-1">
              <SelectValue placeholder="Select 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a1">A1</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger data-testid="select-2">
              <SelectValue placeholder="Select 2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="b1">B1</SelectItem>
            </SelectContent>
          </Select>
        </>
      );

      expect(screen.getByTestId('select-1')).toBeInTheDocument();
      expect(screen.getByTestId('select-2')).toBeInTheDocument();
    });

    it('should maintain independent selections', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Select>
            <SelectTrigger data-testid="select-1">
              <SelectValue placeholder="Select 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a1">A1</SelectItem>
              <SelectItem value="a2">A2</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger data-testid="select-2">
              <SelectValue placeholder="Select 2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="b1">B1</SelectItem>
              <SelectItem value="b2">B2</SelectItem>
            </SelectContent>
          </Select>
        </>
      );

      const select1 = screen.getByTestId('select-1');
      const select2 = screen.getByTestId('select-2');

      await user.click(select1);
      await waitFor(() => {
        expect(screen.getByText('A1')).toBeInTheDocument();
      });
      await user.click(screen.getByText('A1'));

      await user.click(select2);
      await waitFor(() => {
        expect(screen.getByText('B1')).toBeInTheDocument();
      });
      await user.click(screen.getByText('B1'));

      expect(select1).toHaveTextContent('A1');
      expect(select2).toHaveTextContent('B1');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally', () => {
      const showSelect = true;

      render(
        <div>
          {showSelect && (
            <Select>
              <SelectTrigger data-testid="select-trigger">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      );

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const showSelect = false;

      render(
        <div>
          {showSelect && (
            <Select>
              <SelectTrigger data-testid="select-trigger">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      );

      expect(screen.queryByTestId('select-trigger')).not.toBeInTheDocument();
    });
  });
});
