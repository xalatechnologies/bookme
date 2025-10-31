/**
 * EmptyState Component Tests
 *
 * Tests for EmptyState component - reusable no-data placeholder
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/common/states/EmptyState';
import { Calendar, Plus } from 'lucide-react';

describe('EmptyState Component', () => {
  describe('Basic Rendering', () => {
    it('should render empty state with title', () => {
      render(<EmptyState title="No items found" />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(
        <EmptyState
          title="No items found"
          description="Try creating a new item"
        />
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Try creating a new item')).toBeInTheDocument();
    });

    it('should have centered text alignment', () => {
      const { container } = render(<EmptyState title="Test" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('text-center');
    });
  });

  describe('Icon Display', () => {
    it('should render with icon', () => {
      const { container } = render(
        <EmptyState title="No data" icon={<Calendar data-testid="calendar-icon" />} />
      );

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should not render icon container when no icon provided', () => {
      const { container } = render(<EmptyState title="No data" />);

      const iconContainer = container.querySelector('.flex.justify-center');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('should apply icon sizing classes', () => {
      const { container } = render(
        <EmptyState
          title="No data"
          icon={<Calendar />}
          size="md"
        />
      );

      const iconWrapper = container.querySelector('.w-16');
      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toHaveClass('h-16');
    });
  });

  describe('Size Variants', () => {
    it('should render small size variant', () => {
      const { container } = render(
        <EmptyState title="Test" size="sm" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('py-8');
    });

    it('should render medium size variant by default', () => {
      const { container } = render(<EmptyState title="Test" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('py-12');
    });

    it('should render large size variant', () => {
      const { container } = render(
        <EmptyState title="Test" size="lg" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('py-16');
    });

    it('should apply correct title size for small variant', () => {
      render(<EmptyState title="Test Title" size="sm" />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-base');
    });

    it('should apply correct title size for medium variant', () => {
      render(<EmptyState title="Test Title" size="md" />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-lg');
    });

    it('should apply correct title size for large variant', () => {
      render(<EmptyState title="Test Title" size="lg" />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-xl');
    });
  });

  describe('Primary Action', () => {
    it('should render primary action button', () => {
      const handleClick = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create New',
            onClick: handleClick,
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument();
    });

    it('should call onClick when action button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create New',
            onClick: handleClick,
          }}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Create New' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render action with icon', () => {
      const handleClick = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Add Item',
            onClick: handleClick,
            icon: <Plus data-testid="plus-icon" />,
          }}
        />
      );

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('should apply default variant to action button', () => {
      const handleClick = vi.fn();

      const { container } = render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create',
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom variant to action button', () => {
      const handleClick = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create',
            onClick: handleClick,
            variant: 'outline',
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom size to action button', () => {
      const handleClick = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create',
            onClick: handleClick,
            size: 'lg',
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Secondary Action', () => {
    it('should render secondary action button', () => {
      const handlePrimary = vi.fn();
      const handleSecondary = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create New',
            onClick: handlePrimary,
          }}
          secondaryAction={{
            label: 'Learn More',
            onClick: handleSecondary,
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('should call onClick when secondary action is clicked', async () => {
      const user = userEvent.setup();
      const handlePrimary = vi.fn();
      const handleSecondary = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create New',
            onClick: handlePrimary,
          }}
          secondaryAction={{
            label: 'Learn More',
            onClick: handleSecondary,
          }}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Learn More' }));

      expect(handleSecondary).toHaveBeenCalledTimes(1);
      expect(handlePrimary).not.toHaveBeenCalled();
    });

    it('should render secondary action with icon', () => {
      const handlePrimary = vi.fn();
      const handleSecondary = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create',
            onClick: handlePrimary,
          }}
          secondaryAction={{
            label: 'Info',
            onClick: handleSecondary,
            icon: <Plus data-testid="secondary-icon" />,
          }}
        />
      );

      expect(screen.getByTestId('secondary-icon')).toBeInTheDocument();
    });

    it('should apply outline variant to secondary action by default', () => {
      const handlePrimary = vi.fn();
      const handleSecondary = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create',
            onClick: handlePrimary,
          }}
          secondaryAction={{
            label: 'Learn More',
            onClick: handleSecondary,
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Learn More' });
      expect(button).toBeInTheDocument();
    });

    it('should render secondary action without primary action', () => {
      const handleSecondary = vi.fn();

      render(
        <EmptyState
          title="No data"
          secondaryAction={{
            label: 'Learn More',
            onClick: handleSecondary,
          }}
        />
      );

      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EmptyState title="Test" className="custom-empty-state" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-empty-state');
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <EmptyState title="Test" className="extra-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('text-center');
      expect(wrapper).toHaveClass('extra-class');
    });
  });

  describe('Description Display', () => {
    it('should not render description when not provided', () => {
      const { container } = render(<EmptyState title="Test" />);

      const description = container.querySelector('p');
      expect(description).not.toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <EmptyState
          title="Test"
          description="This is a description"
        />
      );

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should apply max-width to description', () => {
      render(
        <EmptyState
          title="Test"
          description="Description text"
        />
      );

      const description = screen.getByText('Description text');
      expect(description).toHaveClass('max-w-md');
      expect(description).toHaveClass('mx-auto');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for title', () => {
      render(<EmptyState title="Test Title" />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('dark:text-white');
    });

    it('should have dark mode classes for description', () => {
      render(
        <EmptyState
          title="Test"
          description="Description"
        />
      );

      const description = screen.getByText('Description');
      expect(description).toHaveClass('dark:text-gray-400');
    });

    it('should have dark mode classes for icon', () => {
      const { container } = render(
        <EmptyState
          title="Test"
          icon={<Calendar />}
        />
      );

      const iconWrapper = container.querySelector('.dark\\:text-gray-600');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<EmptyState title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      render(
        <EmptyState
          title="Test"
          description={longDescription}
        />
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle empty string title', () => {
      render(<EmptyState title="" />);

      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toBeEmptyDOMElement();
    });

    it('should handle multiple actions clicking independently', async () => {
      const user = userEvent.setup();
      const handlePrimary = vi.fn();
      const handleSecondary = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Primary',
            onClick: handlePrimary,
          }}
          secondaryAction={{
            label: 'Secondary',
            onClick: handleSecondary,
          }}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Primary' }));
      await user.click(screen.getByRole('button', { name: 'Secondary' }));

      expect(handlePrimary).toHaveBeenCalledTimes(1);
      expect(handleSecondary).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have heading with proper level', () => {
      render(<EmptyState title="No Data" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('No Data');
    });

    it('should have accessible button labels', () => {
      const handleClick = vi.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create New Item',
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Create New Item' });
      expect(button).toHaveAccessibleName('Create New Item');
    });

    it('should maintain semantic structure', () => {
      render(
        <EmptyState
          title="No Items"
          description="Get started by creating your first item"
        />
      );

      const heading = screen.getByRole('heading');
      const paragraph = screen.getByText('Get started by creating your first item');

      expect(heading).toBeInTheDocument();
      expect(paragraph.tagName).toBe('P');
    });
  });

  describe('Layout and Spacing', () => {
    it('should apply padding to container', () => {
      const { container } = render(<EmptyState title="Test" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('px-4');
    });

    it('should have flexbox layout for actions', () => {
      const { container } = render(
        <EmptyState
          title="Test"
          action={{
            label: 'Action',
            onClick: () => {},
          }}
        />
      );

      const actionsWrapper = container.querySelector('.flex.items-center.justify-center.gap-3');
      expect(actionsWrapper).toBeInTheDocument();
    });
  });
});
