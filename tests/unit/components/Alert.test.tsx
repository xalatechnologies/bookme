/**
 * Alert Component Tests
 *
 * Tests for the shadcn/ui Alert component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

describe('Alert Component', () => {
  describe('Basic Rendering', () => {
    it('should render alert element', () => {
      render(<Alert>Alert message</Alert>);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render as div element', () => {
      const { container } = render(<Alert>Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert.tagName).toBe('DIV');
    });

    it('should render children correctly', () => {
      render(<Alert>This is an alert</Alert>);

      expect(screen.getByText('This is an alert')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Alert className="custom-alert">Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
    });

    it('should have default styling classes', () => {
      render(<Alert>Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('relative');
      expect(alert).toHaveClass('w-full');
      expect(alert).toHaveClass('rounded-lg');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('p-4');
    });

    it('should have role="alert"', () => {
      render(<Alert>Alert message</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('role', 'alert');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Alert variant="default">Default Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('text-foreground');
    });

    it('should render destructive variant', () => {
      render(<Alert variant="destructive">Error Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('border-destructive/50');
      expect(alert.className).toContain('text-destructive');
    });

    it('should use default variant when no variant specified', () => {
      render(<Alert>No Variant</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background');
    });
  });

  describe('AlertTitle Component', () => {
    it('should render AlertTitle', () => {
      render(<AlertTitle>Alert Title</AlertTitle>);

      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });

    it('should render as h5 element', () => {
      const { container } = render(<AlertTitle>Title</AlertTitle>);

      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H5');
    });

    it('should have default styling classes', () => {
      render(<AlertTitle>Title</AlertTitle>);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('mb-1');
      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('tracking-tight');
    });

    it('should apply custom className', () => {
      render(<AlertTitle className="custom-title">Title</AlertTitle>);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('AlertDescription Component', () => {
    it('should render AlertDescription', () => {
      render(<AlertDescription>Alert description text</AlertDescription>);

      expect(screen.getByText('Alert description text')).toBeInTheDocument();
    });

    it('should render as div element', () => {
      const { container } = render(<AlertDescription>Description</AlertDescription>);

      const description = screen.getByText('Description');
      expect(description.tagName).toBe('DIV');
    });

    it('should have default styling classes', () => {
      render(<AlertDescription>Description</AlertDescription>);

      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-sm');
    });

    it('should apply custom className', () => {
      render(<AlertDescription className="custom-desc">Description</AlertDescription>);

      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });
  });

  describe('Composed Alert', () => {
    it('should render alert with title and description', () => {
      render(
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your changes have been saved.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument();
    });

    it('should render alert with only title', () => {
      render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should render alert with only description', () => {
      render(
        <Alert>
          <AlertDescription>This is important information.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('This is important information.')).toBeInTheDocument();
    });

    it('should render destructive alert with title and description', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('text-destructive');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('should render with icon', () => {
      render(
        <Alert>
          <svg data-testid="alert-icon" width="16" height="16">
            <circle cx="8" cy="8" r="8" />
          </svg>
          <AlertTitle>Title with icon</AlertTitle>
        </Alert>
      );

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByText('Title with icon')).toBeInTheDocument();
    });

    it('should support icon with description', () => {
      render(
        <Alert>
          <svg data-testid="info-icon" width="16" height="16">
            <circle cx="8" cy="8" r="8" />
          </svg>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Please read carefully.</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('Please read carefully.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" attribute', () => {
      render(<Alert>Alert message</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('should support aria-label', () => {
      render(<Alert aria-label="Custom alert">Content</Alert>);

      const alert = screen.getByLabelText('Custom alert');
      expect(alert).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Alert aria-describedby="alert-desc">Alert</Alert>
          <p id="alert-desc">Additional context</p>
        </>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-describedby', 'alert-desc');
    });

    it('should be identifiable by screen readers', () => {
      render(
        <Alert>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>Critical information</AlertDescription>
        </Alert>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should support aria-live for dynamic content', () => {
      render(<Alert aria-live="polite">Dynamic alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Alert id="custom-alert">Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('id', 'custom-alert');
    });

    it('should support data attributes', () => {
      render(<Alert data-testid="my-alert">Alert</Alert>);

      expect(screen.getByTestId('my-alert')).toBeInTheDocument();
    });

    it('should support title attribute', () => {
      render(<Alert title="Alert tooltip">Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('title', 'Alert tooltip');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to Alert element', () => {
      const ref = { current: null };

      render(<Alert ref={ref}>Alert</Alert>);

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to AlertTitle element', () => {
      const ref = { current: null };

      render(<AlertTitle ref={ref}>Title</AlertTitle>);

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to AlertDescription element', () => {
      const ref = { current: null };

      render(<AlertDescription ref={ref}>Description</AlertDescription>);

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Content Types', () => {
    it('should render simple text content', () => {
      render(<Alert>Simple message</Alert>);

      expect(screen.getByText('Simple message')).toBeInTheDocument();
    });

    it('should render with nested elements', () => {
      render(
        <Alert>
          <AlertTitle>
            <strong>Bold Title</strong>
          </AlertTitle>
          <AlertDescription>
            <em>Italic description</em>
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Bold Title')).toBeInTheDocument();
      expect(screen.getByText('Italic description')).toBeInTheDocument();
    });

    it('should render with paragraph in description', () => {
      render(
        <Alert>
          <AlertDescription>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  describe('Multiple Alerts', () => {
    it('should render multiple alerts independently', () => {
      render(
        <div>
          <Alert variant="default">Default alert</Alert>
          <Alert variant="destructive">Error alert</Alert>
        </div>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
    });

    it('should maintain individual styling', () => {
      render(
        <div>
          <Alert variant="default">Alert 1</Alert>
          <Alert variant="destructive">Alert 2</Alert>
        </div>
      );

      const alert1 = screen.getByText('Alert 1').closest('[role="alert"]');
      const alert2 = screen.getByText('Alert 2').closest('[role="alert"]');

      expect(alert1).toHaveClass('bg-background');
      expect(alert2?.className).toContain('text-destructive');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty alert', () => {
      const { container } = render(<Alert />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(500);
      render(<Alert>{longText}</Alert>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Alert>Alert with &amp; special characters</Alert>);

      expect(screen.getByText(/Alert with & special/)).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      render(<Alert>警告 ⚠️ 알림</Alert>);

      expect(screen.getByText(/警告/)).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as success notification', () => {
      render(
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your profile has been updated successfully.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Your profile has been updated successfully.')).toBeInTheDocument();
    });

    it('should work as error message', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to save changes. Please try again.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('text-destructive');
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should work as informational message', () => {
      render(
        <Alert>
          <AlertTitle>Did you know?</AlertTitle>
          <AlertDescription>You can customize your profile settings anytime.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Did you know?')).toBeInTheDocument();
    });

    it('should work as warning banner', () => {
      render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Your session will expire in 5 minutes.')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on error state', () => {
      const hasError = true;

      render(
        <div>
          {hasError && (
            <Alert variant="destructive">
              <AlertTitle>Error occurred</AlertTitle>
            </Alert>
          )}
        </div>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const hasError = false;

      render(
        <div>
          {hasError && (
            <Alert variant="destructive">
              <AlertTitle>Error occurred</AlertTitle>
            </Alert>
          )}
        </div>
      );

      expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
    });

    it('should render different variants based on status', () => {
      const status = 'error';

      render(
        <Alert variant={status === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{status.toUpperCase()}</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('text-destructive');
    });
  });

  describe('Styling', () => {
    it('should have full width', () => {
      render(<Alert>Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('w-full');
    });

    it('should have rounded corners', () => {
      render(<Alert>Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('rounded-lg');
    });

    it('should have padding', () => {
      render(<Alert>Alert</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('p-4');
    });

    it('should support custom styling', () => {
      render(<Alert className="bg-blue-100 border-blue-500">Custom styled</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-blue-100');
      expect(alert).toHaveClass('border-blue-500');
    });
  });

  describe('Complex Scenarios', () => {
    it('should render alert with multiple description paragraphs', () => {
      render(
        <Alert>
          <AlertTitle>Update Available</AlertTitle>
          <AlertDescription>
            <p>A new version is available.</p>
            <p>Update now to get the latest features.</p>
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Update Available')).toBeInTheDocument();
      expect(screen.getByText('A new version is available.')).toBeInTheDocument();
      expect(screen.getByText('Update now to get the latest features.')).toBeInTheDocument();
    });

    it('should render alert with icon, title, and description', () => {
      render(
        <Alert variant="destructive">
          <svg data-testid="error-icon" width="16" height="16">
            <circle cx="8" cy="8" r="8" />
          </svg>
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            Unable to connect to the server. Please check your internet connection.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      expect(screen.getByText('Connection Failed')).toBeInTheDocument();
      expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
    });

    it('should render stacked alerts', () => {
      render(
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>First alert</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Second alert</AlertDescription>
          </Alert>
        </div>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
      expect(screen.getByText('First alert')).toBeInTheDocument();
      expect(screen.getByText('Second alert')).toBeInTheDocument();
    });
  });
});
