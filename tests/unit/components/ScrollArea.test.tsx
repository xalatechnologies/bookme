/**
 * ScrollArea Component Tests
 *
 * Tests for the shadcn/ui ScrollArea component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

describe('ScrollArea Component', () => {
  describe('Basic Rendering', () => {
    it('should render scroll area', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <ScrollArea>
          <div>Scrollable Content</div>
        </ScrollArea>
      );

      expect(screen.getByText('Scrollable Content')).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('relative');
      expect(scrollArea).toHaveClass('overflow-hidden');
    });

    it('should apply custom className', () => {
      render(
        <ScrollArea className="custom-scroll" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('custom-scroll');
    });
  });

  describe('ScrollArea Viewport', () => {
    it('should render viewport', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
      expect(viewport).toBeInTheDocument();
    });

    it('should have viewport styling classes', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
      expect(viewport).toHaveClass('h-full');
      expect(viewport).toHaveClass('w-full');
      expect(viewport).toHaveClass('rounded-[inherit]');
    });

    it('should contain children in viewport', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <div>Viewport Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
      expect(viewport).toContainHTML('Viewport Content');
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(
        <ScrollArea>
          <p>Simple text content</p>
        </ScrollArea>
      );

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should render complex content', () => {
      render(
        <ScrollArea>
          <div>
            <h3>Title</h3>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('should render list content', () => {
      render(
        <ScrollArea>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </ScrollArea>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render very long content', () => {
      const items = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

      render(
        <ScrollArea>
          <div>
            {items.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 100')).toBeInTheDocument();
    });
  });

  describe('ScrollBar Component', () => {
    it('should render ScrollBar component', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      // ScrollBar is included in the component
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should accept ScrollBar as child', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <ScrollBar orientation="horizontal" data-testid="scrollbar" />
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should render with custom ScrollBar orientation', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <ScrollBar orientation="vertical" />
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should support both ScrollBar orientations', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(
        <ScrollArea aria-label="Scrollable content" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content');
    });

    it('should support id attribute', () => {
      render(
        <ScrollArea id="main-scroll" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('id', 'main-scroll');
    });
  });

  describe('HTML Attributes', () => {
    it('should support data attributes', () => {
      render(
        <ScrollArea data-testid="my-scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('my-scroll-area')).toBeInTheDocument();
    });

    it('should support title attribute', () => {
      render(
        <ScrollArea title="Scroll to view more" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('title', 'Scroll to view more');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to ScrollArea', () => {
      const ref = { current: null };

      render(
        <ScrollArea ref={ref} data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Use Cases', () => {
    it('should work as content scroller', () => {
      render(
        <ScrollArea className="h-72 w-48">
          <div>
            <p>Long content that needs scrolling</p>
            <p>More content...</p>
            <p>Even more content...</p>
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Long content that needs scrolling')).toBeInTheDocument();
    });

    it('should work as list scroller', () => {
      const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

      render(
        <ScrollArea className="h-48">
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ScrollArea>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 20')).toBeInTheDocument();
    });

    it('should work as sidebar scroller', () => {
      render(
        <ScrollArea className="h-screen">
          <nav>
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
          </nav>
        </ScrollArea>
      );

      expect(screen.getByText('Link 1')).toBeInTheDocument();
      expect(screen.getByText('Link 2')).toBeInTheDocument();
      expect(screen.getByText('Link 3')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area" />
      );

      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });

    it('should handle single child', () => {
      render(
        <ScrollArea>
          <div>Single child</div>
        </ScrollArea>
      );

      expect(screen.getByText('Single child')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <ScrollArea>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ScrollArea>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should handle nested scroll areas', () => {
      render(
        <ScrollArea data-testid="outer-scroll">
          <div>
            <ScrollArea data-testid="inner-scroll">
              <div>Inner content</div>
            </ScrollArea>
          </div>
        </ScrollArea>
      );

      expect(screen.getByTestId('outer-scroll')).toBeInTheDocument();
      expect(screen.getByTestId('inner-scroll')).toBeInTheDocument();
      expect(screen.getByText('Inner content')).toBeInTheDocument();
    });
  });

  describe('Multiple ScrollAreas', () => {
    it('should render multiple scroll areas independently', () => {
      render(
        <>
          <ScrollArea data-testid="scroll-1">
            <div>Content 1</div>
          </ScrollArea>
          <ScrollArea data-testid="scroll-2">
            <div>Content 2</div>
          </ScrollArea>
        </>
      );

      expect(screen.getByTestId('scroll-1')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-2')).toBeInTheDocument();
    });

    it('should maintain independent content', () => {
      render(
        <>
          <ScrollArea data-testid="scroll-1">
            <div>First area content</div>
          </ScrollArea>
          <ScrollArea data-testid="scroll-2">
            <div>Second area content</div>
          </ScrollArea>
        </>
      );

      expect(screen.getByText('First area content')).toBeInTheDocument();
      expect(screen.getByText('Second area content')).toBeInTheDocument();
    });
  });

  describe('Styling Variations', () => {
    it('should support custom height', () => {
      render(
        <ScrollArea className="h-96" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('h-96');
    });

    it('should support custom width', () => {
      render(
        <ScrollArea className="w-64" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('w-64');
    });

    it('should support rounded corners', () => {
      render(
        <ScrollArea className="rounded-lg" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('rounded-lg');
    });

    it('should support border', () => {
      render(
        <ScrollArea className="border" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('border');
    });
  });

  describe('ScrollBar Styling', () => {
    it('should accept custom className on ScrollBar', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <ScrollBar className="custom-scrollbar" />
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on content', () => {
      const hasContent = true;

      render(
        <div>
          {hasContent && (
            <ScrollArea data-testid="scroll-area">
              <div>Conditional content</div>
            </ScrollArea>
          )}
        </div>
      );

      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const hasContent = false;

      render(
        <div>
          {hasContent && (
            <ScrollArea data-testid="scroll-area">
              <div>Conditional content</div>
            </ScrollArea>
          )}
        </div>
      );

      expect(screen.queryByTestId('scroll-area')).not.toBeInTheDocument();
    });
  });

  describe('Complex Layouts', () => {
    it('should work with grid layout', () => {
      render(
        <ScrollArea>
          <div className="grid grid-cols-2 gap-4">
            <div>Cell 1</div>
            <div>Cell 2</div>
            <div>Cell 3</div>
            <div>Cell 4</div>
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 4')).toBeInTheDocument();
    });

    it('should work with flex layout', () => {
      render(
        <ScrollArea>
          <div className="flex flex-col gap-2">
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should work with nested components', () => {
      render(
        <ScrollArea>
          <div>
            <section>
              <h2>Section 1</h2>
              <p>Content 1</p>
            </section>
            <section>
              <h2>Section 2</h2>
              <p>Content 2</p>
            </section>
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });
  });

  describe('ScrollBar Orientation', () => {
    it('should accept vertical orientation', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <ScrollBar orientation="vertical" />
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should accept horizontal orientation', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <ScrollBar orientation="horizontal" />
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should accept both orientations', () => {
      const { container } = render(
        <ScrollArea data-testid="scroll-area">
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
          <div>Content</div>
        </ScrollArea>
      );

      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    });
  });
});
