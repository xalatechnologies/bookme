/**
 * FormActions Component Tests
 *
 * Tests for FormActions - reusable form action buttons component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormActions } from '@/components/common/forms/FormActions';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'actions.cancel': 'Cancel',
        'actions.submit': 'Submit',
        'actions.loading': 'Loading...',
      };
      return translations[key] || key;
    },
  }),
}));

describe('FormActions Component', () => {
  describe('Basic Rendering', () => {
    it('should render form actions', () => {
      const { container } = render(
        <FormActions onSubmit={vi.fn()} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render submit button by default', () => {
      render(<FormActions onSubmit={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should render cancel button when showCancel is true', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          showCancel={true}
        />
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should not render cancel button when showCancel is false', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          showCancel={false}
        />
      );

      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('should not render cancel button when onCancel not provided', () => {
      render(<FormActions onSubmit={vi.fn()} />);

      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });
  });

  describe('Button Labels', () => {
    it('should use custom submit label', () => {
      render(
        <FormActions onSubmit={vi.fn()} submitLabel="Save Changes" />
      );

      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('should use custom cancel label', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          cancelLabel="Go Back"
        />
      );

      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    });

    it('should use default submit label from i18n', () => {
      render(<FormActions onSubmit={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should use default cancel label from i18n', () => {
      render(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('Submit Button Behavior', () => {
    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<FormActions onSubmit={handleSubmit} />);

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should have button type', () => {
      render(<FormActions onSubmit={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be disabled when isSubmitting is true', () => {
      render(<FormActions onSubmit={vi.fn()} isSubmitting={true} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeDisabled();
    });

    it('should be disabled when isValid is false', () => {
      render(<FormActions onSubmit={vi.fn()} isValid={false} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeDisabled();
    });

    it('should be enabled when isValid is true', () => {
      render(<FormActions onSubmit={vi.fn()} isValid={true} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).not.toBeDisabled();
    });

    it('should not call onSubmit when disabled', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<FormActions onSubmit={handleSubmit} isValid={false} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      await user.click(button);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Button Behavior', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();

      render(
        <FormActions onSubmit={vi.fn()} onCancel={handleCancel} />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('should have button type', () => {
      render(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be disabled when isSubmitting is true', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          isSubmitting={true}
        />
      );

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).toBeDisabled();
    });

    it('should be enabled when not submitting', () => {
      render(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).not.toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading text when submitting', () => {
      render(<FormActions onSubmit={vi.fn()} isSubmitting={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading icon when submitting', () => {
      const { container } = render(
        <FormActions onSubmit={vi.fn()} isSubmitting={true} />
      );

      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('should not show loading state when not submitting', () => {
      render(<FormActions onSubmit={vi.fn()} isSubmitting={false} />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should show submit label when not submitting', () => {
      render(<FormActions onSubmit={vi.fn()} submitLabel="Save" />);

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should replace submit label with loading text', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          submitLabel="Save"
          isSubmitting={true}
        />
      );

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Button Variants', () => {
    it('should apply default variant to submit button', () => {
      render(<FormActions onSubmit={vi.fn()} submitVariant="default" />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeInTheDocument();
    });

    it('should apply outline variant to submit button', () => {
      render(<FormActions onSubmit={vi.fn()} submitVariant="outline" />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeInTheDocument();
    });

    it('should apply destructive variant to submit button', () => {
      render(<FormActions onSubmit={vi.fn()} submitVariant="destructive" />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeInTheDocument();
    });

    it('should always apply outline variant to cancel button', () => {
      render(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <FormActions onSubmit={vi.fn()} className="custom-actions" />
      );

      const wrapper = container.querySelector('.custom-actions');
      expect(wrapper).toBeInTheDocument();
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <FormActions onSubmit={vi.fn()} className="extra-class" />
      );

      const wrapper = container.querySelector('.extra-class');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('justify-end');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on submit button', () => {
      render(<FormActions onSubmit={vi.fn()} submitLabel="Save" />);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toHaveAttribute('aria-label', 'Save');
    });

    it('should have aria-label on cancel button', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          cancelLabel="Back"
        />
      );

      const button = screen.getByRole('button', { name: 'Back' });
      expect(button).toHaveAttribute('aria-label', 'Back');
    });

    it('should use default aria-label from i18n', () => {
      render(<FormActions onSubmit={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('aria-label', 'Submit');
    });

    it('should maintain accessibility when disabled', () => {
      render(<FormActions onSubmit={vi.fn()} isValid={false} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('aria-label');
      expect(button).toBeDisabled();
    });
  });

  describe('Layout and Styling', () => {
    it('should use flexbox layout', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
    });

    it('should justify content to end', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('justify-end');
    });

    it('should have spacing between buttons', () => {
      const { container } = render(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-x-2');
    });

    it('should have padding top', () => {
      const { container } = render(<FormActions onSubmit={vi.fn()} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('pt-4');
    });

    it('should apply minimum width to submit button', () => {
      render(<FormActions onSubmit={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveClass('min-w-32');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty labels', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          submitLabel=""
          cancelLabel=""
        />
      );

      // Should fallback to i18n defaults
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should handle both buttons being disabled', () => {
      render(
        <FormActions
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(<FormActions onSubmit={handleSubmit} />);

      const button = screen.getByRole('button', { name: 'Submit' });

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(3);
    });

    it('should work without any handlers', () => {
      const { container } = render(<FormActions />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render only submit button when no cancel handler', () => {
      render(<FormActions onSubmit={vi.fn()} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    it('should render both buttons when both handlers provided', () => {
      render(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Integration', () => {
    it('should work in form context', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <input type="text" />
          <FormActions onSubmit={handleSubmit} />
        </form>
      );

      const button = screen.getByRole('button', { name: 'Submit' });
      await user.click(button);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should work alongside other form elements', () => {
      const { container } = render(
        <div>
          <input type="text" />
          <textarea />
          <FormActions onSubmit={vi.fn()} />
        </div>
      );

      expect(container.querySelector('input')).toBeInTheDocument();
      expect(container.querySelector('textarea')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <FormActions onSubmit={vi.fn()} isSubmitting={false} />
      );

      expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();

      rerender(<FormActions onSubmit={vi.fn()} isSubmitting={true} />);

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    });
  });

  describe('Conditional Rendering', () => {
    it('should conditionally show cancel button', () => {
      const { rerender } = render(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} showCancel={true} />
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

      rerender(
        <FormActions onSubmit={vi.fn()} onCancel={vi.fn()} showCancel={false} />
      );

      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('should update button states dynamically', () => {
      const { rerender } = render(
        <FormActions onSubmit={vi.fn()} isValid={true} />
      );

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).not.toBeDisabled();

      rerender(<FormActions onSubmit={vi.fn()} isValid={false} />);

      expect(button).toBeDisabled();
    });
  });
});
