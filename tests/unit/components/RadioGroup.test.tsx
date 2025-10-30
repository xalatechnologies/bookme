/**
 * RadioGroup Component Tests
 *
 * Tests for the shadcn/ui RadioGroup component
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

describe('RadioGroup Component', () => {
  describe('Basic Rendering', () => {
    it('should render radio group', () => {
      render(
        <RadioGroup data-testid="radio-group">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    });

    it('should have radiogroup role', () => {
      render(
        <RadioGroup data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('role', 'radiogroup');
    });

    it('should have default styling classes', () => {
      render(
        <RadioGroup data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveClass('grid');
      expect(radioGroup).toHaveClass('gap-2');
    });

    it('should apply custom className', () => {
      render(
        <RadioGroup className="custom-radio-group" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveClass('custom-radio-group');
    });
  });

  describe('RadioGroupItem', () => {
    it('should render radio items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-1')).toBeInTheDocument();
      expect(screen.getByTestId('radio-2')).toBeInTheDocument();
    });

    it('should have radio role', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toHaveAttribute('role', 'radio');
    });

    it('should have default styling classes', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toHaveClass('aspect-square');
      expect(radio).toHaveClass('h-4');
      expect(radio).toHaveClass('w-4');
      expect(radio).toHaveClass('rounded-full');
      expect(radio).toHaveClass('border');
      expect(radio).toHaveClass('border-primary');
    });

    it('should apply custom className to RadioGroupItem', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" className="custom-radio" data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toHaveClass('custom-radio');
    });

    it('should have value attribute', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="test-value" data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toHaveAttribute('value', 'test-value');
    });
  });

  describe('User Interactions', () => {
    it('should select radio item on click', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      await user.click(radio1);

      expect(radio1).toHaveAttribute('data-state', 'checked');
      expect(radio1).toHaveAttribute('aria-checked', 'true');
    });

    it('should switch selection when clicking different item', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');

      await user.click(radio1);
      expect(radio1).toHaveAttribute('aria-checked', 'true');

      await user.click(radio2);
      expect(radio1).toHaveAttribute('aria-checked', 'false');
      expect(radio2).toHaveAttribute('aria-checked', 'true');
    });

    it('should allow only one selection at a time', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
          <RadioGroupItem value="option3" data-testid="radio-3" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');
      const radio3 = screen.getByTestId('radio-3');

      await user.click(radio1);
      expect(radio1).toHaveAttribute('aria-checked', 'true');
      expect(radio2).toHaveAttribute('aria-checked', 'false');
      expect(radio3).toHaveAttribute('aria-checked', 'false');

      await user.click(radio2);
      expect(radio1).toHaveAttribute('aria-checked', 'false');
      expect(radio2).toHaveAttribute('aria-checked', 'true');
      expect(radio3).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
          <RadioGroupItem value="option3" data-testid="radio-3" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');
      const radio3 = screen.getByTestId('radio-3');

      // Tab to focus first radio
      await user.tab();
      expect(radio1).toHaveFocus();

      // Arrow down moves focus to next radio
      await user.keyboard('{ArrowDown}');
      expect(radio2).toHaveFocus();

      // Arrow down again moves to third radio
      await user.keyboard('{ArrowDown}');
      expect(radio3).toHaveFocus();
    });

    it('should support space key selection', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      radio1.focus();
      await user.keyboard(' ');

      expect(radio1).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Disabled State', () => {
    it('should render disabled radio item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toBeDisabled();
      expect(radio).toHaveAttribute('data-disabled', '');
    });

    it('should not allow selection when disabled', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      await user.click(radio);

      expect(radio).toHaveAttribute('aria-checked', 'false');
    });

    it('should have disabled styling', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toHaveClass('disabled:cursor-not-allowed');
      expect(radio).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Controlled RadioGroup', () => {
    it('should work as controlled component', () => {
      const { rerender } = render(
        <RadioGroup value="option1">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      expect(radio1).toHaveAttribute('aria-checked', 'true');

      rerender(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio2 = screen.getByTestId('radio-2');
      expect(radio2).toHaveAttribute('aria-checked', 'true');
    });

    it('should call onValueChange callback', async () => {
      const user = userEvent.setup();
      let selectedValue = '';
      const handleChange = (value: string) => {
        selectedValue = value;
      };

      render(
        <RadioGroup onValueChange={handleChange}>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio2 = screen.getByTestId('radio-2');
      await user.click(radio2);

      expect(selectedValue).toBe('option2');
    });
  });

  describe('Default Value', () => {
    it('should render with default value', () => {
      render(
        <RadioGroup defaultValue="option2">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio2 = screen.getByTestId('radio-2');
      expect(radio2).toHaveAttribute('aria-checked', 'true');
    });

    it('should allow changing from default value', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');

      expect(radio1).toHaveAttribute('aria-checked', 'true');

      await user.click(radio2);
      expect(radio1).toHaveAttribute('aria-checked', 'false');
      expect(radio2).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label on RadioGroup', () => {
      render(
        <RadioGroup aria-label="Choose an option" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('aria-label', 'Choose an option');
    });

    it('should support aria-labelledby', () => {
      render(
        <div>
          <h3 id="group-label">Select Option</h3>
          <RadioGroup aria-labelledby="group-label" data-testid="radio-group">
            <RadioGroupItem value="option1" />
          </RadioGroup>
        </div>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('aria-labelledby', 'group-label');
    });

    it('should have proper aria-checked states', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
        </RadioGroup>
      );

      const radio1 = screen.getByTestId('radio-1');
      const radio2 = screen.getByTestId('radio-2');

      expect(radio1).toHaveAttribute('aria-checked', 'false');
      expect(radio2).toHaveAttribute('aria-checked', 'false');

      await user.click(radio1);
      expect(radio1).toHaveAttribute('aria-checked', 'true');
      expect(radio2).toHaveAttribute('aria-checked', 'false');
    });

    it('should support aria-required', () => {
      render(
        <RadioGroup required data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(
        <RadioGroup id="my-radio-group" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('id', 'my-radio-group');
    });

    it('should support data attributes', () => {
      render(
        <RadioGroup data-testid="my-radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('my-radio-group')).toBeInTheDocument();
    });

    it('should support dir attribute', () => {
      render(
        <RadioGroup dir="rtl" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to RadioGroup', () => {
      const ref = { current: null };

      render(
        <RadioGroup ref={ref} data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to RadioGroupItem', () => {
      const ref = { current: null };

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" ref={ref} data-testid="radio-1" />
        </RadioGroup>
      );

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Use Cases', () => {
    it('should work with labels', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <div>
            <RadioGroupItem value="option1" id="option1" data-testid="radio-1" />
            <label htmlFor="option1">Option 1</label>
          </div>
          <div>
            <RadioGroupItem value="option2" id="option2" data-testid="radio-2" />
            <label htmlFor="option2">Option 2</label>
          </div>
        </RadioGroup>
      );

      const label = screen.getByText('Option 1');
      await user.click(label);

      const radio1 = screen.getByTestId('radio-1');
      expect(radio1).toHaveAttribute('aria-checked', 'true');
    });

    it('should work as form input', () => {
      render(
        <form>
          <RadioGroup name="choice" defaultValue="option2">
            <RadioGroupItem value="option1" data-testid="radio-1" />
            <RadioGroupItem value="option2" data-testid="radio-2" />
          </RadioGroup>
        </form>
      );

      const radio2 = screen.getByTestId('radio-2');
      expect(radio2).toHaveAttribute('aria-checked', 'true');
    });

    it('should work with descriptions', () => {
      render(
        <RadioGroup>
          <div>
            <RadioGroupItem value="option1" id="opt1" aria-describedby="desc1" data-testid="radio-1" />
            <label htmlFor="opt1">Option 1</label>
            <p id="desc1">This is option 1 description</p>
          </div>
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      expect(radio).toHaveAttribute('aria-describedby', 'desc1');
      expect(screen.getByText('This is option 1 description')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty RadioGroup', () => {
      render(<RadioGroup data-testid="radio-group" />);

      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    });

    it('should handle single RadioGroupItem', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="only-option" data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      await user.click(radio);

      expect(radio).toHaveAttribute('aria-checked', 'true');
    });

    it('should handle many RadioGroupItems', () => {
      render(
        <RadioGroup>
          {Array.from({ length: 10 }, (_, i) => (
            <RadioGroupItem key={i} value={`option${i}`} data-testid={`radio-${i}`} />
          ))}
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-0')).toBeInTheDocument();
      expect(screen.getByTestId('radio-9')).toBeInTheDocument();
    });

    it('should not unselect when clicking selected item', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup>
          <RadioGroupItem value="option1" data-testid="radio-1" />
        </RadioGroup>
      );

      const radio = screen.getByTestId('radio-1');
      await user.click(radio);
      expect(radio).toHaveAttribute('aria-checked', 'true');

      await user.click(radio);
      expect(radio).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Multiple RadioGroups', () => {
    it('should render multiple independent radio groups', async () => {
      const user = userEvent.setup();

      render(
        <>
          <RadioGroup data-testid="group-1">
            <RadioGroupItem value="a1" data-testid="radio-a1" />
            <RadioGroupItem value="a2" data-testid="radio-a2" />
          </RadioGroup>
          <RadioGroup data-testid="group-2">
            <RadioGroupItem value="b1" data-testid="radio-b1" />
            <RadioGroupItem value="b2" data-testid="radio-b2" />
          </RadioGroup>
        </>
      );

      const radioA1 = screen.getByTestId('radio-a1');
      const radioB1 = screen.getByTestId('radio-b1');

      await user.click(radioA1);
      await user.click(radioB1);

      expect(radioA1).toHaveAttribute('aria-checked', 'true');
      expect(radioB1).toHaveAttribute('aria-checked', 'true');
    });

    it('should maintain independent selections', async () => {
      const user = userEvent.setup();

      render(
        <>
          <RadioGroup data-testid="group-1">
            <RadioGroupItem value="a1" data-testid="radio-a1" />
            <RadioGroupItem value="a2" data-testid="radio-a2" />
          </RadioGroup>
          <RadioGroup data-testid="group-2">
            <RadioGroupItem value="b1" data-testid="radio-b1" />
            <RadioGroupItem value="b2" data-testid="radio-b2" />
          </RadioGroup>
        </>
      );

      const radioA1 = screen.getByTestId('radio-a1');
      const radioA2 = screen.getByTestId('radio-a2');
      const radioB1 = screen.getByTestId('radio-b1');

      await user.click(radioA1);
      await user.click(radioB1);

      expect(radioA1).toHaveAttribute('aria-checked', 'true');
      expect(radioB1).toHaveAttribute('aria-checked', 'true');

      await user.click(radioA2);

      expect(radioA1).toHaveAttribute('aria-checked', 'false');
      expect(radioA2).toHaveAttribute('aria-checked', 'true');
      expect(radioB1).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Orientation', () => {
    it('should support horizontal orientation', () => {
      render(
        <RadioGroup orientation="horizontal" data-testid="radio-group">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should support vertical orientation', () => {
      render(
        <RadioGroup orientation="vertical" data-testid="radio-group">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radioGroup = screen.getByTestId('radio-group');
      expect(radioGroup).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Loop Navigation', () => {
    it('should support loop navigation with arrow keys', async () => {
      const user = userEvent.setup();

      render(
        <RadioGroup loop={true}>
          <RadioGroupItem value="option1" data-testid="radio-1" />
          <RadioGroupItem value="option2" data-testid="radio-2" />
          <RadioGroupItem value="option3" data-testid="radio-3" />
        </RadioGroup>
      );

      const radio3 = screen.getByTestId('radio-3');
      const radio1 = screen.getByTestId('radio-1');

      // Click to select and focus the last item
      await user.click(radio3);
      expect(radio3).toHaveAttribute('aria-checked', 'true');
      expect(radio3).toHaveFocus();

      // Arrow down should loop back to first item
      await user.keyboard('{ArrowDown}');
      expect(radio1).toHaveFocus();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on state', () => {
      const showRadioGroup = true;

      render(
        <div>
          {showRadioGroup && (
            <RadioGroup data-testid="radio-group">
              <RadioGroupItem value="option1" />
            </RadioGroup>
          )}
        </div>
      );

      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const showRadioGroup = false;

      render(
        <div>
          {showRadioGroup && (
            <RadioGroup data-testid="radio-group">
              <RadioGroupItem value="option1" />
            </RadioGroup>
          )}
        </div>
      );

      expect(screen.queryByTestId('radio-group')).not.toBeInTheDocument();
    });
  });
});
