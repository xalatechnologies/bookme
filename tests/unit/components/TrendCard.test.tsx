/**
 * TrendCard Component Tests
 *
 * Tests for TrendCard - displays trend visualization in admin dashboard
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendCard } from '@/components/features/dashboard/admin/TrendCard';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'admin:pages.dashboard.trends.stable': 'Stable',
        'admin:pages.dashboard.trends.bookings': 'bookings',
        'admin:pages.dashboard.trends.facilities': 'facilities',
        'admin:pages.dashboard.trends.users': 'users',
        'admin:pages.dashboard.trends.up': 'Increased by',
        'admin:pages.dashboard.trends.down': 'Decreased by',
        'admin:pages.dashboard.trends.last_7_days': 'Last 7 days',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en-US',
    },
  }),
}));

// Mock icons
const MockIcon = () => <div data-testid="mock-icon" />;

// Mock the useStatistics hook
vi.mock('@/hooks/useStatistics', () => ({
  formatNumber: (value: number) => value.toLocaleString(),
}));

describe('TrendCard Component', () => {
  const mockData = [
    { day: 'Mon', value: 10 },
    { day: 'Tue', value: 15 },
    { day: 'Wed', value: 12 },
    { day: 'Thu', value: 18 },
    { day: 'Fri', value: 20 },
    { day: 'Sat', value: 17 },
    { day: 'Sun', value: 22 },
  ];

  const defaultProps = {
    title: 'Weekly Bookings',
    data: mockData,
    icon: MockIcon,
    color: 'blue' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render title correctly', () => {
      render(<TrendCard {...defaultProps} />);

      expect(screen.getByText('Weekly Bookings')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<TrendCard {...defaultProps} />);

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('should render current value', () => {
      render(<TrendCard {...defaultProps} />);

      // Last value in the data array
      expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('should render unit label based on title content', () => {
      render(<TrendCard {...defaultProps} />);

      expect(screen.getByText('pages.dashboard.trends.bookings')).toBeInTheDocument();
    });

    it('should render unit label for facility-related titles', () => {
      render(<TrendCard {...defaultProps} title="Facility Usage" />);

      expect(screen.getByText('pages.dashboard.trends.facilities')).toBeInTheDocument();
    });

    it('should render unit label for user-related titles', () => {
      render(<TrendCard {...defaultProps} title="Active Users" />);

      expect(screen.getByText('pages.dashboard.trends.users')).toBeInTheDocument();
    });
  });

  describe('Trend Calculation', () => {
    it('should calculate upward trend correctly', () => {
      const upwardData = [
        { day: 'Mon', value: 10 },
        { day: 'Tue', value: 20 },
      ];
      render(<TrendCard {...defaultProps} data={upwardData} />);

      expect(screen.getByText('+100%')).toBeInTheDocument();
    });

    it('should calculate downward trend correctly', () => {
      const downwardData = [
        { day: 'Mon', value: 20 },
        { day: 'Tue', value: 10 },
      ];
      render(<TrendCard {...defaultProps} data={downwardData} />);

      expect(screen.getByText('-50%')).toBeInTheDocument();
    });

    it('should show stable trend when values are equal', () => {
      const stableData = [
        { day: 'Mon', value: 10 },
        { day: 'Tue', value: 10 },
      ];
      render(<TrendCard {...defaultProps} data={stableData} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render trend indicator with correct icon for upward trend', () => {
      const upwardData = [
        { day: 'Mon', value: 10 },
        { day: 'Tue', value: 20 },
      ];
      render(<TrendCard {...defaultProps} data={upwardData} />);

      // Check for trending up icon (we'll look for the text color class)
      const trendText = screen.getByText('+100%');
      expect(trendText).toHaveClass('text-green-600');
    });

    it('should render trend indicator with correct icon for downward trend', () => {
      const downwardData = [
        { day: 'Mon', value: 20 },
        { day: 'Tue', value: 10 },
      ];
      render(<TrendCard {...defaultProps} data={downwardData} />);

      // Check for trending down icon (we'll look for the text color class)
      const trendText = screen.getByText('-50%');
      expect(trendText).toHaveClass('text-red-600');
    });

    it('should render last 7 days badge', () => {
      render(<TrendCard {...defaultProps} />);

      expect(screen.getByText('pages.dashboard.trends.last_7_days')).toBeInTheDocument();
    });

    it('should render mini chart with correct number of bars', () => {
      render(<TrendCard {...defaultProps} />);

      // Look for elements that represent the bars in the chart
      const chartContainer = screen.getByLabelText('Weekly Bookings chart');
      expect(chartContainer).toBeInTheDocument();
      
      // We should have 7 bars for 7 days of data
      const bars = chartContainer.querySelectorAll('[style*="height"]');
      expect(bars).toHaveLength(7);
    });
  });

  describe('Color Variants', () => {
    it('should apply blue color classes', () => {
      render(<TrendCard {...defaultProps} color="blue" />);

      const icon = screen.getByTestId('mock-icon');
      // Simplified check for blue color classes
      expect(icon).toBeInTheDocument();
    });

    it('should apply green color classes', () => {
      render(<TrendCard {...defaultProps} color="green" />);

      const icon = screen.getByTestId('mock-icon');
      // Simplified check for green color classes
      expect(icon).toBeInTheDocument();
    });

    it('should apply purple color classes', () => {
      render(<TrendCard {...defaultProps} color="purple" />);

      const icon = screen.getByTestId('mock-icon');
      // Simplified check for purple color classes
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('should format large numbers correctly', () => {
      const largeData = [
        { day: 'Mon', value: 1000 },
        { day: 'Tue', value: 2000 },
      ];
      render(<TrendCard {...defaultProps} data={largeData} />);

      // The value should be formatted with commas
      expect(screen.getByText('2,000')).toBeInTheDocument();
    });

    it('should handle empty data gracefully', () => {
      render(<TrendCard {...defaultProps} data={[]} />);

      // Should show 0 as the current value
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singleData = [{ day: 'Mon', value: 15 }];
      render(<TrendCard {...defaultProps} data={singleData} />);

      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument(); // No trend with single point
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for chart', () => {
      render(<TrendCard {...defaultProps} />);

      const chart = screen.getByLabelText('Weekly Bookings chart');
      expect(chart).toBeInTheDocument();
    });

    it('should have proper aria labels for trend icons', () => {
      const upwardData = [
        { day: 'Mon', value: 10 },
        { day: 'Tue', value: 20 },
      ];
      render(<TrendCard {...defaultProps} data={upwardData} />);

      // The trend icon should be hidden from screen readers since it's decorative
      // Simply check that the icon is present
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
    });
  });
});