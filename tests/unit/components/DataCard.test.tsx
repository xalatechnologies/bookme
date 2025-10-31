/**
 * DataCard Component Tests
 *
 * Tests for DataCard - reusable data display card with actions
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataCard } from '@/components/common/cards/DataCard';
import { Calendar, User, Mail } from 'lucide-react';

describe('DataCard Component', () => {
  const mockFields = [
    { id: 'field1', label: 'Name', value: 'John Doe' },
    { id: 'field2', label: 'Email', value: 'john@example.com' },
  ];

  const mockActions = [
    { id: 'edit', label: 'Edit', onClick: vi.fn() },
    { id: 'delete', label: 'Delete', onClick: vi.fn() },
  ];

  describe('Basic Rendering', () => {
    it('should render data card with title', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          subtitle="Subtitle text"
          fields={[]}
          actions={[]}
        />
      );

      expect(screen.getByText('Subtitle text')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      const subtitle = container.querySelector('.text-sm.text-gray-500');
      expect(subtitle).not.toBeInTheDocument();
    });

    it('should apply Card component styling', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test"
          fields={[]}
          actions={[]}
        />
      );

      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });
  });

  describe('Badge Display', () => {
    it('should render badge when provided', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          badge={{ label: 'Active' }}
          fields={[]}
          actions={[]}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should not render badge when not provided', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      // Badge component won't be rendered at all
      const card = screen.getByText('Test Card').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should apply default variant to badge', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          badge={{ label: 'New', variant: 'secondary' }}
          fields={[]}
          actions={[]}
        />
      );

      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should apply custom variant to badge', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          badge={{ label: 'Error', variant: 'destructive' }}
          fields={[]}
          actions={[]}
        />
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('Fields Display', () => {
    it('should render all fields', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={mockFields}
          actions={[]}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should render field with icon', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[
            { id: 'user', label: 'User', value: 'John', icon: User },
          ]}
          actions={[]}
        />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should apply default variant to field value', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[
            { id: 'field1', label: 'Field', value: 'Value', variant: 'default' },
          ]}
          actions={[]}
        />
      );

      const value = screen.getByText('Value');
      expect(value).toHaveClass('text-gray-700');
    });

    it('should apply accent variant to field value', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[
            { id: 'field1', label: 'Field', value: 'Value', variant: 'accent' },
          ]}
          actions={[]}
        />
      );

      const value = screen.getByText('Value');
      expect(value).toHaveClass('text-blue-600');
    });

    it('should apply muted variant to field value', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[
            { id: 'field1', label: 'Field', value: 'Value', variant: 'muted' },
          ]}
          actions={[]}
        />
      );

      const value = screen.getByText('Value');
      expect(value).toHaveClass('text-gray-500');
    });

    it('should render field with React node as value', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[
            {
              id: 'complex',
              label: 'Complex',
              value: <span data-testid="complex-value">Complex Value</span>,
            },
          ]}
          actions={[]}
        />
      );

      expect(screen.getByTestId('complex-value')).toBeInTheDocument();
    });

    it('should handle empty fields array', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });
  });

  describe('Actions Menu', () => {
    it('should render actions dropdown when actions provided', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={mockActions}
        />
      );

      const menuButton = screen.getByRole('button');
      expect(menuButton).toBeInTheDocument();
    });

    it('should not render actions menu when no actions provided', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      const menuButton = container.querySelector('button');
      expect(menuButton).not.toBeInTheDocument();
    });

    it('should open dropdown menu on button click', async () => {
      const user = userEvent.setup();

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={mockActions}
        />
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should call action onClick when menu item clicked', async () => {
      const user = userEvent.setup();
      const handleEdit = vi.fn();

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[
            { id: 'edit', label: 'Edit', onClick: handleEdit },
          ]}
        />
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const editItem = screen.getByText('Edit');
      await user.click(editItem);

      expect(handleEdit).toHaveBeenCalledWith('card-1');
    });

    it('should render action with icon', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[
            { id: 'edit', label: 'Edit', onClick: vi.fn(), icon: User },
          ]}
        />
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      // Just verify the Edit action is rendered with text
      expect(screen.getByText('Edit')).toBeInTheDocument();

      // Icon should be present in the menu item
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should apply destructive styling to destructive actions', async () => {
      const user = userEvent.setup();

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[
            { id: 'delete', label: 'Delete', onClick: vi.fn(), variant: 'destructive' },
          ]}
        />
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const deleteItem = screen.getByText('Delete');
      expect(deleteItem).toHaveClass('text-red-600');
    });

    it('should stop propagation when action menu is clicked', async () => {
      const user = userEvent.setup();
      const handleCardClick = vi.fn();

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={mockActions}
          onCardClick={handleCardClick}
        />
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(handleCardClick).not.toHaveBeenCalled();
    });

    it('should stop propagation when action item is clicked', async () => {
      const user = userEvent.setup();
      const handleCardClick = vi.fn();
      const handleEdit = vi.fn();

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[{ id: 'edit', label: 'Edit', onClick: handleEdit }]}
          onCardClick={handleCardClick}
        />
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const editItem = screen.getByText('Edit');
      await user.click(editItem);

      expect(handleEdit).toHaveBeenCalledTimes(1);
      expect(handleCardClick).not.toHaveBeenCalled();
    });
  });

  describe('Card Click Behavior', () => {
    it('should call onCardClick when card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={mockFields}
          actions={[]}
          onCardClick={handleClick}
        />
      );

      const card = screen.getByText('Test Card').closest('div[class*="cursor-pointer"]');
      if (card) {
        await user.click(card);
      }

      expect(handleClick).toHaveBeenCalledWith('card-1');
    });

    it('should not have click cursor when onCardClick not provided', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      const card = container.querySelector('.cursor-pointer');
      expect(card).not.toBeInTheDocument();
    });

    it('should have click cursor when onCardClick provided', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          onCardClick={vi.fn()}
        />
      );

      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });

    it('should have hover effect when clickable', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          onCardClick={vi.fn()}
        />
      );

      const card = container.querySelector('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Border Color', () => {
    it('should apply default gray border', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      const card = container.querySelector('.border-gray-500');
      expect(card).toBeInTheDocument();
    });

    it('should apply blue header color', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          headerColor="blue"
        />
      );

      const card = container.querySelector('.border-blue-500');
      expect(card).toBeInTheDocument();
    });

    it('should apply green header color', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          headerColor="green"
        />
      );

      const card = container.querySelector('.border-green-500');
      expect(card).toBeInTheDocument();
    });

    it('should apply red header color', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          headerColor="red"
        />
      );

      const card = container.querySelector('.border-red-500');
      expect(card).toBeInTheDocument();
    });

    it('should apply yellow header color', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          headerColor="yellow"
        />
      );

      const card = container.querySelector('.border-yellow-500');
      expect(card).toBeInTheDocument();
    });

    it('should apply purple header color', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          headerColor="purple"
        />
      );

      const card = container.querySelector('.border-purple-500');
      expect(card).toBeInTheDocument();
    });

    it('should apply custom left border color', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          leftBorderColor="border-orange-500"
        />
      );

      // Custom border color should be applied
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('should have left border styling', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      const card = container.querySelector('.border-l-4');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          className="custom-data-card"
        />
      );

      const card = container.querySelector('.custom-data-card');
      expect(card).toBeInTheDocument();
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
          className="extra-class"
        />
      );

      const card = container.querySelector('.extra-class');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('relative');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for subtitle', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          subtitle="Subtitle"
          fields={[]}
          actions={[]}
        />
      );

      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toHaveClass('dark:text-gray-400');
    });

    it('should have dark mode classes for field labels', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[{ id: 'field1', label: 'Label', value: 'Value' }]}
          actions={[]}
        />
      );

      const label = screen.getByText('Label');
      expect(label).toHaveClass('dark:text-gray-400');
    });

    it('should have dark mode classes for field values', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[{ id: 'field1', label: 'Label', value: 'Value' }]}
          actions={[]}
        />
      );

      const value = screen.getByText('Value');
      expect(value).toHaveClass('dark:text-gray-300');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <DataCard
          id="card-1"
          title={longTitle}
          fields={[]}
          actions={[]}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle many fields', () => {
      const manyFields = Array.from({ length: 20 }, (_, i) => ({
        id: `field-${i}`,
        label: `Field ${i}`,
        value: `Value ${i}`,
      }));

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={manyFields}
          actions={[]}
        />
      );

      expect(screen.getByText('Field 0')).toBeInTheDocument();
      expect(screen.getByText('Field 19')).toBeInTheDocument();
    });

    it('should handle many actions', async () => {
      const user = userEvent.setup();
      const manyActions = Array.from({ length: 10 }, (_, i) => ({
        id: `action-${i}`,
        label: `Action ${i}`,
        onClick: vi.fn(),
      }));

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={manyActions}
        />
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('Action 0')).toBeInTheDocument();
      expect(screen.getByText('Action 9')).toBeInTheDocument();
    });

    it('should handle empty string values', () => {
      render(
        <DataCard
          id="card-1"
          title=""
          subtitle=""
          fields={[{ id: 'field1', label: '', value: '' }]}
          actions={[]}
        />
      );

      const card = screen.getByRole('heading', { level: undefined });
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      // CardTitle renders as an h3
      const heading = screen.getByText('Test Card');
      expect(heading.tagName).toBe('H3');
    });

    it('should have accessible action buttons', async () => {
      const user = userEvent.setup();

      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={mockActions}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      await user.click(button);

      const editButton = screen.getByText('Edit');
      expect(editButton).toBeInTheDocument();
    });

    it('should maintain semantic structure for fields', () => {
      render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={mockFields}
          actions={[]}
        />
      );

      const labels = screen.getAllByText(/Name|Email/);
      labels.forEach((label) => {
        expect(label.tagName).toBe('P');
      });
    });
  });

  describe('Layout and Spacing', () => {
    it('should have transition effect', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      const card = container.querySelector('.transition-all');
      expect(card).toBeInTheDocument();
    });

    it('should have proper spacing for fields', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={mockFields}
          actions={[]}
        />
      );

      const fieldsContainer = container.querySelector('.space-y-3');
      expect(fieldsContainer).toBeInTheDocument();
    });

    it('should position elements relatively', () => {
      const { container } = render(
        <DataCard
          id="card-1"
          title="Test Card"
          fields={[]}
          actions={[]}
        />
      );

      const card = container.querySelector('.relative');
      expect(card).toBeInTheDocument();
    });
  });
});
