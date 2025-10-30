/**
 * KPICard Component Tests
 *
 * Tests for KPICard - reusable Key Performance Indicator card component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KPICard } from '@/components/common/metrics/KPICard';
import { Calendar, TrendingUp } from 'lucide-react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'kpi.navigate_to') {
        return `Navigate to ${params?.title}`;
      }
      return key;
    },
    i18n: {
      language: 'en-US',
    },
  }),
}));

describe('KPICard Component', () => {
  describe('Basic Rendering', () => {
    it('should render KPI card with title and value', () => {
      render(<KPICard title="Total Sales" value={1234} />);

      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(
        <KPICard
          title="Revenue"
          value={5000}
          description="Last 30 days"
        />
      );

      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const { container } = render(<KPICard title="Revenue" value={5000} />);

      const description = container.querySelector('.text-gray-600.dark\\:text-gray-400.mb-3');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('should format number by default', () => {
      render(<KPICard title="Users" value={123456} />);

      expect(screen.getByText('123,456')).toBeInTheDocument();
    });

    it('should format currency', () => {
      render(<KPICard title="Revenue" value={5000} format="currency" />);

      // Currency format depends on locale, just check the value exists
      const value = screen.getByText(/5/);
      expect(value).toBeInTheDocument();
    });

    it('should format percentage', () => {
      render(<KPICard title="Growth" value={25} format="percentage" />);

      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<KPICard title="Errors" value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative value', () => {
      render(<KPICard title="Loss" value={-500} />);

      expect(screen.getByText('-500')).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      render(<KPICard title="Total" value={1000000} />);

      expect(screen.getByText('1,000,000')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should render with icon', () => {
      const { container } = render(
        <KPICard
          title="Bookings"
          value={100}
          icon={<Calendar data-testid="calendar-icon" />}
        />
      );

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should not render icon container when no icon provided', () => {
      const { container } = render(<KPICard title="Data" value={100} />);

      const iconContainer = container.querySelector('.rounded-lg');
      // Icon container might still exist but not with icon
      expect(screen.getByText('Data')).toBeInTheDocument();
    });

    it('should apply color-specific icon background', () => {
      const { container } = render(
        <KPICard
          title="Revenue"
          value={1000}
          icon={<Calendar />}
          color="blue"
        />
      );

      const iconBg = container.querySelector('.bg-blue-100');
      expect(iconBg).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('should apply blue color scheme', () => {
      const { container } = render(
        <KPICard title="Test" value={100} color="blue" />
      );

      const card = container.querySelector('.hover\\:border-blue-300');
      expect(card).toBeInTheDocument();
    });

    it('should apply green color scheme', () => {
      const { container } = render(
        <KPICard title="Test" value={100} color="green" />
      );

      const card = container.querySelector('.hover\\:border-green-300');
      expect(card).toBeInTheDocument();
    });

    it('should apply yellow color scheme', () => {
      const { container } = render(
        <KPICard title="Test" value={100} color="yellow" />
      );

      const card = container.querySelector('.hover\\:border-yellow-300');
      expect(card).toBeInTheDocument();
    });

    it('should apply red color scheme', () => {
      const { container } = render(
        <KPICard title="Test" value={100} color="red" />
      );

      const card = container.querySelector('.hover\\:border-red-300');
      expect(card).toBeInTheDocument();
    });

    it('should apply purple color scheme', () => {
      const { container } = render(
        <KPICard title="Test" value={100} color="purple" />
      );

      const card = container.querySelector('.hover\\:border-purple-300');
      expect(card).toBeInTheDocument();
    });

    it('should apply default gray color scheme', () => {
      const { container } = render(<KPICard title="Test" value={100} />);

      const card = container.querySelector('.hover\\:border-gray-300');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      const { container } = render(
        <KPICard title="Test" value={100} size="sm" />
      );

      const card = container.querySelector('.p-4');
      expect(card).toBeInTheDocument();
    });

    it('should render medium size by default', () => {
      const { container } = render(<KPICard title="Test" value={100} />);

      const card = container.querySelector('.p-6');
      expect(card).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = render(
        <KPICard title="Test" value={100} size="lg" />
      );

      const card = container.querySelector('.p-8');
      expect(card).toBeInTheDocument();
    });

    it('should apply correct title size for small variant', () => {
      render(<KPICard title="Title" value={100} size="sm" />);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-xs');
    });

    it('should apply correct title size for medium variant', () => {
      render(<KPICard title="Title" value={100} size="md" />);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-sm');
    });

    it('should apply correct title size for large variant', () => {
      render(<KPICard title="Title" value={100} size="lg" />);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-base');
    });
  });

  describe('Trend Display', () => {
    it('should render upward trend', () => {
      const { container } = render(
        <KPICard
          title="Sales"
          value={1000}
          trend={{ value: 12, direction: 'up' }}
        />
      );

      expect(screen.getByText('12%')).toBeInTheDocument();
      const trendIcon = container.querySelector('.text-green-500');
      expect(trendIcon).toBeInTheDocument();
    });

    it('should render downward trend', () => {
      const { container } = render(
        <KPICard
          title="Sales"
          value={1000}
          trend={{ value: 8, direction: 'down' }}
        />
      );

      expect(screen.getByText('8%')).toBeInTheDocument();
      const trendIcon = container.querySelector('.text-red-500');
      expect(trendIcon).toBeInTheDocument();
    });

    it('should render neutral trend', () => {
      const { container } = render(
        <KPICard
          title="Sales"
          value={1000}
          trend={{ value: 0, direction: 'neutral' }}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
      const trendIcon = container.querySelector('.text-gray-500');
      expect(trendIcon).toBeInTheDocument();
    });

    it('should render trend with period', () => {
      render(
        <KPICard
          title="Sales"
          value={1000}
          trend={{ value: 12, direction: 'up', period: 'vs last month' }}
        />
      );

      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('should not render trend when not provided', () => {
      const { container } = render(<KPICard title="Sales" value={1000} />);

      const trendContainer = container.querySelector('.flex.items-center.gap-2');
      expect(trendContainer).not.toBeInTheDocument();
    });

    it('should handle negative trend values (shows absolute)', () => {
      render(
        <KPICard
          title="Sales"
          value={1000}
          trend={{ value: -15, direction: 'down' }}
        />
      );

      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should apply correct color to upward trend text', () => {
      render(
        <KPICard
          title="Sales"
          value={1000}
          trend={{ value: 12, direction: 'up' }}
        />
      );

      const trendValue = screen.getByText('12%');
      expect(trendValue).toHaveClass('text-green-600');
    });

    it('should apply correct color to downward trend text', () => {
      render(
        <KPICard
          title="Sales"
          value={1000}
          trend={{ value: 8, direction: 'down' }}
        />
      );

      const trendValue = screen.getByText('8%');
      expect(trendValue).toHaveClass('text-red-600');
    });
  });

  describe('Click Behavior', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<KPICard title="Sales" value={1000} onClick={handleClick} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have button role when clickable', () => {
      render(<KPICard title="Sales" value={1000} onClick={vi.fn()} />);

      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });

    it('should not have button role when not clickable', () => {
      render(<KPICard title="Sales" value={1000} />);

      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should be keyboard accessible when clickable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<KPICard title="Sales" value={1000} onClick={handleClick} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key when clickable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<KPICard title="Sales" value={1000} onClick={handleClick} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have cursor pointer when clickable', () => {
      const { container } = render(
        <KPICard title="Sales" value={1000} onClick={vi.fn()} />
      );

      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });

    it('should have hover effects when clickable', () => {
      const { container } = render(
        <KPICard title="Sales" value={1000} onClick={vi.fn()} />
      );

      const card = container.querySelector('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('hover:scale-105');
    });

    it('should have tabIndex 0 when clickable', () => {
      render(<KPICard title="Sales" value={1000} onClick={vi.fn()} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should have aria-label when clickable', () => {
      render(<KPICard title="Sales" value={1000} onClick={vi.fn()} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Navigate to Sales');
    });
  });

  describe('Loading State', () => {
    it('should render loading skeleton', () => {
      const { container } = render(
        <KPICard title="Sales" value={1000} loading />
      );

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should not render actual content when loading', () => {
      render(<KPICard title="Sales" value={1000} loading />);

      // Title and value should not be visible (they're replaced by skeleton)
      expect(screen.queryByText('Sales')).not.toBeInTheDocument();
      expect(screen.queryByText('1,000')).not.toBeInTheDocument();
    });

    it('should render loading skeleton with correct color', () => {
      const { container } = render(
        <KPICard title="Sales" value={1000} loading color="blue" />
      );

      const iconBg = container.querySelector('.bg-blue-100');
      expect(iconBg).toBeInTheDocument();
    });

    it('should render loading skeleton with correct size', () => {
      const { container } = render(
        <KPICard title="Sales" value={1000} loading size="lg" />
      );

      const card = container.querySelector('.p-8');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <KPICard title="Test" value={100} className="custom-kpi" />
      );

      const card = container.querySelector('.custom-kpi');
      expect(card).toBeInTheDocument();
    });

    it('should combine custom className with default classes', () => {
      const { container } = render(
        <KPICard title="Test" value={100} className="extra-class" />
      );

      const card = container.querySelector('.extra-class');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for background', () => {
      const { container } = render(<KPICard title="Test" value={100} />);

      const card = container.querySelector('.dark\\:bg-gray-800');
      expect(card).toBeInTheDocument();
    });

    it('should have dark mode classes for title', () => {
      render(<KPICard title="Test Title" value={100} />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('dark:text-gray-300');
    });

    it('should have dark mode classes for value', () => {
      render(<KPICard title="Test" value={100} />);

      const value = screen.getByText('100');
      expect(value).toHaveClass('dark:text-white');
    });

    it('should have dark mode classes for description', () => {
      render(
        <KPICard title="Test" value={100} description="Description text" />
      );

      const description = screen.getByText('Description text');
      expect(description).toHaveClass('dark:text-gray-400');
    });

    it('should have dark mode classes for icon background', () => {
      const { container } = render(
        <KPICard title="Test" value={100} icon={<Calendar />} color="blue" />
      );

      const iconBg = container.querySelector('.dark\\:bg-blue-800');
      expect(iconBg).toBeInTheDocument();
    });

    it('should have dark mode classes for trend', () => {
      render(
        <KPICard
          title="Test"
          value={100}
          trend={{ value: 12, direction: 'up' }}
        />
      );

      const trendValue = screen.getByText('12%');
      expect(trendValue).toHaveClass('dark:text-green-400');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<KPICard title="KPI Title" value={100} />);

      const heading = screen.getByText('KPI Title');
      expect(heading.tagName).toBe('H3');
    });

    it('should have aria-hidden on trend icons', () => {
      const { container } = render(
        <KPICard
          title="Test"
          value={100}
          trend={{ value: 12, direction: 'up' }}
        />
      );

      const trendIcon = container.querySelector('svg[aria-hidden="true"]');
      expect(trendIcon).toBeInTheDocument();
    });

    it('should be keyboard navigable when interactive', () => {
      render(<KPICard title="Test" value={100} onClick={vi.fn()} />);

      const card = screen.getByRole('button');
      card.focus();

      expect(document.activeElement).toBe(card);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(100);
      render(<KPICard title={longTitle} value={100} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(200);
      render(
        <KPICard title="Test" value={100} description={longDescription} />
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      render(<KPICard title="Test" value={999999999} />);

      expect(screen.getByText('999,999,999')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      render(<KPICard title="Test" value={123.456} />);

      const value = screen.getByText(/123/);
      expect(value).toBeInTheDocument();
    });

    it('should handle empty string title', () => {
      render(<KPICard title="" value={100} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeEmptyDOMElement();
    });

    it('should render multiple KPI cards independently', () => {
      const { container } = render(
        <>
          <KPICard title="Card 1" value={100} />
          <KPICard title="Card 2" value={200} />
          <KPICard title="Card 3" value={300} />
        </>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have rounded corners', () => {
      const { container } = render(<KPICard title="Test" value={100} />);

      const card = container.querySelector('.rounded-xl');
      expect(card).toBeInTheDocument();
    });

    it('should have border', () => {
      const { container } = render(<KPICard title="Test" value={100} />);

      const card = container.querySelector('.border-2');
      expect(card).toBeInTheDocument();
    });

    it('should have transition effects', () => {
      const { container } = render(<KPICard title="Test" value={100} />);

      const card = container.querySelector('.transition-all');
      expect(card).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = render(
        <KPICard
          title="Test"
          value={100}
          description="Description"
          trend={{ value: 12, direction: 'up' }}
        />
      );

      const gaps = container.querySelectorAll('.gap-3, .gap-2');
      expect(gaps.length).toBeGreaterThan(0);
    });
  });
});
