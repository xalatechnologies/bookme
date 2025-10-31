/**
 * Tabs Component Tests
 *
 * Tests for the shadcn/ui Tabs component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

describe('Tabs Component', () => {
  describe('Basic Rendering', () => {
    it('should render tabs container', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should render tab triggers', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    });

    it('should render tab content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('TabsList Styling', () => {
    it('should have default styling classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('inline-flex');
      expect(tabsList).toHaveClass('h-10');
      expect(tabsList).toHaveClass('items-center');
      expect(tabsList).toHaveClass('justify-center');
      expect(tabsList).toHaveClass('rounded-md');
      expect(tabsList).toHaveClass('bg-muted');
    });

    it('should apply custom className to TabsList', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('custom-tabs-list');
    });
  });

  describe('TabsTrigger Styling', () => {
    it('should have default styling classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByRole('tab');
      expect(trigger).toHaveClass('inline-flex');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('justify-center');
      expect(trigger).toHaveClass('rounded-sm');
      expect(trigger).toHaveClass('px-3');
      expect(trigger).toHaveClass('text-sm');
      expect(trigger).toHaveClass('font-medium');
    });

    it('should apply custom className to TabsTrigger', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByRole('tab');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should have active state styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const trigger = screen.getByRole('tab');
      expect(trigger.className).toContain('data-[state=active]:bg-background');
      expect(trigger.className).toContain('data-[state=active]:text-foreground');
    });
  });

  describe('Tab Selection', () => {
    it('should have first tab selected by default', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('data-state', 'active');
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch tabs when clicked', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(tab2).toHaveAttribute('data-state', 'active');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('should show correct content when tab is selected', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate tabs with arrow keys', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      tab1.focus();
      expect(tab1).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(tab2).toHaveFocus();
    });

    it('should activate tab on Enter key', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{Enter}');

      expect(tab2).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Disabled State', () => {
    it('should disable tab when disabled prop is true', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toBeDisabled();
    });

    it('should not activate disabled tab when clicked', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(tab2).toHaveAttribute('data-state', 'inactive');
    });

    it('should have disabled styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" disabled>Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByRole('tab');
      expect(trigger).toHaveClass('disabled:pointer-events-none');
      expect(trigger).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab')).toBeInTheDocument();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should have aria-selected on active tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');
    });

    it('should be keyboard accessible', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const tab = screen.getByRole('tab');
      tab.focus();

      expect(tab).toHaveFocus();
    });

    it('should have visible focus indicator', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const trigger = screen.getByRole('tab');
      expect(trigger).toHaveClass('focus-visible:outline-none');
      expect(trigger).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Controlled Tabs', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <Tabs value="tab1" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      await user.click(tab2);

      expect(onValueChange).toHaveBeenCalledWith('tab2');
    });

    it('should update when value prop changes', () => {
      const { rerender } = render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('data-state', 'active');

      rerender(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Multiple Tabs', () => {
    it('should render multiple tab sets independently', () => {
      render(
        <>
          <Tabs defaultValue="set1-tab1">
            <TabsList>
              <TabsTrigger value="set1-tab1">Set 1 Tab 1</TabsTrigger>
            </TabsList>
            <TabsContent value="set1-tab1">Set 1 Content 1</TabsContent>
          </Tabs>
          <Tabs defaultValue="set2-tab1">
            <TabsList>
              <TabsTrigger value="set2-tab1">Set 2 Tab 1</TabsTrigger>
            </TabsList>
            <TabsContent value="set2-tab1">Set 2 Content 1</TabsContent>
          </Tabs>
        </>
      );

      const tablists = screen.getAllByRole('tablist');
      expect(tablists).toHaveLength(2);
    });

    it('should maintain independent state', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Tabs defaultValue="tab1">
            <TabsList aria-label="First tabs">
              <TabsTrigger value="tab1">First Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">First Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">First Content 1</TabsContent>
            <TabsContent value="tab2">First Content 2</TabsContent>
          </Tabs>
          <Tabs defaultValue="tab1">
            <TabsList aria-label="Second tabs">
              <TabsTrigger value="tab1">Second Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Second Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Second Content 1</TabsContent>
            <TabsContent value="tab2">Second Content 2</TabsContent>
          </Tabs>
        </>
      );

      const firstTab2 = screen.getByRole('tab', { name: 'First Tab 2' });
      await user.click(firstTab2);

      expect(firstTab2).toHaveAttribute('data-state', 'active');

      const secondTab1 = screen.getByRole('tab', { name: 'Second Tab 1' });
      expect(secondTab1).toHaveAttribute('data-state', 'active');
    });
  });

  describe('TabsContent', () => {
    it('should have default styling classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const content = screen.getByRole('tabpanel');
      expect(content).toHaveClass('mt-2');
      expect(content).toHaveClass('ring-offset-background');
    });

    it('should apply custom className to TabsContent', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">Content 1</TabsContent>
        </Tabs>
      );

      const content = screen.getByRole('tabpanel');
      expect(content).toHaveClass('custom-content');
    });

    it('should render complex content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div>
              <h3>Title</h3>
              <p>Description</p>
            </div>
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to TabsList', () => {
      const ref = { current: null };

      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to TabsTrigger', () => {
      const ref = { current: null };

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref}>Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to TabsContent', () => {
      const ref = { current: null };

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref}>Content 1</TabsContent>
        </Tabs>
      );

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Use Cases', () => {
    it('should work as settings tabs', () => {
      render(
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="general">General settings</TabsContent>
          <TabsContent value="security">Security settings</TabsContent>
          <TabsContent value="notifications">Notification settings</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument();
      expect(screen.getByText('General settings')).toBeInTheDocument();
    });

    it('should work as content sections', () => {
      render(
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview content</TabsContent>
          <TabsContent value="details">Details content</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByText('Overview content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const tab = screen.getByRole('tab');
      expect(tab).toHaveAttribute('data-state', 'active');
    });

    it('should handle many tabs', () => {
      const tabs = Array.from({ length: 10 }, (_, i) => i + 1);

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            {tabs.map((num) => (
              <TabsTrigger key={num} value={`tab${num}`}>
                Tab {num}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((num) => (
            <TabsContent key={num} value={`tab${num}`}>
              Content {num}
            </TabsContent>
          ))}
        </Tabs>
      );

      const allTabs = screen.getAllByRole('tab');
      expect(allTabs).toHaveLength(10);
    });

    it('should handle empty content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" />
        </Tabs>
      );

      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute on TabsList', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList id="custom-tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveAttribute('id', 'custom-tabs-list');
    });

    it('should support data attributes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="my-tab">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByTestId('my-tab')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle tab navigation with focus', async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });

      tab1.focus();
      expect(tab1).toHaveFocus();

      // After tab key, focus moves to the tabpanel content
      await user.tab();
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toHaveFocus();
    });
  });
});
