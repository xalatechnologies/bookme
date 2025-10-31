/**
 * Accordion Component Tests
 *
 * Tests for the shadcn/ui Accordion component
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

describe('Accordion Component', () => {
  describe('Basic Rendering', () => {
    it('should render accordion with single item', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('should render accordion with multiple items', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Item 3</AccordionTrigger>
            <AccordionContent>Content 3</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should not show content by default', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      // Content is hidden (has hidden attribute)
      const content = screen.queryByText('Content 1');
      // Content might not be in DOM or be hidden
      if (content) {
        expect(content).not.toBeVisible();
      }
    });
  });

  describe('AccordionItem Styling', () => {
    it('should have default styling classes', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" data-testid="accordion-item">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const item = screen.getByTestId('accordion-item');
      expect(item).toHaveClass('border-b');
    });

    it('should apply custom className to AccordionItem', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="custom-item" data-testid="accordion-item">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const item = screen.getByTestId('accordion-item');
      expect(item).toHaveClass('custom-item');
    });
  });

  describe('AccordionTrigger Styling', () => {
    it('should have default styling classes', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('flex-1');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('justify-between');
      expect(trigger).toHaveClass('py-4');
      expect(trigger).toHaveClass('font-medium');
    });

    it('should apply custom className to AccordionTrigger', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="custom-trigger">Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should render chevron icon', () => {
      const { container } = render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('User Interaction - Single Type', () => {
    it('should expand item when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });
    });

    it('should collapse item when trigger is clicked again', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');

      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });

      await user.click(trigger);
      await waitFor(() => {
        const content = screen.queryByText('Content 1');
        // Content might be removed from DOM when closed
        expect(content === null || !content.isConnected).toBe(true);
      });
    });

    it('should collapse previous item when opening new item', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      await user.click(trigger1);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });

      await user.click(trigger2);
      await waitFor(() => {
        expect(screen.getByText('Content 2')).toBeVisible();
        // Content 1 should be hidden or removed
        const content1 = screen.queryByText('Content 1');
        expect(content1 === null || !content1.isConnected).toBe(true);
      });
    });
  });

  describe('User Interaction - Multiple Type', () => {
    it('should allow multiple items to be open', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      await user.click(trigger1);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });

      await user.click(trigger2);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
        expect(screen.getByText('Content 2')).toBeVisible();
      });
    });

    it('should allow closing individual items', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      await user.click(trigger1);
      await user.click(trigger2);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
        expect(screen.getByText('Content 2')).toBeVisible();
      });

      await user.click(trigger1);
      await waitFor(() => {
        const content1 = screen.queryByText('Content 1');
        expect(content1 === null || !content1.isConnected).toBe(true);
        expect(screen.getByText('Content 2')).toBeVisible();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should activate item with Enter key', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      trigger.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });
    });

    it('should activate item with Space key', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      trigger.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on trigger', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when opened', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should be keyboard accessible', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      trigger.focus();

      expect(trigger).toHaveFocus();
    });
  });

  describe('AccordionContent', () => {
    it('should have default styling classes', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      await user.click(trigger);

      await waitFor(() => {
        // Styling is on the inner div wrapper - need to access parent's first child
        const contentRegion = screen.getByRole('region');
        const innerDiv = contentRegion.firstElementChild as HTMLElement;
        expect(innerDiv).toHaveClass('pb-4');
        expect(innerDiv).toHaveClass('pt-0');
      });
    });

    it('should apply custom className to AccordionContent', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent className="custom-content">
              Content 1
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      await user.click(trigger);

      await waitFor(() => {
        // Custom className is applied to the inner div wrapper
        const contentRegion = screen.getByRole('region');
        const innerDiv = contentRegion.firstElementChild as HTMLElement;
        expect(innerDiv).toHaveClass('custom-content');
      });
    });

    it('should render complex content', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>
              <div>
                <h4>Title</h4>
                <p>Paragraph</p>
                <button>Action</button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeVisible();
        expect(screen.getByText('Paragraph')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Action' })).toBeVisible();
      });
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to AccordionItem', () => {
      const ref = { current: null };

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" ref={ref}>
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to AccordionTrigger', () => {
      const ref = { current: null };

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger ref={ref}>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(ref.current).not.toBeNull();
    });

    it('should forward ref to AccordionContent', () => {
      const ref = { current: null };

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent ref={ref}>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Use Cases', () => {
    it('should work as FAQ accordion', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="faq-1">
            <AccordionTrigger>What is this?</AccordionTrigger>
            <AccordionContent>This is an accordion component.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger>How does it work?</AccordionTrigger>
            <AccordionContent>Click the trigger to expand.</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('What is this?')).toBeInTheDocument();
      expect(screen.getByText('How does it work?')).toBeInTheDocument();
    });

    it('should work as settings sections', () => {
      render(
        <Accordion type="multiple">
          <AccordionItem value="general">
            <AccordionTrigger>General Settings</AccordionTrigger>
            <AccordionContent>General settings content</AccordionContent>
          </AccordionItem>
          <AccordionItem value="privacy">
            <AccordionTrigger>Privacy Settings</AccordionTrigger>
            <AccordionContent>Privacy settings content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Single Item</AccordionTrigger>
            <AccordionContent>Single Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Single Item')).toBeInTheDocument();
    });

    it('should handle many items', () => {
      const items = Array.from({ length: 10 }, (_, i) => i + 1);

      render(
        <Accordion type="single" collapsible>
          {items.map((num) => (
            <AccordionItem key={num} value={`item-${num}`}>
              <AccordionTrigger>Item {num}</AccordionTrigger>
              <AccordionContent>Content {num}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 10')).toBeInTheDocument();
    });

    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');

      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      // Should handle rapid clicks gracefully
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Controlled Accordion', () => {
    it('should work as controlled component with single type', async () => {
      const user = userEvent.setup();

      const ControlledAccordion = () => {
        const [value, setValue] = React.useState<string>('');

        return (
          <Accordion type="single" collapsible value={value} onValueChange={setValue}>
            <AccordionItem value="item-1">
              <AccordionTrigger>Item 1</AccordionTrigger>
              <AccordionContent>Content 1</AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      };

      render(<ControlledAccordion />);

      const trigger = screen.getByText('Item 1');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });
    });
  });

  describe('Default Value', () => {
    it('should open item with defaultValue', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeVisible();
    });

    it('should open multiple items with defaultValue', () => {
      render(
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeVisible();
      expect(screen.getByText('Content 2')).toBeVisible();
    });
  });

  describe('Disabled Items', () => {
    it('should not open disabled item', async () => {
      const user = userEvent.setup();

      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>Disabled Item</AccordionTrigger>
            <AccordionContent>Disabled Content</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Disabled Item');
      await user.click(trigger);

      // Content should remain hidden/not in DOM
      const content = screen.queryByText('Disabled Content');
      expect(content === null || !content.isConnected).toBe(true);
    });
  });
});
