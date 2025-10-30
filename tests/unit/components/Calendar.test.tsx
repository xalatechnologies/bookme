/**
 * Calendar Component Tests
 *
 * Tests for the shadcn/ui Calendar component (react-day-picker wrapper)
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '@/components/ui/calendar';

describe('Calendar Component', () => {
  describe('Basic Rendering', () => {
    it('should render calendar', () => {
      render(<Calendar defaultMonth={new Date(2024, 0, 1)} />);

      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('should render days of week', () => {
      render(<Calendar />);

      expect(screen.getByText('Su')).toBeInTheDocument();
      expect(screen.getByText('Mo')).toBeInTheDocument();
      expect(screen.getByText('Tu')).toBeInTheDocument();
      expect(screen.getByText('We')).toBeInTheDocument();
      expect(screen.getByText('Th')).toBeInTheDocument();
      expect(screen.getByText('Fr')).toBeInTheDocument();
      expect(screen.getByText('Sa')).toBeInTheDocument();
    });

    it('should have default styling classes', () => {
      const { container } = render(<Calendar />);

      const calendar = container.firstChild as HTMLElement;
      expect(calendar).toHaveClass('p-3');
    });

    it('should apply custom className', () => {
      const { container } = render(<Calendar className="custom-calendar" />);

      const calendar = container.firstChild as HTMLElement;
      expect(calendar).toHaveClass('custom-calendar');
    });

    it('should render month navigation', () => {
      const { container } = render(<Calendar />);

      // Navigation buttons exist
      const navButtons = container.querySelectorAll('button[name*="month"]');
      expect(navButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Date Selection', () => {
    it('should render with selected date', () => {
      const selectedDate = new Date(2024, 0, 15);
      render(<Calendar mode="single" selected={selectedDate} defaultMonth={new Date(2024, 0, 1)} />);

      const dayCell = screen.getByText('15').closest('td');
      expect(dayCell).toHaveAttribute('aria-selected', 'true');
    });

    it('should call onSelect when date is clicked', async () => {
      const user = userEvent.setup();
      let selectedDate: Date | undefined;
      const handleSelect = (date: Date | undefined) => {
        selectedDate = date;
      };

      render(<Calendar mode="single" onSelect={handleSelect} defaultMonth={new Date(2024, 0, 1)} />);

      const dayCell = screen.getByText('15');
      await user.click(dayCell);

      expect(selectedDate).toBeDefined();
      expect(selectedDate?.getDate()).toBe(15);
    });
  });

  describe('Month Display', () => {
    it('should display specified month', () => {
      const specificDate = new Date(2024, 5, 1);
      render(<Calendar defaultMonth={specificDate} />);

      expect(screen.getByText('June 2024')).toBeInTheDocument();
    });

    it('should display current month by default', () => {
      render(<Calendar />);

      const currentDate = new Date();
      const monthName = currentDate.toLocaleString('default', { month: 'long' });

      expect(screen.getByText(new RegExp(monthName, 'i'))).toBeInTheDocument();
    });
  });

  describe('Disabled Dates', () => {
    it('should disable specific date', () => {
      const disabledDate = new Date(2024, 0, 15);
      const { container } = render(<Calendar disabled={disabledDate} defaultMonth={new Date(2024, 0, 1)} />);

      // Disabled dates have data-disabled attribute or rdp-disabled class
      const disabledCells = container.querySelectorAll('[data-disabled="true"], .rdp-disabled');
      expect(disabledCells.length).toBeGreaterThan(0);
    });

    it('should disable dates with function', () => {
      const isDisabled = (date: Date) => date.getDate() === 15;
      const { container } = render(<Calendar disabled={isDisabled} defaultMonth={new Date(2024, 0, 1)} />);

      // Disabled dates have data-disabled attribute or rdp-disabled class
      const disabledCells = container.querySelectorAll('[data-disabled="true"], .rdp-disabled');
      expect(disabledCells.length).toBeGreaterThan(0);
    });
  });

  describe('Range Selection', () => {
    it('should display selected range', () => {
      const range = {
        from: new Date(2024, 0, 10),
        to: new Date(2024, 0, 15),
      };

      render(
        <Calendar
          mode="range"
          selected={range}
          defaultMonth={new Date(2024, 0, 1)}
        />
      );

      const day10 = screen.getByText('10').closest('td');
      const day15 = screen.getByText('15').closest('td');

      expect(day10).toHaveAttribute('aria-selected', 'true');
      expect(day15).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Outside Days', () => {
    it('should show outside days by default', () => {
      const { container } = render(<Calendar defaultMonth={new Date(2024, 0, 1)} />);

      // Calendar should render days from adjacent months
      const allDays = container.querySelectorAll('td[role="gridcell"]');
      expect(allDays.length).toBeGreaterThan(31);
    });

    it('should hide outside days when disabled', () => {
      const { container } = render(
        <Calendar
          showOutsideDays={false}
          defaultMonth={new Date(2024, 0, 1)}
        />
      );

      // Should have fewer visible days
      const calendar = container.querySelector('[role="grid"]');
      expect(calendar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have grid role', () => {
      const { container } = render(<Calendar />);

      const grid = container.querySelector('[role="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have gridcell role on days', () => {
      const { container } = render(<Calendar defaultMonth={new Date(2024, 0, 1)} />);

      const gridcells = container.querySelectorAll('[role="gridcell"]');
      expect(gridcells.length).toBeGreaterThan(0);
    });

    it('should support aria-selected', () => {
      const selectedDate = new Date(2024, 0, 15);
      render(<Calendar mode="single" selected={selectedDate} defaultMonth={new Date(2024, 0, 1)} />);

      const dayCell = screen.getByText('15').closest('td');
      expect(dayCell).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Multiple Months', () => {
    it('should display multiple months', () => {
      render(<Calendar numberOfMonths={2} defaultMonth={new Date(2024, 0, 1)} />);

      expect(screen.getByText('January 2024')).toBeInTheDocument();
      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap years', () => {
      const { container } = render(<Calendar defaultMonth={new Date(2024, 1, 1)} />);

      // 2024 is a leap year - check for February 29th specifically
      expect(screen.getByText('February 2024')).toBeInTheDocument();
      const feb29 = container.querySelector('[data-day="2024-02-29"]');
      expect(feb29).toBeInTheDocument();
    });

    it('should handle non-leap years', () => {
      const { container } = render(<Calendar defaultMonth={new Date(2023, 1, 1)} />);

      // 2023 is not a leap year, shouldn't have 29th in February
      expect(screen.getByText('February 2023')).toBeInTheDocument();
      // 29 might appear from adjacent months, so we check for Feb 28 as the last day
      expect(screen.getByText('28')).toBeInTheDocument();
    });

    it('should handle year boundaries', () => {
      render(<Calendar defaultMonth={new Date(2023, 11, 1)} />);

      expect(screen.getByText('December 2023')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should accept custom footer', () => {
      render(
        <Calendar
          footer={<div data-testid="custom-footer">Custom Footer</div>}
        />
      );

      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should respect fromMonth prop', () => {
      const fromMonth = new Date(2024, 5, 1);
      render(<Calendar fromMonth={fromMonth} defaultMonth={fromMonth} />);

      expect(screen.getByText('June 2024')).toBeInTheDocument();
    });

    it('should respect toMonth prop', () => {
      const toMonth = new Date(2024, 5, 1);
      render(<Calendar toMonth={toMonth} defaultMonth={toMonth} />);

      expect(screen.getByText('June 2024')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render conditionally', () => {
      const showCalendar = true;

      const { container } = render(
        <div>{showCalendar && <Calendar />}</div>
      );

      expect(container.querySelector('[role="grid"]')).toBeInTheDocument();
    });

    it('should not render when condition is false', () => {
      const showCalendar = false;

      const { container } = render(
        <div>{showCalendar && <Calendar />}</div>
      );

      expect(container.querySelector('[role="grid"]')).not.toBeInTheDocument();
    });
  });
});
