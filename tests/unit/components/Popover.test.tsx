/**
 * Popover Component Tests
 *
 * Tests for the shadcn/ui Popover component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

describe('Popover Component', () => {
  describe('Basic Rendering', () => {
    it('should render popover trigger', () => {
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    });

    it('should not show content by default', () => {
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should show content when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Popover Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover Content')).toBeInTheDocument();
      });
    });
  });

  describe('PopoverContent Styling', () => {
    it('should have default styling classes', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('popover-content');
        expect(content).toHaveClass('z-50');
        expect(content).toHaveClass('w-72');
        expect(content).toHaveClass('rounded-md');
        expect(content).toHaveClass('border');
        expect(content).toHaveClass('bg-popover');
        expect(content).toHaveClass('p-4');
        expect(content).toHaveClass('shadow-md');
      });
    });

    it('should apply custom className', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent className="custom-popover" data-testid="popover-content">
            Content
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('popover-content');
        expect(content).toHaveClass('custom-popover');
      });
    });
  });

  describe('User Interaction', () => {
    it('should open popover on trigger click', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover is open</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Open Popover' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover is open')).toBeInTheDocument();
      });
    });

    it('should close popover when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button data-testid="outside">Outside</button>
          <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>Content</PopoverContent>
          </Popover>
        </div>
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      const outside = screen.getByTestId('outside');
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });

    it('should close popover on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Controlled Popover', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Popover open={false} onOpenChange={onOpenChange}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('should update when open prop changes', async () => {
      const { rerender } = render(
        <Popover open={false}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <Popover open={true}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });
  });

  describe('Alignment', () => {
    it('should support center alignment by default', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('popover-content');
        expect(content).toHaveAttribute('data-align', 'center');
      });
    });

    it('should support custom alignment', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent align="start" data-testid="popover-content">
            Content
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('popover-content');
        expect(content).toHaveAttribute('data-align', 'start');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on trigger', () => {
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when opened', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      trigger.focus();

      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });
  });

  describe('Content Types', () => {
    it('should render text content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Simple text content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Simple text content')).toBeInTheDocument();
      });
    });

    it('should render complex content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <div>
              <h3>Title</h3>
              <p>Description</p>
              <button>Action</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      });
    });

    it('should render form elements', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <form>
              <input type="text" placeholder="Enter text" />
              <button type="submit">Submit</button>
            </form>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      });
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to PopoverContent', async () => {
      const user = userEvent.setup();
      const ref = { current: null };

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent ref={ref}>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });
    });
  });

  describe('Use Cases', () => {
    it('should work as info popover', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>?</PopoverTrigger>
          <PopoverContent>
            <p>This is helpful information about the feature.</p>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: '?' });
      await user.click(trigger);

      await waitFor(() => {
        expect(
          screen.getByText('This is helpful information about the feature.')
        ).toBeInTheDocument();
      });
    });

    it('should work as menu popover', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Options</PopoverTrigger>
          <PopoverContent>
            <button>Edit</button>
            <button>Delete</button>
            <button>Share</button>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Options' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
      });
    });

    it('should work as date picker container', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Select Date</PopoverTrigger>
          <PopoverContent>
            <div>Calendar Component</div>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Select Date' });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Calendar Component')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover-content" />
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId('popover-content')).toBeInTheDocument();
      });
    });

    it('should handle very long content', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(500);

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>{longText}</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument();
      });
    });

    it('should handle rapid open/close', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');

      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });

      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Popovers', () => {
    it('should render multiple popovers independently', () => {
      render(
        <>
          <Popover>
            <PopoverTrigger>Open 1</PopoverTrigger>
            <PopoverContent>Content 1</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>Open 2</PopoverTrigger>
            <PopoverContent>Content 2</PopoverContent>
          </Popover>
        </>
      );

      expect(screen.getByRole('button', { name: 'Open 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open 2' })).toBeInTheDocument();
    });

    it('should maintain independent state', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Popover>
            <PopoverTrigger>Open 1</PopoverTrigger>
            <PopoverContent>Content 1</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>Open 2</PopoverTrigger>
            <PopoverContent>Content 2</PopoverContent>
          </Popover>
        </>
      );

      const trigger1 = screen.getByRole('button', { name: 'Open 1' });
      await user.click(trigger1);

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });

      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });
  });

  describe('Portal Behavior', () => {
    it('should render content in portal', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('popover-content');
        expect(content).toBeInTheDocument();
        // Portal content is rendered and has special data attribute
        expect(content.parentElement).toHaveAttribute('data-radix-popper-content-wrapper');
      });
    });
  });

  describe('Animation States', () => {
    it('should have animation classes', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover-content">Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('popover-content');
        expect(content.className).toContain('data-[state=open]:animate-in');
        expect(content.className).toContain('data-[state=closed]:animate-out');
      });
    });
  });
});
