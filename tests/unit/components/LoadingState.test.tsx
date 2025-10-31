/**
 * LoadingState Component Tests
 *
 * Tests for LoadingState and InlineLoading components
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState, InlineLoading } from '@/components/common/states/LoadingState';

describe('LoadingState Component', () => {
  describe('Basic Rendering', () => {
    it('should render loading state', () => {
      const { container } = render(<LoadingState />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with default spinner type', () => {
      const { container } = render(<LoadingState />);

      const spinner = container.querySelector('[role="status"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should have loading aria-label', () => {
      const { container } = render(<LoadingState />);

      const loader = container.querySelector('[role="status"]');
      expect(loader).toHaveAttribute('aria-label', 'Loading');
    });
  });

  describe('Loading Types', () => {
    it('should render spinner type', () => {
      const { container } = render(<LoadingState type="spinner" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full');
    });

    it('should render skeleton type', () => {
      const { container } = render(<LoadingState type="skeleton" />);

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render pulse type', () => {
      const { container } = render(<LoadingState type="pulse" />);

      const pulse = container.querySelector('.animate-pulse');
      expect(pulse).toBeInTheDocument();
      expect(pulse).toHaveClass('rounded-full');
    });

    it('should render dots type', () => {
      const { container } = render(<LoadingState type="dots" />);

      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(3);
    });

    it('should fallback to spinner for unknown type', () => {
      const { container } = render(<LoadingState type={'unknown' as any} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      const { container } = render(<LoadingState type="spinner" size="sm" />);

      const spinner = container.querySelector('.h-8');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-8');
    });

    it('should render medium size by default', () => {
      const { container } = render(<LoadingState type="spinner" />);

      const spinner = container.querySelector('.h-12');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-12');
    });

    it('should render large size', () => {
      const { container } = render(<LoadingState type="spinner" size="lg" />);

      const spinner = container.querySelector('.h-16');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-16');
    });

    it('should render extra large size', () => {
      const { container } = render(<LoadingState type="spinner" size="xl" />);

      const spinner = container.querySelector('.h-20');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-20');
    });

    it('should apply size to skeleton type', () => {
      const { container } = render(<LoadingState type="skeleton" size="lg" />);

      const skeleton = container.querySelector('.h-64');
      expect(skeleton).toBeInTheDocument();
    });

    it('should apply size to pulse type', () => {
      const { container } = render(<LoadingState type="pulse" size="lg" />);

      const pulse = container.querySelector('.h-16');
      expect(pulse).toBeInTheDocument();
    });

    it('should apply size to dots type', () => {
      const { container } = render(<LoadingState type="dots" size="lg" />);

      const dots = container.querySelectorAll('.h-4');
      expect(dots.length).toBe(3);
    });
  });

  describe('Loading Message', () => {
    it('should not render message by default', () => {
      const { container } = render(<LoadingState />);

      const message = container.querySelector('p');
      expect(message).not.toBeInTheDocument();
    });

    it('should render message when provided', () => {
      render(<LoadingState message="Loading data..." />);

      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should center message text', () => {
      render(<LoadingState message="Loading..." />);

      const message = screen.getByText('Loading...');
      expect(message).toHaveClass('text-center');
    });

    it('should apply max-width to message', () => {
      render(<LoadingState message="Loading..." />);

      const message = screen.getByText('Loading...');
      expect(message).toHaveClass('max-w-md');
    });
  });

  describe('Full Screen Mode', () => {
    it('should not be full screen by default', () => {
      const { container } = render(<LoadingState />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass('min-h-screen');
    });

    it('should render in full screen mode', () => {
      const { container } = render(<LoadingState fullScreen />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('min-h-screen');
    });

    it('should center content in full screen mode', () => {
      const { container } = render(<LoadingState fullScreen />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });
  });

  describe('Overlay Mode', () => {
    it('should not have overlay by default', () => {
      const { container } = render(<LoadingState />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass('fixed');
    });

    it('should render with overlay', () => {
      const { container } = render(<LoadingState overlay />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('fixed');
      expect(wrapper).toHaveClass('inset-0');
    });

    it('should have backdrop blur with overlay', () => {
      const { container } = render(<LoadingState overlay />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('backdrop-blur-sm');
    });

    it('should have z-index with overlay', () => {
      const { container } = render(<LoadingState overlay />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('z-50');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(<LoadingState className="custom-loading" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-loading');
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(<LoadingState className="extra-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('extra-class');
    });
  });

  describe('Spinner Loading', () => {
    it('should have border styling', () => {
      const { container } = render(<LoadingState type="spinner" />);

      const spinner = container.querySelector('.border-4');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('border-blue-200');
      expect(spinner).toHaveClass('border-t-blue-600');
    });

    it('should be rounded', () => {
      const { container } = render(<LoadingState type="spinner" />);

      const spinner = container.querySelector('.rounded-full');
      expect(spinner).toBeInTheDocument();
    });

    it('should have spin animation', () => {
      const { container } = render(<LoadingState type="spinner" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Skeleton Loading', () => {
    it('should render multiple skeleton elements', () => {
      const { container } = render(<LoadingState type="skeleton" />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(1);
    });

    it('should have space between skeleton elements', () => {
      const { container } = render(<LoadingState type="skeleton" />);

      const wrapper = container.querySelector('.space-y-3');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have max-width constraint', () => {
      const { container } = render(<LoadingState type="skeleton" />);

      const wrapper = container.querySelector('.max-w-md');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have different widths for skeleton lines', () => {
      const { container } = render(<LoadingState type="skeleton" />);

      const widthVariants = container.querySelectorAll('.w-3\\/4, .w-1\\/2');
      expect(widthVariants.length).toBeGreaterThan(0);
    });
  });

  describe('Pulse Loading', () => {
    it('should be circular', () => {
      const { container } = render(<LoadingState type="pulse" />);

      const pulse = container.querySelector('.rounded-full');
      expect(pulse).toBeInTheDocument();
    });

    it('should have pulse animation', () => {
      const { container } = render(<LoadingState type="pulse" />);

      const pulse = container.querySelector('.animate-pulse');
      expect(pulse).toBeInTheDocument();
    });

    it('should have blue background', () => {
      const { container } = render(<LoadingState type="pulse" />);

      const pulse = container.querySelector('.bg-blue-600');
      expect(pulse).toBeInTheDocument();
    });
  });

  describe('Dots Loading', () => {
    it('should render three dots', () => {
      const { container } = render(<LoadingState type="dots" />);

      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(3);
    });

    it('should have staggered animation delays', () => {
      const { container } = render(<LoadingState type="dots" />);

      const dots = container.querySelectorAll('.animate-bounce');
      const delays = Array.from(dots).map((dot) => (dot as HTMLElement).style.animationDelay);

      expect(delays).toEqual(['0ms', '150ms', '300ms']);
    });

    it('should have horizontal spacing', () => {
      const { container } = render(<LoadingState type="dots" />);

      const dotsWrapper = container.querySelector('.space-x-2');
      expect(dotsWrapper).toBeInTheDocument();
    });

    it('should render circular dots', () => {
      const { container } = render(<LoadingState type="dots" />);

      const dots = container.querySelectorAll('.rounded-full');
      expect(dots.length).toBe(3);
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for message', () => {
      render(<LoadingState message="Loading..." />);

      const message = screen.getByText('Loading...');
      expect(message).toHaveClass('dark:text-gray-400');
    });

    it('should have dark mode classes for skeleton', () => {
      const { container } = render(<LoadingState type="skeleton" />);

      const skeleton = container.querySelector('.dark\\:bg-gray-700');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have dark mode classes for overlay', () => {
      const { container } = render(<LoadingState overlay />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('dark:bg-gray-900/80');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for spinner', () => {
      const { container } = render(<LoadingState type="spinner" />);

      const loader = container.querySelector('[role="status"]');
      expect(loader).toBeInTheDocument();
    });

    it('should have role="status" for pulse', () => {
      const { container } = render(<LoadingState type="pulse" />);

      const loader = container.querySelector('[role="status"]');
      expect(loader).toBeInTheDocument();
    });

    it('should have role="status" for dots', () => {
      const { container } = render(<LoadingState type="dots" />);

      const loader = container.querySelector('[role="status"]');
      expect(loader).toBeInTheDocument();
    });

    it('should have aria-label for screen readers', () => {
      const { container } = render(<LoadingState type="spinner" />);

      const loader = container.querySelector('[aria-label="Loading"]');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Combined Features', () => {
    it('should render full screen with overlay and message', () => {
      const { container } = render(
        <LoadingState
          fullScreen
          overlay
          message="Please wait..."
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('min-h-screen');
      expect(wrapper).toHaveClass('fixed');
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('should render custom type with custom size and message', () => {
      const { container } = render(
        <LoadingState
          type="dots"
          size="lg"
          message="Loading data..."
        />
      );

      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(3);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
  });
});

describe('InlineLoading Component', () => {
  describe('Basic Rendering', () => {
    it('should render inline loading', () => {
      const { container } = render(<InlineLoading />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have loading aria-label', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('[aria-label="Loading"]');
      expect(loader).toBeInTheDocument();
    });

    it('should have role="status"', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('[role="status"]');
      expect(loader).toBeInTheDocument();
    });

    it('should be inline-block', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('.inline-block');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size by default', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('.h-4');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveClass('w-4');
    });

    it('should render small size when specified', () => {
      const { container } = render(<InlineLoading size="sm" />);

      const loader = container.querySelector('.h-4');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveClass('w-4');
    });

    it('should render medium size', () => {
      const { container } = render(<InlineLoading size="md" />);

      const loader = container.querySelector('.h-5');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveClass('w-5');
    });
  });

  describe('Styling', () => {
    it('should have white border', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('.border-white');
      expect(loader).toBeInTheDocument();
    });

    it('should have transparent top border', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('.border-t-transparent');
      expect(loader).toBeInTheDocument();
    });

    it('should be circular', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('.rounded-full');
      expect(loader).toBeInTheDocument();
    });

    it('should have spin animation', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('should have border width', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('.border-2');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work inside button context', () => {
      const { container } = render(
        <button>
          <InlineLoading /> Loading...
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Loading...');
    });

    it('should maintain inline display', () => {
      const { container } = render(
        <span>
          Text <InlineLoading /> more text
        </span>
      );

      const loader = container.querySelector('.inline-block');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<InlineLoading />);

      const loader = container.querySelector('[role="status"]');
      expect(loader).toHaveAttribute('aria-label', 'Loading');
    });

    it('should be accessible in both sizes', () => {
      const { container: containerSm } = render(<InlineLoading size="sm" />);
      const { container: containerMd } = render(<InlineLoading size="md" />);

      const loaderSm = containerSm.querySelector('[role="status"]');
      const loaderMd = containerMd.querySelector('[role="status"]');

      expect(loaderSm).toHaveAttribute('aria-label', 'Loading');
      expect(loaderMd).toHaveAttribute('aria-label', 'Loading');
    });
  });
});
