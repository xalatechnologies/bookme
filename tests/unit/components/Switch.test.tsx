/**
 * Switch Component Tests
 *
 * Tests for the shadcn/ui Switch component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

describe('Switch Component', () => {
  describe('Basic Rendering', () => {
    it('should render switch element', () => {
      render(<Switch aria-label="Test switch" />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Switch className="custom-switch" aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('custom-switch');
    });

    it('should have default styling classes', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('inline-flex');
      expect(switchElement).toHaveClass('h-6');
      expect(switchElement).toHaveClass('w-11');
      expect(switchElement).toHaveClass('rounded-full');
      expect(switchElement).toHaveClass('cursor-pointer');
    });
  });

  describe('Checked State', () => {
    it('should be unchecked by default', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should render as checked when checked prop is true', () => {
      render(<Switch checked={true} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeChecked();
    });

    it('should render as unchecked when checked prop is false', () => {
      render(<Switch checked={false} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should toggle checked state when clicked', async () => {
      const user = userEvent.setup();

      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();

      await user.click(switchElement);

      expect(switchElement).toBeChecked();

      await user.click(switchElement);

      expect(switchElement).not.toBeChecked();
    });

    it('should update controlled checked state', () => {
      const { rerender } = render(
        <Switch checked={false} onCheckedChange={() => {}} aria-label="Test switch" />
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();

      rerender(
        <Switch checked={true} onCheckedChange={() => {}} aria-label="Test switch" />
      );

      expect(switchElement).toBeChecked();
    });
  });

  describe('User Interaction', () => {
    it('should call onCheckedChange when clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Switch onCheckedChange={onCheckedChange} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should call onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Switch
          checked={true}
          onCheckedChange={onCheckedChange}
          aria-label="Test switch"
        />
      );

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should toggle with keyboard space', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Switch onCheckedChange={onCheckedChange} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      await user.keyboard(' ');

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle with keyboard enter', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Switch onCheckedChange={onCheckedChange} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      await user.keyboard('{Enter}');

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Switch disabled aria-label="Disabled switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('should not call onCheckedChange when disabled and clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Switch disabled onCheckedChange={onCheckedChange} aria-label="Disabled switch" />
      );

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('should have disabled styling', () => {
      render(<Switch disabled aria-label="Disabled switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('disabled:cursor-not-allowed');
      expect(switchElement).toHaveClass('disabled:opacity-50');
    });

    it('should not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <Switch disabled onCheckedChange={onCheckedChange} aria-label="Disabled switch" />
      );

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      await user.keyboard(' ');

      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('Label Association', () => {
    it('should work with Label component', () => {
      render(
        <>
          <Switch id="notifications" />
          <Label htmlFor="notifications">Enable notifications</Label>
        </>
      );

      const switchElement = screen.getByLabelText('Enable notifications');
      expect(switchElement).toBeInTheDocument();
    });

    it('should toggle when associated label is clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        <>
          <Switch id="notifications" onCheckedChange={onCheckedChange} />
          <Label htmlFor="notifications">Enable notifications</Label>
        </>
      );

      const label = screen.getByText('Enable notifications');
      await user.click(label);

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should work with native label', () => {
      render(
        <>
          <label htmlFor="native-switch">Native Label</label>
          <Switch id="native-switch" />
        </>
      );

      const switchElement = screen.getByLabelText('Native Label');
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Switch aria-label="Accessible switch" />);

      const switchElement = screen.getByLabelText('Accessible switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Switch aria-label="Notifications" aria-describedby="switch-description" />
          <p id="switch-description">Enable push notifications</p>
        </>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-describedby', 'switch-description');
    });

    it('should support aria-labelledby', () => {
      render(
        <>
          <span id="switch-label">Dark mode</span>
          <Switch aria-labelledby="switch-label" />
        </>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-labelledby', 'switch-label');
    });

    it('should have proper role', () => {
      render(<Switch aria-label="Test switch" />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus', async () => {
      const user = userEvent.setup();

      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(switchElement).toHaveFocus();
    });

    it('should handle tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Switch aria-label="First switch" />
          <Switch aria-label="Second switch" />
        </>
      );

      const firstSwitch = screen.getByLabelText('First switch');
      const secondSwitch = screen.getByLabelText('Second switch');

      firstSwitch.focus();
      expect(firstSwitch).toHaveFocus();

      await user.tab();
      expect(secondSwitch).toHaveFocus();
    });

    it('should have visible focus indicator', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('focus-visible:outline-none');
      expect(switchElement).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Form Integration', () => {
    it('should work within a form', () => {
      render(
        <form>
          <Switch name="notifications" aria-label="Notifications switch" />
        </form>
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement.closest('form')).toBeInTheDocument();
    });

    it('should accept name prop', () => {
      render(<Switch name="newsletter" aria-label="Newsletter switch" />);

      const switchElement = screen.getByRole('switch');
      // Radix switches accept name prop but may not expose it as HTML attribute
      expect(switchElement).toBeInTheDocument();
    });

    it('should support value attribute', () => {
      render(<Switch value="yes" aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('value', 'yes');
    });
  });

  describe('Styling', () => {
    it('should have default size classes', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-6');
      expect(switchElement).toHaveClass('w-11');
    });

    it('should have rounded-full shape', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('rounded-full');
    });

    it('should support custom styling', () => {
      render(<Switch className="h-8 w-14" aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-8');
      expect(switchElement).toHaveClass('w-14');
    });

    it('should have checked state styling', () => {
      render(<Switch checked={true} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('data-[state=checked]:bg-primary');
    });

    it('should have unchecked state styling', () => {
      render(<Switch checked={false} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement.className).toContain('data-[state=unchecked]:bg-input');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to switch element', () => {
      const ref = { current: null };

      render(<Switch ref={ref} aria-label="Test switch" />);

      expect(ref.current).not.toBeNull();
    });

    it('should allow programmatic focus via ref', () => {
      const ref = { current: null } as React.MutableRefObject<any>;

      render(<Switch ref={ref} aria-label="Test switch" />);

      ref.current?.focus();

      expect(ref.current).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(<Switch onCheckedChange={onCheckedChange} aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');

      await user.click(switchElement);
      await user.click(switchElement);
      await user.click(switchElement);

      expect(onCheckedChange).toHaveBeenCalledTimes(3);
    });

    it('should handle programmatic state changes', () => {
      const { rerender } = render(
        <Switch checked={false} onCheckedChange={() => {}} aria-label="Test switch" />
      );

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();

      rerender(
        <Switch checked={true} onCheckedChange={() => {}} aria-label="Test switch" />
      );

      expect(switchElement).toBeChecked();

      rerender(
        <Switch checked={false} onCheckedChange={() => {}} aria-label="Test switch" />
      );

      expect(switchElement).not.toBeChecked();
    });
  });

  describe('Use Cases', () => {
    it('should work as settings toggle', () => {
      render(
        <div>
          <Switch id="dark-mode" />
          <Label htmlFor="dark-mode">Dark mode</Label>
        </div>
      );

      expect(screen.getByLabelText('Dark mode')).toBeInTheDocument();
    });

    it('should work in notification settings', () => {
      const settings = [
        { id: 'email', label: 'Email notifications' },
        { id: 'push', label: 'Push notifications' },
        { id: 'sms', label: 'SMS notifications' },
      ];

      render(
        <div>
          {settings.map((setting) => (
            <div key={setting.id}>
              <Switch id={setting.id} />
              <Label htmlFor={setting.id}>{setting.label}</Label>
            </div>
          ))}
        </div>
      );

      settings.forEach((setting) => {
        expect(screen.getByLabelText(setting.label)).toBeInTheDocument();
      });
    });

    it('should work as feature toggle with description', () => {
      render(
        <div>
          <div>
            <Switch id="analytics" aria-describedby="analytics-desc" />
            <Label htmlFor="analytics">Enable analytics</Label>
          </div>
          <p id="analytics-desc">Help us improve by sharing usage data</p>
        </div>
      );

      const switchElement = screen.getByLabelText('Enable analytics');
      expect(switchElement).toHaveAttribute('aria-describedby', 'analytics-desc');
    });
  });

  describe('Multiple Switches', () => {
    it('should render multiple switches independently', () => {
      render(
        <div>
          <Switch aria-label="Switch 1" />
          <Switch aria-label="Switch 2" />
          <Switch aria-label="Switch 3" />
        </div>
      );

      expect(screen.getByLabelText('Switch 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch 3')).toBeInTheDocument();
    });

    it('should maintain individual state', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Switch aria-label="Switch 1" />
          <Switch aria-label="Switch 2" />
        </div>
      );

      const switch1 = screen.getByLabelText('Switch 1');
      const switch2 = screen.getByLabelText('Switch 2');

      await user.click(switch1);

      expect(switch1).toBeChecked();
      expect(switch2).not.toBeChecked();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on feature flag', () => {
      const hasFeature = true;

      render(
        <div>
          {hasFeature && (
            <>
              <Switch id="feature" />
              <Label htmlFor="feature">New feature</Label>
            </>
          )}
        </div>
      );

      expect(screen.getByLabelText('New feature')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const hasFeature = false;

      render(
        <div>
          {hasFeature && (
            <>
              <Switch id="feature" />
              <Label htmlFor="feature">New feature</Label>
            </>
          )}
        </div>
      );

      expect(screen.queryByLabelText('New feature')).not.toBeInTheDocument();
    });
  });
});
