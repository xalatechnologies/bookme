/**
 * Separator Component Tests
 *
 * Tests for the shadcn/ui Separator component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

describe('Separator Component', () => {
  describe('Basic Rendering', () => {
    it('should render separator element', () => {
      const { container } = render(<Separator data-testid="separator" />);

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      const { container } = render(<Separator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('shrink-0');
      expect(separator).toHaveClass('bg-border');
    });

    it('should apply custom className', () => {
      const { container } = render(<Separator className="custom-separator" data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('custom-separator');
    });
  });

  describe('Orientation', () => {
    it('should render horizontal separator by default', () => {
      const { container } = render(<Separator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]');
      expect(separator).toHaveClass('w-full');
    });

    it('should render horizontal separator when explicitly set', () => {
      const { container } = render(<Separator orientation="horizontal" data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]');
      expect(separator).toHaveClass('w-full');
    });

    it('should render vertical separator', () => {
      const { container } = render(<Separator orientation="vertical" data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveClass('h-full');
      expect(separator).toHaveClass('w-[1px]');
    });
  });

  describe('Decorative Property', () => {
    it('should be decorative by default', () => {
      const { container } = render(<Separator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      // Decorative separators should not have role="separator"
      expect(separator).not.toHaveAttribute('role', 'separator');
    });

    it('should be decorative when explicitly set to true', () => {
      const { container } = render(<Separator decorative={true} data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).not.toHaveAttribute('role', 'separator');
    });

    it('should have separator role when not decorative', () => {
      render(<Separator decorative={false} data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'separator');
    });
  });

  describe('Accessibility', () => {
    it('should have separator role when not decorative', () => {
      render(<Separator decorative={false} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('should support aria-label for non-decorative separators', () => {
      render(<Separator decorative={false} aria-label="Content divider" />);

      const separator = screen.getByLabelText('Content divider');
      expect(separator).toBeInTheDocument();
    });

    it('should support aria-orientation', () => {
      render(<Separator orientation="vertical" decorative={false} data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should not expose separator role when decorative', () => {
      const { container } = render(<Separator decorative={true} data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).not.toHaveAttribute('role', 'separator');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Separator id="content-divider" data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('id', 'content-divider');
    });

    it('should support data attributes', () => {
      render(<Separator data-testid="my-separator" />);

      expect(screen.getByTestId('my-separator')).toBeInTheDocument();
    });

    it('should support title attribute', () => {
      render(<Separator title="Section divider" data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('title', 'Section divider');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to separator element', () => {
      const ref = { current: null };

      render(<Separator ref={ref} data-testid="separator" />);

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Styling', () => {
    it('should have background color class', () => {
      render(<Separator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('bg-border');
    });

    it('should have shrink-0 class', () => {
      render(<Separator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('shrink-0');
    });

    it('should support custom styling for horizontal', () => {
      render(<Separator className="h-[2px] bg-blue-500" data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-[2px]');
      expect(separator).toHaveClass('bg-blue-500');
    });

    it('should support custom styling for vertical', () => {
      render(<Separator orientation="vertical" className="w-[2px] bg-red-500" data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('w-[2px]');
      expect(separator).toHaveClass('bg-red-500');
    });
  });

  describe('Use Cases', () => {
    it('should work as content divider', () => {
      render(
        <div>
          <div>Section 1</div>
          <Separator data-testid="divider" />
          <div>Section 2</div>
        </div>
      );

      expect(screen.getByTestId('divider')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('should work in a card layout', () => {
      render(
        <div>
          <h3>Card Title</h3>
          <Separator data-testid="card-separator" />
          <p>Card content</p>
        </div>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByTestId('card-separator')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should work as vertical divider in flex layout', () => {
      render(
        <div className="flex">
          <div>Left content</div>
          <Separator orientation="vertical" data-testid="vertical-divider" />
          <div>Right content</div>
        </div>
      );

      const separator = screen.getByTestId('vertical-divider');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(screen.getByText('Left content')).toBeInTheDocument();
      expect(screen.getByText('Right content')).toBeInTheDocument();
    });

    it('should work in navigation menu', () => {
      render(
        <nav>
          <a href="/home">Home</a>
          <Separator orientation="vertical" data-testid="nav-separator-1" />
          <a href="/about">About</a>
          <Separator orientation="vertical" data-testid="nav-separator-2" />
          <a href="/contact">Contact</a>
        </nav>
      );

      expect(screen.getByTestId('nav-separator-1')).toBeInTheDocument();
      expect(screen.getByTestId('nav-separator-2')).toBeInTheDocument();
    });
  });

  describe('Multiple Separators', () => {
    it('should render multiple separators independently', () => {
      render(
        <div>
          <Separator data-testid="separator-1" />
          <Separator data-testid="separator-2" />
          <Separator data-testid="separator-3" />
        </div>
      );

      expect(screen.getByTestId('separator-1')).toBeInTheDocument();
      expect(screen.getByTestId('separator-2')).toBeInTheDocument();
      expect(screen.getByTestId('separator-3')).toBeInTheDocument();
    });

    it('should support mixed orientations', () => {
      render(
        <div>
          <Separator orientation="horizontal" data-testid="horizontal-sep" />
          <Separator orientation="vertical" data-testid="vertical-sep" />
        </div>
      );

      const horizontal = screen.getByTestId('horizontal-sep');
      const vertical = screen.getByTestId('vertical-sep');

      expect(horizontal).toHaveAttribute('data-orientation', 'horizontal');
      expect(vertical).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on condition', () => {
      const showSeparator = true;

      render(
        <div>
          <div>Content 1</div>
          {showSeparator && <Separator data-testid="conditional-separator" />}
          <div>Content 2</div>
        </div>
      );

      expect(screen.getByTestId('conditional-separator')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const showSeparator = false;

      render(
        <div>
          <div>Content 1</div>
          {showSeparator && <Separator data-testid="conditional-separator" />}
          <div>Content 2</div>
        </div>
      );

      expect(screen.queryByTestId('conditional-separator')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render without any props', () => {
      const { container } = render(<Separator data-testid="separator" />);

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should handle both decorative and non-decorative in same component tree', () => {
      render(
        <div>
          <Separator decorative={true} data-testid="decorative-sep" />
          <Separator decorative={false} data-testid="semantic-sep" />
        </div>
      );

      const decorative = screen.getByTestId('decorative-sep');
      const semantic = screen.getByTestId('semantic-sep');

      expect(decorative).not.toHaveAttribute('role', 'separator');
      expect(semantic).toHaveAttribute('role', 'separator');
    });
  });

  describe('Layout Integration', () => {
    it('should work in list with separators between items', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      render(
        <div>
          {items.map((item, index) => (
            <div key={item}>
              <div>{item}</div>
              {index < items.length - 1 && <Separator data-testid={`separator-${index}`} />}
            </div>
          ))}
        </div>
      );

      expect(screen.getByTestId('separator-0')).toBeInTheDocument();
      expect(screen.getByTestId('separator-1')).toBeInTheDocument();
      expect(screen.queryByTestId('separator-2')).not.toBeInTheDocument();
    });

    it('should work in grid layout', () => {
      render(
        <div className="grid">
          <div>Cell 1</div>
          <Separator data-testid="grid-separator" />
          <div>Cell 2</div>
        </div>
      );

      expect(screen.getByTestId('grid-separator')).toBeInTheDocument();
    });

    it('should work in sidebar layout', () => {
      render(
        <div className="flex">
          <aside>Sidebar</aside>
          <Separator orientation="vertical" data-testid="sidebar-separator" />
          <main>Main content</main>
        </div>
      );

      const separator = screen.getByTestId('sidebar-separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('Semantic vs Decorative', () => {
    it('should be decorative by default for styling purposes', () => {
      render(<Separator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).not.toHaveAttribute('role', 'separator');
    });

    it('should be semantic when marking meaningful content divisions', () => {
      render(
        <div>
          <section>
            <h2>Section 1</h2>
            <p>Content 1</p>
          </section>
          <Separator decorative={false} aria-label="Section divider" />
          <section>
            <h2>Section 2</h2>
            <p>Content 2</p>
          </section>
        </div>
      );

      const separator = screen.getByLabelText('Section divider');
      expect(separator).toHaveAttribute('role', 'separator');
    });
  });

  describe('Responsive Behavior', () => {
    it('should support responsive styling', () => {
      render(
        <Separator
          className="md:h-[2px] lg:h-[3px]"
          data-testid="responsive-separator"
        />
      );

      const separator = screen.getByTestId('responsive-separator');
      expect(separator).toHaveClass('md:h-[2px]');
      expect(separator).toHaveClass('lg:h-[3px]');
    });

    it('should support responsive orientation via custom classes', () => {
      render(
        <Separator
          className="md:w-[2px] md:h-full"
          data-testid="responsive-separator"
        />
      );

      const separator = screen.getByTestId('responsive-separator');
      expect(separator).toHaveClass('md:w-[2px]');
      expect(separator).toHaveClass('md:h-full');
    });
  });

  describe('Complex Layouts', () => {
    it('should work in nested content structure', () => {
      render(
        <div>
          <div>
            <h2>Header</h2>
            <Separator data-testid="header-separator" />
          </div>
          <div>
            <p>Body</p>
            <Separator data-testid="body-separator" />
          </div>
          <div>
            <p>Footer</p>
          </div>
        </div>
      );

      expect(screen.getByTestId('header-separator')).toBeInTheDocument();
      expect(screen.getByTestId('body-separator')).toBeInTheDocument();
    });

    it('should work with multiple vertical separators in toolbar', () => {
      render(
        <div className="flex">
          <button>Action 1</button>
          <Separator orientation="vertical" data-testid="sep-1" />
          <button>Action 2</button>
          <Separator orientation="vertical" data-testid="sep-2" />
          <button>Action 3</button>
        </div>
      );

      expect(screen.getByTestId('sep-1')).toHaveAttribute('data-orientation', 'vertical');
      expect(screen.getByTestId('sep-2')).toHaveAttribute('data-orientation', 'vertical');
    });
  });
});
