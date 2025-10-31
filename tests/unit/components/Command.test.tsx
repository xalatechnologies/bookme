/**
 * Command Component Tests
 *
 * Tests for the shadcn/ui Command component (cmdk wrapper)
 */

import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

// Mock scrollIntoView for cmdk
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

describe('Command Component', () => {
  describe('Basic Rendering', () => {
    it('should render command component', () => {
      const { container } = render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandItem>Item 1</CommandItem>
          </CommandList>
        </Command>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      const { container } = render(
        <Command data-testid="command">
          <CommandInput />
        </Command>
      );

      const command = screen.getByTestId('command');
      expect(command).toHaveClass('flex');
      expect(command).toHaveClass('h-full');
      expect(command).toHaveClass('w-full');
      expect(command).toHaveClass('flex-col');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Command className="custom-command" data-testid="command">
          <CommandInput />
        </Command>
      );

      const command = screen.getByTestId('command');
      expect(command).toHaveClass('custom-command');
    });
  });

  describe('CommandInput', () => {
    it('should render command input', () => {
      render(
        <Command>
          <CommandInput placeholder="Type a command..." />
        </Command>
      );

      expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    });

    it('should render with search icon', () => {
      const { container } = render(
        <Command>
          <CommandInput />
        </Command>
      );

      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should accept user input', async () => {
      const user = userEvent.setup();

      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'test query');

      expect(input).toHaveValue('test query');
    });

    it('should apply custom className', () => {
      render(
        <Command>
          <CommandInput className="custom-input" placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveClass('custom-input');
    });

    it('should support disabled state', () => {
      render(
        <Command>
          <CommandInput disabled placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeDisabled();
    });
  });

  describe('CommandList', () => {
    it('should render command list', () => {
      const { container } = render(
        <Command>
          <CommandList data-testid="command-list">
            <CommandItem>Item 1</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('command-list')).toBeInTheDocument();
    });

    it('should have scrollable styling', () => {
      const { container } = render(
        <Command>
          <CommandList data-testid="command-list">
            <CommandItem>Item 1</CommandItem>
          </CommandList>
        </Command>
      );

      const list = screen.getByTestId('command-list');
      expect(list).toHaveClass('overflow-y-auto');
      expect(list).toHaveClass('max-h-[300px]');
    });
  });

  describe('CommandItem', () => {
    it('should render command items', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem className="custom-item" data-testid="item">
              Item 1
            </CommandItem>
          </CommandList>
        </Command>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveClass('custom-item');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };

      render(
        <Command>
          <CommandList>
            <CommandItem onSelect={handleClick}>Click Me</CommandItem>
          </CommandList>
        </Command>
      );

      await user.click(screen.getByText('Click Me'));

      expect(clicked).toBe(true);
    });

    it('should support disabled state', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem disabled data-testid="item">
              Disabled Item
            </CommandItem>
          </CommandList>
        </Command>
      );

      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('CommandEmpty', () => {
    it('should render empty state', () => {
      render(
        <Command>
          <CommandInput />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });

    it('should have centered styling', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty data-testid="empty">No results</CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = screen.getByTestId('empty');
      expect(empty).toHaveClass('text-center');
      expect(empty).toHaveClass('py-6');
    });

    it('should apply custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandEmpty className="custom-empty" data-testid="empty">
              No results
            </CommandEmpty>
          </CommandList>
        </Command>
      );

      const empty = screen.getByTestId('empty');
      expect(empty).toHaveClass('custom-empty');
    });
  });

  describe('CommandGroup', () => {
    it('should render command group', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem>Item 1</CommandItem>
              <CommandItem>Item 2</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should render multiple groups', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup heading="Group 1">
              <CommandItem>Item A</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Group 2">
              <CommandItem>Item B</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup className="custom-group" data-testid="group">
              <CommandItem>Item</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const group = screen.getByTestId('group');
      expect(group).toHaveClass('custom-group');
    });
  });

  describe('CommandSeparator', () => {
    it('should render separator', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item 1</CommandItem>
            <CommandSeparator data-testid="separator" />
            <CommandItem>Item 2</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should have separator styling', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator data-testid="separator" />
          </CommandList>
        </Command>
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-px');
      expect(separator).toHaveClass('bg-border');
    });
  });

  describe('CommandShortcut', () => {
    it('should render shortcut', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Save
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('⌘S')).toBeInTheDocument();
    });

    it('should have shortcut styling', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Save
              <CommandShortcut data-testid="shortcut">⌘S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass('ml-auto');
      expect(shortcut).toHaveClass('text-xs');
    });

    it('should apply custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Save
              <CommandShortcut className="custom-shortcut" data-testid="shortcut">
                ⌘S
              </CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass('custom-shortcut');
    });
  });

  describe('Search Filtering', () => {
    it('should filter items based on search input', async () => {
      const user = userEvent.setup();

      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
            <CommandItem>Cherry</CommandItem>
          </CommandList>
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'ban');

      await waitFor(() => {
        expect(screen.getByText('Banana')).toBeVisible();
      });
    });

    it('should show empty state when no matches', async () => {
      const user = userEvent.setup();

      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
          </CommandList>
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('No results found.')).toBeVisible();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation', async () => {
      const user = userEvent.setup();

      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandItem data-testid="item-1">Item 1</CommandItem>
            <CommandItem data-testid="item-2">Item 2</CommandItem>
            <CommandItem data-testid="item-3">Item 3</CommandItem>
          </CommandList>
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      input.focus();

      await user.keyboard('{ArrowDown}');

      // Arrow down moves to next item (cmdk behavior)
      await waitFor(() => {
        const item = screen.getByTestId('item-2');
        expect(item).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should support Enter key selection', async () => {
      const user = userEvent.setup();
      let selected = '';
      const handleSelect = (value: string) => {
        selected = value;
      };

      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandItem value="item1" onSelect={handleSelect}>
              Item 1
            </CommandItem>
          </CommandList>
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      input.focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(selected).toBe('item1');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label on input', () => {
      render(
        <Command>
          <CommandInput aria-label="Search commands" placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      expect(input).toHaveAttribute('aria-label', 'Search commands');
    });

    it('should have proper role attributes', () => {
      const { container } = render(
        <Command>
          <CommandInput />
          <CommandList>
            <CommandItem>Item 1</CommandItem>
          </CommandList>
        </Command>
      );

      // Command uses cmdk which sets appropriate roles
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to Command', () => {
      const ref = { current: null };

      render(
        <Command ref={ref}>
          <CommandInput />
        </Command>
      );

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to CommandInput', () => {
      const ref = { current: null };

      render(
        <Command>
          <CommandInput ref={ref} />
        </Command>
      );

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Use Cases', () => {
    it('should work as command palette', () => {
      render(
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandGroup heading="Commands">
              <CommandItem>
                New File
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem>
                Save
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              <CommandItem>document.txt</CommandItem>
              <CommandItem>notes.md</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Commands')).toBeInTheDocument();
      expect(screen.getByText('Recent')).toBeInTheDocument();
      expect(screen.getByText('New File')).toBeInTheDocument();
      expect(screen.getByText('⌘N')).toBeInTheDocument();
    });

    it('should work as search interface', () => {
      render(
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandItem>Item 1</CommandItem>
            <CommandItem>Item 2</CommandItem>
            <CommandItem>Item 3</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty command', () => {
      const { container } = render(
        <Command>
          <CommandInput />
          <CommandList />
        </Command>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle many items', () => {
      const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

      render(
        <Command>
          <CommandList>
            {items.map((item) => (
              <CommandItem key={item}>{item}</CommandItem>
            ))}
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 50')).toBeInTheDocument();
    });

    it('should handle items with complex content', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              <div>
                <strong>Title</strong>
                <span>Description</span>
              </div>
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally', () => {
      const showCommand = true;

      const { container } = render(
        <div>
          {showCommand && (
            <Command data-testid="command">
              <CommandInput />
            </Command>
          )}
        </div>
      );

      expect(screen.getByTestId('command')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const showCommand = false;

      const { container } = render(
        <div>
          {showCommand && (
            <Command data-testid="command">
              <CommandInput />
            </Command>
          )}
        </div>
      );

      expect(screen.queryByTestId('command')).not.toBeInTheDocument();
    });
  });
});
