/**
 * LocalizedSelectEnhanced Component Tests
 *
 * Tests for LocalizedSelectEnhanced - enhanced select with search and multi-select
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LocalizedSelectEnhanced,
  LocalizedMultiSelect,
} from '@/components/common/LocalizedSelectEnhanced';

// Mock pointer capture and scroll methods for Radix UI
beforeEach(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.scrollIntoView = () => {};
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const translations: Record<string, string> = {
        'loading': 'Loading...',
        'select_option': 'Select an option',
        'select_options': 'Select options',
        'no_options': 'No options available',
        'search': 'Search...',
        'no_results': 'No results found.',
      };
      return translations[key] || defaultValue || key;
    },
  }),
}));

// Mock useLocalizedDbValueEnhanced hook
const mockUseLocalizedDbValueEnhanced = vi.fn();
vi.mock('@/hooks/shared/useLocalizedDbValueEnhanced', () => ({
  useLocalizedDbValueEnhanced: (entityType: string, options?: any) =>
    mockUseLocalizedDbValueEnhanced(entityType, options),
}));

describe('LocalizedSelectEnhanced Component', () => {
  const mockOptions = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2', description: 'Second option' },
    { value: 'opt3', label: 'Option 3' },
  ];

  beforeEach(() => {
    mockUseLocalizedDbValueEnhanced.mockReturnValue({
      options: mockOptions,
      loading: false,
      error: null,
      search: vi.fn(),
      isSearching: false,
    });
  });

  describe('Basic Rendering', () => {
    it('should render standard select by default', () => {
      const { container } = render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          placeholder="Select type"
        />
      );

      expect(screen.getByText('Select type')).toBeInTheDocument();
    });

    it('should use default placeholder', () => {
      render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseLocalizedDbValueEnhanced.mockReturnValue({
        options: [],
        loading: true,
        error: null,
        search: vi.fn(),
        isSearching: false,
      });

      render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should disable select when loading', () => {
      mockUseLocalizedDbValueEnhanced.mockReturnValue({
        options: [],
        loading: true,
        error: null,
        search: vi.fn(),
        isSearching: false,
      });

      render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should log error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockUseLocalizedDbValueEnhanced.mockReturnValue({
        options: [],
        loading: false,
        error: new Error('Failed to fetch'),
        search: vi.fn(),
        isSearching: false,
      });

      render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'LocalizedSelectEnhanced error for facility_type:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should still render when error occurs', () => {
      mockUseLocalizedDbValueEnhanced.mockReturnValue({
        options: [],
        loading: false,
        error: new Error('Failed to fetch'),
        search: vi.fn(),
        isSearching: false,
      });

      const { container } = render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <LocalizedSelectEnhanced
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
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
          className="custom-class"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-class');
    });

    it('should include min-height class', () => {
      render(
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('min-h-12');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(
        <LocalizedSelectEnhanced
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
        <LocalizedSelectEnhanced
          entityType="facility_type"
          value=""
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-label', 'Select facility_type');
    });
  });
});

describe('LocalizedMultiSelect Component', () => {
  const mockOptions = [
    { value: 'feat1', label: 'Feature 1' },
    { value: 'feat2', label: 'Feature 2', description: 'Second feature' },
    { value: 'feat3', label: 'Feature 3' },
  ];

  beforeEach(() => {
    mockUseLocalizedDbValueEnhanced.mockReturnValue({
      options: mockOptions,
      loading: false,
      error: null,
      search: vi.fn(),
      isSearching: false,
    });
  });

  describe('Basic Rendering', () => {
    it('should render multi-select', () => {
      const { container } = render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
          placeholder="Select features"
        />
      );

      expect(screen.getByText('Select features')).toBeInTheDocument();
    });

    it('should use default placeholder', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Select options')).toBeInTheDocument();
    });

    it('should have combobox role', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseLocalizedDbValueEnhanced.mockReturnValue({
        options: [],
        loading: true,
        error: null,
        search: vi.fn(),
        isSearching: false,
      });

      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should disable when loading', () => {
      mockUseLocalizedDbValueEnhanced.mockReturnValue({
        options: [],
        loading: true,
        error: null,
        search: vi.fn(),
        isSearching: false,
      });

      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should log error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockUseLocalizedDbValueEnhanced.mockReturnValue({
        options: [],
        loading: false,
        error: new Error('Failed to fetch'),
        search: vi.fn(),
        isSearching: false,
      });

      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'LocalizedMultiSelect error for accessibility:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
          disabled={true}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should be enabled by default', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
          className="custom-multi"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-multi');
    });

    it('should include min-height class', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('min-h-12');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
          ariaLabel="Accessibility features selector"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-label', 'Accessibility features selector');
    });

    it('should use default aria-label based on entityType', () => {
      render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-label', 'Select accessibility');
    });
  });

  describe('Integration', () => {
    it('should work in form context', () => {
      render(
        <form>
          <label htmlFor="features">Features</label>
          <LocalizedMultiSelect
            entityType="accessibility"
            value={[]}
            onValueChange={vi.fn()}
          />
        </form>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={[]}
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Select options')).toBeInTheDocument();

      rerender(
        <LocalizedMultiSelect
          entityType="accessibility"
          value={['feat1']}
          onValueChange={vi.fn()}
        />
      );

      expect(screen.getByText('Feature 1')).toBeInTheDocument();
    });
  });
});
