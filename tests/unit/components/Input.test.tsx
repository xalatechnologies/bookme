/**
 * Input Component Tests
 *
 * Tests for the shadcn/ui Input component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render input element', () => {
      render(<Input aria-label="Test input" />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" aria-label="Test input" />);

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render as input element by default', () => {
      render(<Input aria-label="Test input" />);

      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
    });

    it('should apply custom className', () => {
      render(<Input className="custom-input" aria-label="Test input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should have default styling classes', () => {
      render(<Input aria-label="Test input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-10');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('border');
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', () => {
      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      // Text inputs don't always have explicit type="text" attribute
      expect(input.tagName).toBe('INPUT');
    });

    it('should render email input', () => {
      render(<Input type="email" aria-label="Email input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" aria-label="Password input" />);

      const input = screen.getByLabelText('Password input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" aria-label="Number input" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render search input', () => {
      render(<Input type="search" aria-label="Search input" />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render tel input', () => {
      render(<Input type="tel" aria-label="Phone input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" aria-label="URL input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render date input', () => {
      render(<Input type="date" aria-label="Date input" />);

      const input = screen.getByLabelText('Date input');
      expect(input).toHaveAttribute('type', 'date');
    });

    it('should render time input', () => {
      render(<Input type="time" aria-label="Time input" />);

      const input = screen.getByLabelText('Time input');
      expect(input).toHaveAttribute('type', 'time');
    });

    it('should render file input', () => {
      render(<Input type="file" aria-label="File input" />);

      const input = screen.getByLabelText('File input');
      expect(input).toHaveAttribute('type', 'file');
    });
  });

  describe('User Interaction', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup();

      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('should handle onChange event', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Input aria-label="Text input" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledTimes(4); // Once per character
    });

    it('should handle onFocus event', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();

      render(<Input aria-label="Text input" onFocus={onFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur event', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();

      render(<Input aria-label="Text input" onBlur={onBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard input', async () => {
      const user = userEvent.setup();

      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      input.focus();
      await user.keyboard('Hello');

      expect(input).toHaveValue('Hello');
    });

    it('should handle clearing input', async () => {
      const user = userEvent.setup();

      render(<Input aria-label="Text input" defaultValue="Initial text" />);

      const input = screen.getByRole('textbox');
      await user.clear(input);

      expect(input).toHaveValue('');
    });
  });

  describe('Input States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled aria-label="Disabled input" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Input disabled onChange={onChange} aria-label="Disabled input" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('');
    });

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly aria-label="Readonly input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should not accept input when readonly', async () => {
      const user = userEvent.setup();

      render(<Input readOnly defaultValue="Readonly text" aria-label="Readonly input" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(input).toHaveValue('Readonly text');
    });

    it('should be required when required prop is true', () => {
      render(<Input required aria-label="Required input" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Input Values', () => {
    it('should render with default value', () => {
      render(<Input defaultValue="Default text" aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Default text');
    });

    it('should render with controlled value', () => {
      render(<Input value="Controlled value" onChange={() => {}} aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Controlled value');
    });

    it('should update controlled value', () => {
      const { rerender } = render(
        <Input value="Initial" onChange={() => {}} aria-label="Text input" />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Initial');

      rerender(<Input value="Updated" onChange={() => {}} aria-label="Text input" />);

      expect(input).toHaveValue('Updated');
    });

    it('should handle empty value', () => {
      render(<Input value="" onChange={() => {}} aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });
  });

  describe('Input Attributes', () => {
    it('should support maxLength attribute', () => {
      render(<Input maxLength={10} aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support minLength attribute', () => {
      render(<Input minLength={5} aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('should support pattern attribute', () => {
      render(<Input pattern="[0-9]*" aria-label="Number input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('should support autoComplete attribute', () => {
      render(<Input autoComplete="email" aria-label="Email input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });

    it('should support autoFocus attribute', () => {
      render(<Input autoFocus aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });

    it('should support name attribute', () => {
      render(<Input name="username" aria-label="Username input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should support id attribute', () => {
      render(<Input id="email-input" aria-label="Email input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-input');
    });
  });

  describe('Number Input Specific', () => {
    it('should support min attribute for number input', () => {
      render(<Input type="number" min={0} aria-label="Number input" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
    });

    it('should support max attribute for number input', () => {
      render(<Input type="number" max={100} aria-label="Number input" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should support step attribute for number input', () => {
      render(<Input type="number" step={0.1} aria-label="Number input" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.1');
    });

    it('should handle number input', async () => {
      const user = userEvent.setup();

      render(<Input type="number" aria-label="Number input" />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '42');

      expect(input).toHaveValue(42);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      input.focus();

      expect(input).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Username" />);

      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-label="Email" aria-describedby="email-help" />
          <p id="email-help">Enter your email address</p>
        </>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should support aria-invalid for validation', () => {
      render(<Input aria-label="Email" aria-invalid="true" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should work with label element', () => {
      render(
        <>
          <label htmlFor="email">Email Address</label>
          <Input id="email" type="email" />
        </>
      );

      const input = screen.getByLabelText('Email Address');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus', async () => {
      const user = userEvent.setup();

      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(input).toHaveFocus();
    });

    it('should handle tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Input aria-label="First input" />
          <Input aria-label="Second input" />
        </>
      );

      const firstInput = screen.getByLabelText('First input');
      const secondInput = screen.getByLabelText('Second input');

      firstInput.focus();
      expect(firstInput).toHaveFocus();

      await user.tab();
      expect(secondInput).toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('should have default height class', () => {
      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-10');
    });

    it('should have default width class', () => {
      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
    });

    it('should have rounded corners', () => {
      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('rounded-md');
    });

    it('should have border styling', () => {
      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border');
    });

    it('should support custom styling', () => {
      render(<Input className="h-12 rounded-lg" aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-12');
      expect(input).toHaveClass('rounded-lg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text input', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(500);

      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      await user.type(input, longText);

      expect(input).toHaveValue(longText);
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      // Use paste instead of type for special characters
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.click(input);
      await user.paste(specialChars);

      expect(input).toHaveValue(specialChars);
    });

    it('should handle unicode characters', async () => {
      const user = userEvent.setup();
      const unicode = '你好世界 🌍';

      render(<Input aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      await user.type(input, unicode);

      expect(input).toHaveValue(unicode);
    });

    it('should handle empty placeholder', () => {
      render(<Input placeholder="" aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', '');
    });
  });

  describe('Form Integration', () => {
    it('should work within a form', () => {
      render(
        <form>
          <Input name="username" aria-label="Username" />
        </form>
      );

      const input = screen.getByRole('textbox');
      expect(input.closest('form')).toBeInTheDocument();
    });

    it('should submit with form data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Input name="username" aria-label="Username" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'testuser');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should validate required field', () => {
      render(
        <form>
          <Input required aria-label="Required field" />
        </form>
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = { current: null };

      render(<Input ref={ref} aria-label="Text input" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should allow programmatic focus via ref', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLInputElement | null>;

      render(<Input ref={ref} aria-label="Text input" />);

      ref.current?.focus();

      expect(ref.current).toHaveFocus();
    });
  });
});
