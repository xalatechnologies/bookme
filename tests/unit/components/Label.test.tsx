/**
 * Label Component Tests
 *
 * Tests for the shadcn/ui Label component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

describe('Label Component', () => {
  describe('Basic Rendering', () => {
    it('should render label element', () => {
      render(<Label>Test Label</Label>);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render as label element', () => {
      render(<Label>Label Text</Label>);

      const label = screen.getByText('Label Text');
      expect(label.tagName).toBe('LABEL');
    });

    it('should render children correctly', () => {
      render(
        <Label>
          <span>Complex Label</span>
        </Label>
      );

      expect(screen.getByText('Complex Label')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Label className="custom-label">Label</Label>);

      const label = screen.getByText('Label');
      expect(label).toHaveClass('custom-label');
    });

    it('should have default styling classes', () => {
      render(<Label>Label</Label>);

      const label = screen.getByText('Label');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('leading-none');
    });
  });

  describe('Association with Form Controls', () => {
    it('should associate with input using htmlFor', () => {
      render(
        <>
          <Label htmlFor="test-input">Username</Label>
          <Input id="test-input" />
        </>
      );

      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('should have proper htmlFor attribute for input association', () => {
      render(
        <>
          <Label htmlFor="clickable-input">Click me</Label>
          <Input id="clickable-input" type="text" />
        </>
      );

      const label = screen.getByText('Click me');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'clickable-input');
      expect(input).toHaveAttribute('id', 'clickable-input');
    });

    it('should work with checkbox input', () => {
      render(
        <>
          <Label htmlFor="checkbox-input">Accept terms</Label>
          <input type="checkbox" id="checkbox-input" />
        </>
      );

      const label = screen.getByText('Accept terms');
      expect(label).toHaveAttribute('for', 'checkbox-input');
    });

    it('should work with radio input', () => {
      render(
        <>
          <Label htmlFor="radio-input">Option A</Label>
          <input type="radio" id="radio-input" name="option" />
        </>
      );

      const label = screen.getByText('Option A');
      expect(label).toHaveAttribute('for', 'radio-input');
    });

    it('should work with textarea', () => {
      render(
        <>
          <Label htmlFor="textarea-input">Description</Label>
          <textarea id="textarea-input" />
        </>
      );

      const label = screen.getByText('Description');
      expect(label).toHaveAttribute('for', 'textarea-input');
    });

    it('should work with select', () => {
      render(
        <>
          <Label htmlFor="select-input">Choose option</Label>
          <select id="select-input">
            <option>Option 1</option>
          </select>
        </>
      );

      const label = screen.getByText('Choose option');
      expect(label).toHaveAttribute('for', 'select-input');
    });
  });

  describe('Nested Form Controls', () => {
    it('should work with nested input', () => {
      render(
        <Label>
          Email
          <Input type="email" />
        </Label>
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should work with nested checkbox', () => {
      render(
        <Label>
          <input type="checkbox" />
          Remember me
        </Label>
      );

      const checkbox = screen.getByRole('checkbox');
      const label = checkbox.closest('label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Remember me');
    });
  });

  describe('Accessibility', () => {
    it('should be identifiable by text', () => {
      render(<Label>Accessible Label</Label>);

      expect(screen.getByText('Accessible Label')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Label aria-label="Custom label">Text</Label>);

      const label = screen.getByLabelText('Custom label');
      expect(label).toBeInTheDocument();
    });

    it('should properly associate with form control for screen readers', () => {
      render(
        <>
          <Label htmlFor="accessible-input">Name</Label>
          <Input id="accessible-input" />
        </>
      );

      const input = screen.getByLabelText('Name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'accessible-input');
    });

    it('should work with aria-describedby', () => {
      render(
        <>
          <Label htmlFor="described-input">Email</Label>
          <Input id="described-input" aria-describedby="email-help" />
          <p id="email-help">Enter your email address</p>
        </>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should support required indicator pattern', () => {
      render(
        <>
          <Label htmlFor="required-input">
            Name <span aria-label="required">*</span>
          </Label>
          <Input id="required-input" required />
        </>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Disabled State Styling', () => {
    it('should have peer-disabled cursor styling', () => {
      render(<Label>Label</Label>);

      const label = screen.getByText('Label');
      // The class should be present for peer-disabled functionality
      expect(label.className).toContain('peer-disabled:cursor-not-allowed');
    });

    it('should have peer-disabled opacity styling', () => {
      render(<Label>Label</Label>);

      const label = screen.getByText('Label');
      expect(label.className).toContain('peer-disabled:opacity-70');
    });

    it('should work with disabled input', () => {
      render(
        <div className="flex items-center gap-2">
          <Input disabled className="peer" id="disabled-input" />
          <Label htmlFor="disabled-input">Disabled field</Label>
        </div>
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('should have default font size', () => {
      render(<Label>Label</Label>);

      const label = screen.getByText('Label');
      expect(label).toHaveClass('text-sm');
    });

    it('should have default font weight', () => {
      render(<Label>Label</Label>);

      const label = screen.getByText('Label');
      expect(label).toHaveClass('font-medium');
    });

    it('should have default line height', () => {
      render(<Label>Label</Label>);

      const label = screen.getByText('Label');
      expect(label).toHaveClass('leading-none');
    });

    it('should support custom styling', () => {
      render(<Label className="text-lg font-bold">Custom Label</Label>);

      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass('text-lg');
      expect(label).toHaveClass('font-bold');
    });

    it('should merge custom classes with defaults', () => {
      render(<Label className="text-blue-600">Blue Label</Label>);

      const label = screen.getByText('Blue Label');
      expect(label).toHaveClass('text-blue-600');
      expect(label).toHaveClass('text-sm'); // Default class still present
      expect(label).toHaveClass('font-medium'); // Default class still present
    });
  });

  describe('Form Integration', () => {
    it('should work in complete form', () => {
      render(
        <form>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
        </form>
      );

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should support multiple labels in form', () => {
      render(
        <form>
          <Label htmlFor="field1">Field 1</Label>
          <Input id="field1" />
          <Label htmlFor="field2">Field 2</Label>
          <Input id="field2" />
          <Label htmlFor="field3">Field 3</Label>
          <Input id="field3" />
        </form>
      );

      expect(screen.getByLabelText('Field 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Field 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Field 3')).toBeInTheDocument();
    });
  });

  describe('Complex Content', () => {
    it('should render with icon', () => {
      render(
        <Label>
          <span aria-hidden="true">🔒</span> Password
        </Label>
      );

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    it('should render with multiple children', () => {
      render(
        <Label>
          <span>First Name</span>
          <span className="text-red-500">*</span>
        </Label>
      );

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render with tooltip indicator', () => {
      render(
        <Label>
          Email{' '}
          <span title="We'll never share your email" aria-label="help">
            ?
          </span>
        </Label>
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('help')).toBeInTheDocument();
    });

    it('should render with badge', () => {
      render(
        <Label>
          Username{' '}
          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Optional</span>
        </Label>
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      const { container } = render(<Label htmlFor="test" />);

      const label = container.querySelector('label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'test');
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(200);
      render(<Label>{longText}</Label>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Label>Email & Password</Label>);

      expect(screen.getByText('Email & Password')).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      render(<Label>用户名 (Username)</Label>);

      expect(screen.getByText('用户名 (Username)')).toBeInTheDocument();
    });

    it('should handle HTML entities', () => {
      render(<Label>Price &gt; $100</Label>);

      expect(screen.getByText(/Price/)).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to label element', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLLabelElement | null>;

      render(<Label ref={ref}>Label</Label>);

      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });

    it('should allow programmatic access via ref', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLLabelElement | null>;

      render(<Label ref={ref}>Label</Label>);

      expect(ref.current?.textContent).toBe('Label');
    });

    it('should support ref with htmlFor', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLLabelElement | null>;

      render(
        <>
          <Label ref={ref} htmlFor="test-input">
            Label
          </Label>
          <Input id="test-input" />
        </>
      );

      expect(ref.current?.htmlFor).toBe('test-input');
    });
  });

  describe('Event Handling', () => {
    it('should handle onClick event', () => {
      const onClick = vi.fn();

      render(<Label onClick={onClick}>Clickable Label</Label>);

      const label = screen.getByText('Clickable Label');
      label.click();

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should have proper association for focus behavior', () => {
      render(
        <>
          <Label htmlFor="focus-input">Focus Test</Label>
          <Input id="focus-input" />
        </>
      );

      const label = screen.getByText('Focus Test');
      const input = screen.getByRole('textbox');

      // Verify proper label-input association
      expect(label).toHaveAttribute('for', 'focus-input');
      expect(input).toHaveAttribute('id', 'focus-input');

      // Input should be accessible via label text
      expect(screen.getByLabelText('Focus Test')).toBe(input);
    });
  });

  describe('Semantic HTML', () => {
    it('should use label element for semantics', () => {
      const { container } = render(<Label>Semantic Label</Label>);

      const labels = container.querySelectorAll('label');
      expect(labels).toHaveLength(1);
    });

    it('should maintain proper form structure', () => {
      render(
        <form>
          <fieldset>
            <legend>User Information</legend>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" />
            </div>
          </fieldset>
        </form>
      );

      const label = screen.getByText('Name');
      expect(label.closest('fieldset')).toBeInTheDocument();
    });
  });
});
