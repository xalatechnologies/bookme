/**
 * Textarea Component Tests
 *
 * Tests for the shadcn/ui Textarea component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea Component', () => {
  describe('Basic Rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea aria-label="Test textarea" />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render as textarea element', () => {
      render(<Textarea aria-label="Test textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter text here" aria-label="Test textarea" />);

      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Textarea className="custom-textarea" aria-label="Test textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('should have default styling classes', () => {
      render(<Textarea aria-label="Test textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('flex');
      expect(textarea).toHaveClass('min-h-[80px]');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('border');
    });
  });

  describe('User Interaction', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello World');

      expect(textarea).toHaveValue('Hello World');
    });

    it('should handle onChange event', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Textarea aria-label="Text textarea" onChange={onChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');

      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledTimes(4); // Once per character
    });

    it('should handle onFocus event', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();

      render(<Textarea aria-label="Text textarea" onFocus={onFocus} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur event', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();

      render(<Textarea aria-label="Text textarea" onBlur={onBlur} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard input', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();
      await user.keyboard('Hello{Enter}World');

      expect(textarea).toHaveValue('Hello\nWorld');
    });

    it('should handle clearing textarea', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Text textarea" defaultValue="Initial text" />);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);

      expect(textarea).toHaveValue('');
    });

    it('should handle multiline text', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');

      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Textarea States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled aria-label="Disabled textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Textarea disabled onChange={onChange} aria-label="Disabled textarea" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');

      expect(onChange).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('');
    });

    it('should be readonly when readOnly prop is true', () => {
      render(<Textarea readOnly aria-label="Readonly textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should not accept input when readonly', async () => {
      const user = userEvent.setup();

      render(
        <Textarea readOnly defaultValue="Readonly text" aria-label="Readonly textarea" />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');

      expect(textarea).toHaveValue('Readonly text');
    });

    it('should be required when required prop is true', () => {
      render(<Textarea required aria-label="Required textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });
  });

  describe('Textarea Values', () => {
    it('should render with default value', () => {
      render(<Textarea defaultValue="Default text" aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Default text');
    });

    it('should render with controlled value', () => {
      render(<Textarea value="Controlled value" onChange={() => {}} aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Controlled value');
    });

    it('should update controlled value', () => {
      const { rerender } = render(
        <Textarea value="Initial" onChange={() => {}} aria-label="Text textarea" />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Initial');

      rerender(<Textarea value="Updated" onChange={() => {}} aria-label="Text textarea" />);

      expect(textarea).toHaveValue('Updated');
    });

    it('should handle empty value', () => {
      render(<Textarea value="" onChange={() => {}} aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('should handle multiline default value', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(<Textarea defaultValue={multilineText} aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(multilineText);
    });
  });

  describe('Textarea Attributes', () => {
    it('should support maxLength attribute', () => {
      render(<Textarea maxLength={100} aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should support minLength attribute', () => {
      render(<Textarea minLength={10} aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('minLength', '10');
    });

    it('should support rows attribute', () => {
      render(<Textarea rows={5} aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should support cols attribute', () => {
      render(<Textarea cols={50} aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '50');
    });

    it('should support autoFocus attribute', () => {
      render(<Textarea autoFocus aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });

    it('should support name attribute', () => {
      render(<Textarea name="description" aria-label="Description textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'description');
    });

    it('should support id attribute', () => {
      render(<Textarea id="message-textarea" aria-label="Message textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'message-textarea');
    });

    it('should support wrap attribute', () => {
      render(<Textarea wrap="soft" aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('wrap', 'soft');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();

      expect(textarea).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Textarea aria-label="Description" />);

      const textarea = screen.getByLabelText('Description');
      expect(textarea).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Textarea aria-label="Message" aria-describedby="message-help" />
          <p id="message-help">Enter your message</p>
        </>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-help');
    });

    it('should support aria-invalid for validation', () => {
      render(<Textarea aria-label="Message" aria-invalid="true" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should work with label element', () => {
      render(
        <>
          <label htmlFor="bio">Biography</label>
          <Textarea id="bio" />
        </>
      );

      const textarea = screen.getByLabelText('Biography');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);

      expect(textarea).toHaveFocus();
    });

    it('should handle tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Textarea aria-label="First textarea" />
          <Textarea aria-label="Second textarea" />
        </>
      );

      const firstTextarea = screen.getByLabelText('First textarea');
      const secondTextarea = screen.getByLabelText('Second textarea');

      firstTextarea.focus();
      expect(firstTextarea).toHaveFocus();

      await user.tab();
      expect(secondTextarea).toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('should have default min height', () => {
      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('min-h-[80px]');
    });

    it('should have default width', () => {
      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('w-full');
    });

    it('should have rounded corners', () => {
      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('rounded-md');
    });

    it('should have border styling', () => {
      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border');
    });

    it('should support custom styling', () => {
      render(<Textarea className="min-h-[200px] rounded-lg" aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('min-h-[200px]');
      expect(textarea).toHaveClass('rounded-lg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text input', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(500);

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, longText);

      expect(textarea).toHaveValue(longText);
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.click(textarea);
      await user.paste('!@#$%^&*()_+-=[]{}|;:,.<>?');

      expect(textarea).toHaveValue('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should handle unicode characters', async () => {
      const user = userEvent.setup();
      const unicode = '你好世界 🌍';

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, unicode);

      expect(textarea).toHaveValue(unicode);
    });

    it('should handle empty placeholder', () => {
      render(<Textarea placeholder="" aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', '');
    });

    it('should handle line breaks', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'First{Enter}{Enter}Third');

      expect(textarea).toHaveValue('First\n\nThird');
    });
  });

  describe('Form Integration', () => {
    it('should work within a form', () => {
      render(
        <form>
          <Textarea name="description" aria-label="Description" />
        </form>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea.closest('form')).toBeInTheDocument();
    });

    it('should submit with form data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Textarea name="message" aria-label="Message" />
          <button type="submit">Submit</button>
        </form>
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should validate required field', () => {
      render(
        <form>
          <Textarea required aria-label="Required field" />
        </form>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('should respect maxLength in form', async () => {
      const user = userEvent.setup();

      render(
        <form>
          <Textarea maxLength={10} aria-label="Limited textarea" />
        </form>
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a very long text that exceeds the limit');

      // Textarea enforces maxLength, so value should be truncated
      expect(textarea.value.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to textarea element', () => {
      const ref = { current: null };

      render(<Textarea ref={ref} aria-label="Text textarea" />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should allow programmatic focus via ref', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLTextAreaElement | null>;

      render(<Textarea ref={ref} aria-label="Text textarea" />);

      ref.current?.focus();

      expect(ref.current).toHaveFocus();
    });

    it('should allow programmatic value setting via ref', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLTextAreaElement | null>;

      render(<Textarea ref={ref} aria-label="Text textarea" />);

      if (ref.current) {
        ref.current.value = 'Programmatic value';
      }

      expect(ref.current?.value).toBe('Programmatic value');
    });
  });

  describe('Resize Behavior', () => {
    it('should support resize CSS property', () => {
      render(<Textarea className="resize-none" aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should support vertical resize only', () => {
      render(<Textarea className="resize-y" aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-y');
    });

    it('should support horizontal resize only', () => {
      render(<Textarea className="resize-x" aria-label="Text textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-x');
    });
  });

  describe('Character Count Use Case', () => {
    it('should work with character counter', async () => {
      const user = userEvent.setup();
      const maxChars = 100;

      const CharCountTextarea = () => {
        const [count, setCount] = React.useState(0);

        return (
          <>
            <Textarea
              aria-label="Message"
              maxLength={maxChars}
              onChange={(e) => setCount(e.target.value.length)}
            />
            <p>
              {count}/{maxChars}
            </p>
          </>
        );
      };

      render(<CharCountTextarea />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello World');

      expect(screen.getByText(/11\/100/)).toBeInTheDocument();
    });
  });
});
