/**
/**
 * Progress Component Tests
 *
 * Tests for the shadcn/ui Progress component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from '@/components/ui/progress';

describe('Progress Component', () => {
  describe('Basic Rendering', () => {
    it('should render progress element', () => {
      render(<Progress value={50} data-testid="progress" />);

      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should render as div element', () => {
      render(<Progress value={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress.tagName).toBe('DIV');
    });

    it('should have default styling classes', () => {
      render(<Progress value={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('relative');
      expect(progress).toHaveClass('h-2');
      expect(progress).toHaveClass('w-full');
      expect(progress).toHaveClass('overflow-hidden');
      expect(progress).toHaveClass('rounded-full');
      expect(progress).toHaveClass('bg-gray-200');
    });

    it('should apply custom className', () => {
      render(<Progress value={50} className="custom-progress" data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-progress');
    });
  });

  describe('Progress Value', () => {
    it('should render with 0% progress by default', () => {
      render(<Progress data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should render with specified progress value', () => {
      render(<Progress value={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should render with 100% progress', () => {
      render(<Progress value={100} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('should render with 0% progress', () => {
      render(<Progress value={0} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should update progress value', () => {
      const { rerender } = render(<Progress value={25} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      let indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });

      rerender(<Progress value={75} data-testid="progress" />);

      indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
    });
  });

  describe('Max Value', () => {
    it('should use 100 as default max', () => {
      render(<Progress value={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // 50 out of 100 = 50%
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should support custom max value', () => {
      render(<Progress value={25} max={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // 25 out of 50 = 50%
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should calculate percentage correctly with different max', () => {
      render(<Progress value={1} max={10} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // 1 out of 10 = 10%
      expect(indicator).toHaveStyle({ transform: 'translateX(-90%)' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle value exceeding max', () => {
      render(<Progress value={150} max={100} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // Should cap at 100%
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('should handle negative value', () => {
      render(<Progress value={-50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // Should cap at 0%
      expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('should handle zero max', () => {
      render(<Progress value={50} max={0} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      // Should not crash, handle gracefully
      expect(progress).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<Progress value={33.33} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-66.67%)' });
    });

    it('should handle very small values', () => {
      render(<Progress value={0.1} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-99.9%)' });
    });
  });

  describe('Indicator Styling', () => {
    it('should have default indicator styling', () => {
      render(<Progress value={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveClass('h-full');
      expect(indicator).toHaveClass('w-full');
      expect(indicator).toHaveClass('flex-1');
      expect(indicator).toHaveClass('bg-blue-600');
      expect(indicator).toHaveClass('transition-all');
    });

    it('should have animation transition classes', () => {
      render(<Progress value={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveClass('duration-300');
      expect(indicator).toHaveClass('ease-in-out');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Progress value={50} aria-label="Upload progress" data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-label', 'Upload progress');
    });

    it('should support aria-valuenow', () => {
      render(<Progress value={50} aria-valuenow={50} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-valuenow', '50');
    });

    it('should support aria-valuemin', () => {
      render(<Progress value={50} aria-valuemin={0} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
    });

    it('should support aria-valuemax', () => {
      render(<Progress value={50} aria-valuemax={100} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('HTML Attributes', () => {
    it('should support id attribute', () => {
      render(<Progress value={50} id="upload-progress" data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('id', 'upload-progress');
    });

    it('should support data attributes', () => {
      render(<Progress value={50} data-testid="my-progress" />);

      expect(screen.getByTestId('my-progress')).toBeInTheDocument();
    });

    it('should support title attribute', () => {
      render(<Progress value={50} title="50% complete" data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('title', '50% complete');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to progress element', () => {
      const ref = { current: null };

      render(<Progress value={50} ref={ref} data-testid="progress" />);

      expect(ref.current).not.toBeNull();
    });

    it('should allow access to div element via ref', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;

      render(<Progress value={50} ref={ref} data-testid="progress" />);

      expect(ref.current?.tagName).toBe('DIV');
    });
  });

  describe('Use Cases', () => {
    it('should work as file upload indicator', () => {
      render(
        <div>
          <label>Uploading file...</label>
          <Progress value={75} aria-label="File upload progress" data-testid="progress" />
          <span>75% complete</span>
        </div>
      );

      expect(screen.getByTestId('progress')).toBeInTheDocument();
      expect(screen.getByText('Uploading file...')).toBeInTheDocument();
      expect(screen.getByText('75% complete')).toBeInTheDocument();
    });

    it('should work as task completion indicator', () => {
      render(
        <div>
          <h3>Task Progress</h3>
          <Progress value={3} max={5} data-testid="progress" />
          <p>3 of 5 tasks completed</p>
        </div>
      );

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // 3 out of 5 = 60%
      expect(indicator).toHaveStyle({ transform: 'translateX(-40%)' });
    });

    it('should work as loading indicator', () => {
      render(
        <div>
          <p>Loading...</p>
          <Progress value={100} aria-label="Loading progress" data-testid="progress" />
        </div>
      );

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });
  });

  describe('Dynamic Updates', () => {
    it('should handle incremental updates', () => {
      const { rerender } = render(<Progress value={0} data-testid="progress" />);

      const progress = screen.getByTestId('progress');

      rerender(<Progress value={25} data-testid="progress" />);
      let indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });

      rerender(<Progress value={50} data-testid="progress" />);
      indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });

      rerender(<Progress value={75} data-testid="progress" />);
      indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });

      rerender(<Progress value={100} data-testid="progress" />);
      indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('should handle decremental updates', () => {
      const { rerender } = render(<Progress value={100} data-testid="progress" />);

      const progress = screen.getByTestId('progress');

      rerender(<Progress value={50} data-testid="progress" />);
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });
  });

  describe('Multiple Progress Bars', () => {
    it('should render multiple progress bars independently', () => {
      render(
        <div>
          <Progress value={25} data-testid="progress-1" />
          <Progress value={50} data-testid="progress-2" />
          <Progress value={75} data-testid="progress-3" />
        </div>
      );

      const progress1 = screen.getByTestId('progress-1');
      const progress2 = screen.getByTestId('progress-2');
      const progress3 = screen.getByTestId('progress-3');

      expect(progress1).toBeInTheDocument();
      expect(progress2).toBeInTheDocument();
      expect(progress3).toBeInTheDocument();
    });

    it('should maintain individual progress values', () => {
      render(
        <div>
          <Progress value={25} data-testid="progress-1" />
          <Progress value={75} data-testid="progress-2" />
        </div>
      );

      const progress1 = screen.getByTestId('progress-1');
      const progress2 = screen.getByTestId('progress-2');

      const indicator1 = progress1.firstChild as HTMLElement;
      const indicator2 = progress2.firstChild as HTMLElement;

      expect(indicator1).toHaveStyle({ transform: 'translateX(-75%)' });
      expect(indicator2).toHaveStyle({ transform: 'translateX(-25%)' });
    });
  });

  describe('Styling Variations', () => {
    it('should support custom height', () => {
      render(<Progress value={50} className="h-4" data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('h-4');
    });

    it('should support custom width', () => {
      render(<Progress value={50} className="w-1/2" data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('w-1/2');
    });

    it('should support custom colors', () => {
      render(<Progress value={50} className="bg-red-200" data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('bg-red-200');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally based on value', () => {
      const value = 50;
      const showProgress = value > 0;

      render(
        <div>
          {showProgress && <Progress value={value} data-testid="progress" />}
        </div>
      );

      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const value = 0;
      const showProgress = value > 0;

      render(
        <div>
          {showProgress && <Progress value={value} data-testid="progress" />}
        </div>
      );

      expect(screen.queryByTestId('progress')).not.toBeInTheDocument();
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate 25% correctly', () => {
      render(<Progress value={25} max={100} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
    });

    it('should calculate 50% correctly', () => {
      render(<Progress value={50} max={100} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('should calculate 75% correctly', () => {
      render(<Progress value={75} max={100} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
    });

    it('should calculate custom max percentages correctly', () => {
      render(<Progress value={5} max={20} data-testid="progress" />);

      const progress = screen.getByTestId('progress');
      const indicator = progress.firstChild as HTMLElement;
      // 5 out of 20 = 25%
      expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
    });
  });
});
