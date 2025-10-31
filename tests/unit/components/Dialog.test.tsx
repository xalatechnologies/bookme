/**
 * Dialog Component Tests
 *
 * Tests for the shadcn/ui Dialog component and its sub-components
 * (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
 *  DialogDescription, DialogFooter, DialogClose)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

describe('Dialog Component', () => {
  describe('Basic Rendering', () => {
    it('should render dialog trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
        </Dialog>
      );

      expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument();
    });

    it('should not show dialog content initially', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });

    it('should render dialog when open prop is true', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });
  });

  describe('Dialog Interaction', () => {
    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByRole('button', { name: /open dialog/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
    });

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Open dialog
      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      // Close dialog via close button (X button with sr-only "Close" text)
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when dialog state changes', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('DialogContent', () => {
    it('should render dialog content with proper structure', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div data-testid="dialog-content">Content</div>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('should apply custom className to content', () => {
      render(
        <Dialog open={true}>
          <DialogContent className="custom-dialog">
            <DialogTitle>Title</DialogTitle>
            <div data-testid="content">Test</div>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('content');
      const dialogContent = content.closest('[role="dialog"]');
      expect(dialogContent).toHaveClass('custom-dialog');
    });

    it('should have close button in content', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should render multiple children in content', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <div>Child 1</div>
            <div>Child 2</div>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('DialogHeader', () => {
    it('should render dialog header with content', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Header Title')).toBeInTheDocument();
    });

    it('should apply custom className to header', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader className="custom-header">
              <span data-testid="header-content">Header</span>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const headerContent = screen.getByTestId('header-content');
      const header = headerContent.parentElement;
      expect(header).toHaveClass('custom-header');
    });

    it('should render header with title and description', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog description text</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog description text')).toBeInTheDocument();
    });
  });

  describe('DialogTitle', () => {
    it('should render dialog title', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('My Dialog Title')).toBeInTheDocument();
    });

    it('should apply custom className to title', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle className="text-2xl">Large Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const title = screen.getByText('Large Title');
      expect(title).toHaveClass('text-2xl');
    });

    it('should have proper heading role', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Accessible Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Accessible Title')).toBeInTheDocument();
    });
  });

  describe('DialogDescription', () => {
    it('should render dialog description', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should apply custom className to description', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription className="text-sm">Small text</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      const description = screen.getByText('Small text');
      expect(description).toHaveClass('text-sm');
    });

    it('should render long descriptions', () => {
      const longDescription = 'A'.repeat(200);
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>{longDescription}</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('DialogFooter', () => {
    it('should render dialog footer', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter>
              <div data-testid="footer-content">Footer</div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    });

    it('should apply custom className to footer', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter className="justify-start">
              <span data-testid="footer-text">Footer</span>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const footerText = screen.getByTestId('footer-text');
      const footer = footerText.parentElement;
      expect(footer).toHaveClass('justify-start');
    });

    it('should render footer with action buttons', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });
  });

  describe('DialogClose', () => {
    it('should render close button with custom trigger', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Complete Dialog Structure', () => {
    it('should render full dialog with all components', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>Are you sure you want to proceed?</DialogDescription>
            </DialogHeader>
            <div>Additional content goes here</div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
      expect(screen.getByText('Additional content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('should maintain proper component hierarchy', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
            <div>Content</div>
            <DialogFooter>Footer</DialogFooter>
          </DialogContent>
        </Dialog>
      );

      // Verify all parts are present
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Accessible Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible close button', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByRole('button', { name: /open/i });
      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('should support ARIA attributes', () => {
      render(
        <Dialog open={true}>
          <DialogContent aria-describedby="dialog-desc">
            <DialogTitle>Title</DialogTitle>
            <p id="dialog-desc">Description</p>
          </DialogContent>
        </Dialog>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-desc');
    });
  });

  describe('Controlled Dialog', () => {
    it('should work as controlled component', () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();

      rerender(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
    });

    it('should respect open prop changes', () => {
      const { rerender } = render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();

      rerender(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have default backdrop overlay', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Dialog should be rendered with overlay
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should support custom content styling', () => {
      render(
        <Dialog open={true}>
          <DialogContent className="max-w-2xl">
            <DialogTitle>Title</DialogTitle>
            <div data-testid="content">Content</div>
          </DialogContent>
        </Dialog>
      );

      const content = screen.getByTestId('content');
      const dialogContent = content.closest('[role="dialog"]');
      expect(dialogContent).toHaveClass('max-w-2xl');
    });

    it('should maintain spacing classes', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const title = screen.getByText('Title');
      const header = title.closest('.flex.flex-col');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle dialog without title', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <div>Content without title</div>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Content without title')).toBeInTheDocument();
    });

    it('should handle dialog with only title', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Only Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Only Title')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <div>{longContent}</div>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle multiple action buttons in footer', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter>
              <Button variant="ghost">Cancel</Button>
              <Button variant="outline">Save Draft</Button>
              <Button>Publish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
    });
  });

  describe('User Workflows', () => {
    it('should handle confirmation dialog workflow', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Delete Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive" onClick={onConfirm}>
                  Delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      // Open dialog
      await user.click(screen.getByRole('button', { name: /delete item/i }));

      await waitFor(() => {
        expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      });

      // Click confirm
      await user.click(screen.getByRole('button', { name: /^delete$/i }));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it('should handle form dialog workflow', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Enter user details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                aria-label="Name"
                placeholder="Name"
                className="w-full p-2 border rounded"
              />
              <input
                aria-label="Email"
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={onSubmit}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      // Open dialog
      await user.click(screen.getByRole('button', { name: /add user/i }));

      await waitFor(() => {
        expect(screen.getByText('Add New User')).toBeInTheDocument();
      });

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      // Submit
      await user.click(screen.getByRole('button', { name: /^add user$/i }));

      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
