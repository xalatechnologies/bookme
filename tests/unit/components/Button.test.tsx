/**
 * Button Component Tests
 *
 * Tests for the shadcn/ui Button component
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render button element', () => {
      render(<Button>Click Me</Button>);

      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });

    it('should render as button by default', () => {
      render(<Button data-testid="button">Click</Button>);

      const button = screen.getByTestId('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render button text', () => {
      render(<Button>Button Text</Button>);

      expect(screen.getByText('Button Text')).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      render(<Button data-testid="button">Click</Button>);

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-center');
      expect(button).toHaveClass('rounded-md');
    });

    it('should apply custom className', () => {
      render(
        <Button className="custom-class" data-testid="button">
          Click
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Button data-testid="button">Default</Button>);

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
    });

    it('should render destructive variant', () => {
      render(
        <Button variant="destructive" data-testid="button">
          Delete
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('text-destructive-foreground');
    });

    it('should render outline variant', () => {
      render(
        <Button variant="outline" data-testid="button">
          Outline
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-input');
      expect(button).toHaveClass('bg-background');
    });

    it('should render secondary variant', () => {
      render(
        <Button variant="secondary" data-testid="button">
          Secondary
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-secondary');
      expect(button).toHaveClass('text-secondary-foreground');
    });

    it('should render ghost variant', () => {
      render(
        <Button variant="ghost" data-testid="button">
          Ghost
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('hover:bg-accent');
      expect(button).toHaveClass('hover:text-accent-foreground');
    });

    it('should render link variant', () => {
      render(
        <Button variant="link" data-testid="button">
          Link
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('text-primary');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Button data-testid="button">Default Size</Button>);

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
    });

    it('should render small size', () => {
      render(
        <Button size="sm" data-testid="button">
          Small
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-sm');
    });

    it('should render large size', () => {
      render(
        <Button size="lg" data-testid="button">
          Large
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('h-14');
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('py-4');
      expect(button).toHaveClass('text-lg');
    });

    it('should render icon size', () => {
      render(
        <Button size="icon" data-testid="button" aria-label="Icon button">
          X
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('w-12');
    });
  });

  describe('User Interactions', () => {
    it('should trigger onClick when clicked', async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };

      render(<Button onClick={handleClick}>Click Me</Button>);

      await user.click(screen.getByRole('button', { name: 'Click Me' }));

      expect(clicked).toBe(true);
    });

    it('should support multiple clicks', async () => {
      const user = userEvent.setup();
      let clickCount = 0;
      const handleClick = () => {
        clickCount++;
      };

      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button', { name: 'Click Me' });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(clickCount).toBe(3);
    });

    it('should support keyboard activation with Enter', async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };

      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button', { name: 'Click Me' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(clicked).toBe(true);
    });

    it('should support keyboard activation with Space', async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };

      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button', { name: 'Click Me' });
      button.focus();
      await user.keyboard(' ');

      expect(clicked).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
    });

    it('should not trigger onClick when disabled', async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      await user.click(screen.getByRole('button', { name: 'Disabled' }));

      expect(clicked).toBe(false);
    });

    it('should have disabled styling', () => {
      render(<Button disabled data-testid="button">Disabled</Button>);

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Button Types', () => {
    it('should support button type', () => {
      render(<Button type="button">Button Type</Button>);

      const button = screen.getByRole('button', { name: 'Button Type' });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should support submit type', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support reset type', () => {
      render(<Button type="reset">Reset</Button>);

      const button = screen.getByRole('button', { name: 'Reset' });
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('asChild Prop', () => {
    it('should render as Slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
    });

    it('should apply button styles to child element', () => {
      render(
        <Button asChild data-testid="link-button">
          <a href="/test">Styled Link</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: 'Styled Link' });
      expect(link).toHaveClass('inline-flex');
      expect(link).toHaveClass('items-center');
    });

    it('should support variant with asChild', () => {
      render(
        <Button asChild variant="destructive">
          <a href="/delete">Delete Link</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: 'Delete Link' });
      expect(link).toHaveClass('bg-destructive');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Button id="my-button">Click</Button>);

      const button = screen.getByRole('button', { name: 'Click' });
      expect(button).toHaveAttribute('id', 'my-button');
    });

    it('should support data attributes', () => {
      render(<Button data-testid="test-button">Click</Button>);

      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });

    it('should support title attribute', () => {
      render(<Button title="Button tooltip">Click</Button>);

      const button = screen.getByRole('button', { name: 'Click' });
      expect(button).toHaveAttribute('title', 'Button tooltip');
    });

    it('should support name attribute', () => {
      render(<Button name="submitButton">Submit</Button>);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('name', 'submitButton');
    });

    it('should support value attribute', () => {
      render(<Button value="action-value">Action</Button>);

      const button = screen.getByRole('button', { name: 'Action' });
      expect(button).toHaveAttribute('value', 'action-value');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);

      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Action</Button>
          <p id="help-text">This button performs an action</p>
        </div>
      );

      const button = screen.getByRole('button', { name: 'Action' });
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support aria-pressed', () => {
      render(<Button aria-pressed="true">Toggle</Button>);

      const button = screen.getByRole('button', { name: 'Toggle' });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have focus-visible ring', () => {
      render(<Button data-testid="button">Focus Me</Button>);

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null };

      render(<Button ref={ref}>Click</Button>);

      expect(ref.current).not.toBeNull();
      expect((ref.current as HTMLButtonElement).tagName).toBe('BUTTON');
    });

    it('should allow ref access to button methods', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>;

      render(<Button ref={ref}>Click</Button>);

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Children Content', () => {
    it('should render text children', () => {
      render(<Button>Text Content</Button>);

      expect(screen.getByText('Text Content')).toBeInTheDocument();
    });

    it('should render icon with text', () => {
      render(
        <Button>
          <span>✓</span>
          <span>Save</span>
        </Button>
      );

      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render only icon for icon button', () => {
      render(
        <Button size="icon" aria-label="Settings">
          ⚙
        </Button>
      );

      expect(screen.getByText('⚙')).toBeInTheDocument();
    });

    it('should handle complex children', () => {
      render(
        <Button>
          <div>
            <span>Complex</span>
            <span>Content</span>
          </div>
        </Button>
      );

      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Combined Variants', () => {
    it('should support variant and size together', () => {
      render(
        <Button variant="outline" size="sm" data-testid="button">
          Small Outline
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('text-sm');
    });

    it('should support destructive large button', () => {
      render(
        <Button variant="destructive" size="lg" data-testid="button">
          Delete All
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-destructive');
      expect(button).toHaveClass('h-14');
      expect(button).toHaveClass('text-lg');
    });

    it('should support ghost icon button', () => {
      render(
        <Button variant="ghost" size="icon" aria-label="Menu" data-testid="button">
          ☰
        </Button>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('hover:bg-accent');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('w-12');
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      render(
        <form>
          <Button type="submit">Submit Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: 'Submit Form' });
      expect(button.closest('form')).toBeInTheDocument();
    });

    it('should trigger form submission', async () => {
      const user = userEvent.setup();
      let submitted = false;
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitted = true;
      };

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(submitted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty button', () => {
      render(<Button data-testid="button" />);

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'This is a very long button text that might wrap to multiple lines';
      render(<Button>{longText}</Button>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Button>{'<Click> & "Save"'}</Button>);

      expect(screen.getByText('<Click> & "Save"')).toBeInTheDocument();
    });
  });

  describe('Multiple Buttons', () => {
    it('should render multiple independent buttons', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button>Button 3</Button>
        </div>
      );

      expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button 3' })).toBeInTheDocument();
    });

    it('should maintain independent click handlers', async () => {
      const user = userEvent.setup();
      let button1Clicked = false;
      let button2Clicked = false;

      render(
        <div>
          <Button onClick={() => (button1Clicked = true)}>Button 1</Button>
          <Button onClick={() => (button2Clicked = true)}>Button 2</Button>
        </div>
      );

      await user.click(screen.getByRole('button', { name: 'Button 1' }));

      expect(button1Clicked).toBe(true);
      expect(button2Clicked).toBe(false);
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally', () => {
      const showButton = true;

      render(<div>{showButton && <Button>Conditional</Button>}</div>);

      expect(screen.getByRole('button', { name: 'Conditional' })).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const showButton = false;

      render(<div>{showButton && <Button>Hidden</Button>}</div>);

      expect(screen.queryByRole('button', { name: 'Hidden' })).not.toBeInTheDocument();
    });
  });
});
