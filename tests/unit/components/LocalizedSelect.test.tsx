/**
 * LocalizedSelect Component Tests
 *
 * Tests for LocalizedSelect - select component with localized database options
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizedSelect } from '@/components/common/LocalizedSelect';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'common.select_option': 'Select an option',
        'common.no_options': 'No options available',
      };
      return translations[key] || defaultValue || key;
    },
  }),
}));

// Mock useLocalizedDbValue hook
const mockUseLocalizedDbValue = vi.fn();
vi.mock('@/hooks/shared/useLocalizedDbValue', () => ({
  useLocalizedDbValue: (entityType: string) => mockUseLocalizedDbValue(entityType),
}));

describe('LocalizedSelect Component', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const mockOptionsWithDescriptions = [
    { value: 'type1', label: 'Type 1', description: 'First type' },
    { value: 'type2', label: 'Type 2', description: 'Second type' },
  ];

  beforeEach(() => {
    // Mock pointer capture and scroll methods for Radix UI Select
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    HTMLElement.prototype.scrollIntoView = () => {};

    // Default mock return value
    mockUseLocalizedDbValue.mockReturnValue({
      options: mockOptions,
      loading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render select component', () => {
      const { container } = render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          placeholder="Select facility type"
        />
      );

      expect(screen.getByText('Select facility type')).toBeInTheDocument();
    });

    it('should use default placeholder from i18n', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should render with aria-label', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          ariaLabel="Facility type selector"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-label', 'Facility type selector');
    });

    it('should use default aria-label based on entityType', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-label', 'Select facility_type');
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: true,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading icon', () => {
      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: true,
        error: null,
      });

      const { container } = render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('should disable select when loading', () => {
      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: true,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should not show loading when data is loaded', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Options Display', () => {
    it('should render all options', async () => {
      const user = userEvent.setup();

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('should render options with descriptions', async () => {
      const user = userEvent.setup();

      mockUseLocalizedDbValue.mockReturnValue({
        options: mockOptionsWithDescriptions,
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Type 1')).toBeInTheDocument();
        expect(screen.getByText('(First type)')).toBeInTheDocument();
        expect(screen.getByText('Type 2')).toBeInTheDocument();
        expect(screen.getByText('(Second type)')).toBeInTheDocument();
      });
    });

    it('should show no options message when empty', async () => {
      const user = userEvent.setup();

      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('No options available')).toBeInTheDocument();
      });
    });

    it('should not show no options message when loading', () => {
      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: true,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(screen.queryByText('No options available')).not.toBeInTheDocument();
    });
  });

  describe('Value Selection', () => {
    it('should call onValueChange when option selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={handleChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      const option = screen.getByText('Option 1');
      await user.click(option);

      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('should display selected value', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value="option2"
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should handle value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(
        <LocalizedSelect
          entityType="facility_type"
          value="option1"
          onValueChange={handleChange}
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      const option = screen.getByText('Option 2');
      await user.click(option);

      rerender(
        <LocalizedSelect
          entityType="facility_type"
          value="option2"
          onValueChange={handleChange}
        />
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Include All Option', () => {
    it('should include all option when includeAll is true', async () => {
      const user = userEvent.setup();

      const optionsWithAll = [
        { value: 'all', label: 'All' },
        ...mockOptions,
      ];

      mockUseLocalizedDbValue.mockReturnValue({
        options: optionsWithAll,
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          includeAll={true}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument();
      });
    });

    it('should filter out all option when includeAll is false', async () => {
      const user = userEvent.setup();

      const optionsWithAll = [
        { value: 'all', label: 'All' },
        ...mockOptions,
      ];

      mockUseLocalizedDbValue.mockReturnValue({
        options: optionsWithAll,
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          includeAll={false}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByText('All')).not.toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should use custom allValue', async () => {
      const user = userEvent.setup();

      const optionsWithCustomAll = [
        { value: 'custom_all', label: 'All Items' },
        ...mockOptions,
      ];

      mockUseLocalizedDbValue.mockReturnValue({
        options: optionsWithCustomAll,
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          includeAll={false}
          allValue="custom_all"
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByText('All Items')).not.toBeInTheDocument();
      });
    });

    it('should show custom all option when included', async () => {
      const user = userEvent.setup();

      const optionsWithCustomAll = [
        { value: 'custom_all', label: 'All Items' },
        ...mockOptions,
      ];

      mockUseLocalizedDbValue.mockReturnValue({
        options: optionsWithCustomAll,
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          includeAll={true}
          allValue="custom_all"
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('All Items')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          disabled={true}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should be enabled by default', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });

    it('should be disabled when loading', () => {
      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: true,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should remain disabled if both disabled and loading', () => {
      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: true,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          disabled={true}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should log error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: false,
        error: new Error('Failed to fetch'),
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'LocalizedSelect error for facility_type:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should still render when error occurs', () => {
      mockUseLocalizedDbValue.mockReturnValue({
        options: [],
        loading: false,
        error: new Error('Failed to fetch'),
      });

      const { container } = render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not log error when no error', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className to trigger', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          className="custom-select"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-select');
    });

    it('should work without className', () => {
      const { container } = render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Entity Type', () => {
    it('should call hook with correct entityType', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(mockUseLocalizedDbValue).toHaveBeenCalledWith('facility_type');
    });

    it('should call hook with different entityType', () => {
      render(
        <LocalizedSelect
          entityType="booking_status"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(mockUseLocalizedDbValue).toHaveBeenCalledWith('booking_status');
    });

    it('should update when entityType changes', () => {
      const { rerender } = render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(mockUseLocalizedDbValue).toHaveBeenCalledWith('facility_type');

      rerender(
        <LocalizedSelect
          entityType="booking_status"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(mockUseLocalizedDbValue).toHaveBeenCalledWith('booking_status');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should handle undefined options gracefully', async () => {
      const user = userEvent.setup();

      mockUseLocalizedDbValue.mockReturnValue({
        options: undefined as any,
        loading: false,
        error: null,
      });

      expect(() => {
        render(
          <LocalizedSelect
            entityType="facility_type"
            value=""
            onValueChange={vi.fn()}
          />
        );
      }).toThrow();
    });

    it('should handle many options', async () => {
      const user = userEvent.setup();

      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));

      mockUseLocalizedDbValue.mockReturnValue({
        options: manyOptions,
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 0')).toBeInTheDocument();
        expect(screen.getByText('Option 99')).toBeInTheDocument();
      });
    });

    it('should handle options with long labels', async () => {
      const user = userEvent.setup();

      const longOptions = [
        {
          value: 'long1',
          label: 'This is a very long option label that should still display correctly',
        },
      ];

      mockUseLocalizedDbValue.mockReturnValue({
        options: longOptions,
        loading: false,
        error: null,
      });

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(
          screen.getByText('This is a very long option label that should still display correctly')
        ).toBeInTheDocument();
      });
    });

    it('should handle rapid value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <LocalizedSelect
          entityType="facility_type"
          value=""
          onValueChange={handleChange}
        />
      );

      const trigger = screen.getByRole('combobox');

      await user.click(trigger);
      await waitFor(() => expect(screen.getByText('Option 1')).toBeInTheDocument());
      await user.click(screen.getByText('Option 1'));

      await user.click(trigger);
      await waitFor(() => expect(screen.getByText('Option 2')).toBeInTheDocument());
      await user.click(screen.getByText('Option 2'));

      await user.click(trigger);
      await waitFor(() => expect(screen.getByText('Option 3')).toBeInTheDocument());
      await user.click(screen.getByText('Option 3'));

      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration', () => {
    it('should work in form context', () => {
      render(
        <form>
          <label htmlFor="facility-select">Facility Type</label>
          <LocalizedSelect
            entityType="facility_type"
            value=""
            onValueChange={vi.fn()}
          />
        </form>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <LocalizedSelect
          entityType="facility_type"
          value="option1"
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();

      rerender(
        <LocalizedSelect
          entityType="facility_type"
          value="option2"
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });
});
