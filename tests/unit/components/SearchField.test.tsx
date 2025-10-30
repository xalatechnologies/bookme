/**
 * SearchField Component Tests
 *
 * Tests for SearchField - universal search component with dropdown results
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField, ISearchResult } from '@/components/common/search/SearchField';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'search.placeholder': 'Search...',
        'search.search_admin': 'Search admin',
        'search.search_venues': 'Search venues',
        'search.search_facilities': 'Search facilities',
        'search.no_results': 'No results found',
        'search.group_facilities': 'Facilities',
        'search.group_users': 'Users',
        'search.group_bookings': 'Bookings',
        'aria.search_input': 'Search input',
      };
      return translations[key] || key;
    },
  }),
}));

describe('SearchField Component', () => {
  const mockResults: ISearchResult[] = [
    {
      id: '1',
      type: 'facility',
      title: 'Conference Room A',
      subtitle: 'Floor 2',
      iconType: 'building',
    },
    {
      id: '2',
      type: 'user',
      title: 'John Doe',
      subtitle: 'john@example.com',
      iconType: 'users',
    },
  ];

  describe('Basic Rendering', () => {
    it('should render search field', () => {
      render(
        <SearchField value="" onChange={vi.fn()} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render search icon', () => {
      const { container } = render(
        <SearchField value="" onChange={vi.fn()} />
      );

      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should have default placeholder', () => {
      render(
        <SearchField value="" onChange={vi.fn()} variant="simple" />
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should use custom placeholder', () => {
      render(
        <SearchField
          value=""
          onChange={vi.fn()}
          placeholder="Custom placeholder"
        />
      );

      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should display current value', () => {
      render(
        <SearchField value="test query" onChange={vi.fn()} />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });

    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <SearchField value="" onChange={handleChange} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'search');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onKeyDown when key is pressed', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();

      render(
        <SearchField value="" onChange={vi.fn()} onKeyDown={handleKeyDown} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'a');

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should render admin variant', () => {
      render(
        <SearchField value="" onChange={vi.fn()} variant="admin" />
      );

      expect(screen.getByPlaceholderText('Search admin')).toBeInTheDocument();
    });

    it('should render user variant', () => {
      render(
        <SearchField value="" onChange={vi.fn()} variant="user" />
      );

      expect(screen.getByPlaceholderText('Search venues')).toBeInTheDocument();
    });

    it('should render global variant', () => {
      render(
        <SearchField value="" onChange={vi.fn()} variant="global" />
      );

      expect(screen.getByPlaceholderText('Search facilities')).toBeInTheDocument();
    });

    it('should render simple variant by default', () => {
      render(
        <SearchField value="" onChange={vi.fn()} />
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcut', () => {
    it('should not show shortcut by default', () => {
      const { container } = render(
        <SearchField value="" onChange={vi.fn()} />
      );

      expect(screen.queryByText('K')).not.toBeInTheDocument();
    });

    it('should show shortcut when enabled', () => {
      render(
        <SearchField value="" onChange={vi.fn()} showShortcut={true} />
      );

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('should render Command icon with shortcut', () => {
      const { container } = render(
        <SearchField value="" onChange={vi.fn()} showShortcut={true} />
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(1);
    });
  });

  describe('Search Results Dropdown', () => {
    it('should not show dropdown when isOpen is false', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={false}
        />
      );

      expect(screen.queryByText('Conference Room A')).not.toBeInTheDocument();
    });

    it('should show dropdown when isOpen is true', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
        />
      );

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display result titles', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
        />
      );

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display result subtitles', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
        />
      );

      expect(screen.getByText('Floor 2')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should not show dropdown when no results', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={[]}
          isOpen={true}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Result Click Behavior', () => {
    it('should call onResultClick when result is clicked', async () => {
      const user = userEvent.setup();
      const handleResultClick = vi.fn();

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          onResultClick={handleResultClick}
          isOpen={true}
        />
      );

      await user.click(screen.getByText('Conference Room A'));

      expect(handleResultClick).toHaveBeenCalledWith(mockResults[0]);
    });

    it('should call onOpenChange when result is clicked', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          onResultClick={vi.fn()}
          onOpenChange={handleOpenChange}
          isOpen={true}
        />
      );

      await user.click(screen.getByText('Conference Room A'));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('should handle keyboard Enter on result', async () => {
      const user = userEvent.setup();
      const handleResultClick = vi.fn();

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          onResultClick={handleResultClick}
          isOpen={true}
        />
      );

      // Find the button element containing the result
      const resultButtons = screen.getAllByRole('button');
      const resultButton = resultButtons.find(btn => btn.textContent?.includes('Conference Room A'));

      if (resultButton) {
        resultButton.focus();
        await user.keyboard('{Enter}');
      }

      expect(handleResultClick).toHaveBeenCalledWith(mockResults[0]);
    });

    it('should handle keyboard Space on result', async () => {
      const user = userEvent.setup();
      const handleResultClick = vi.fn();

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          onResultClick={handleResultClick}
          isOpen={true}
        />
      );

      // Find the button element containing the result
      const resultButtons = screen.getAllByRole('button');
      const resultButton = resultButtons.find(btn => btn.textContent?.includes('Conference Room A'));

      if (resultButton) {
        resultButton.focus();
        await user.keyboard(' ');
      }

      expect(handleResultClick).toHaveBeenCalledWith(mockResults[0]);
    });
  });

  describe('Grouped Results', () => {
    it('should not show group headers when not grouped', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
          grouped={false}
        />
      );

      expect(screen.queryByText('Facilities')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    it('should show group headers when grouped', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
          grouped={true}
        />
      );

      expect(screen.getByText('Facilities')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should use custom group title mapper', () => {
      const customMapper = (type: string) => `Custom ${type}`;

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
          grouped={true}
          getGroupTitle={customMapper}
        />
      );

      expect(screen.getByText('Custom facility')).toBeInTheDocument();
      expect(screen.getByText('Custom user')).toBeInTheDocument();
    });
  });

  describe('Result Icons', () => {
    it('should render default icon for results', () => {
      const { container } = render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
        />
      );

      // Icons should be rendered
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should render custom icon when getIcon provided', () => {
      const customIcon = () => <div data-testid="custom-icon">Custom</div>;

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
          getIcon={customIcon}
        />
      );

      expect(screen.getAllByTestId('custom-icon')).toHaveLength(mockResults.length);
    });

    it('should render image when provided', () => {
      const resultsWithImage: ISearchResult[] = [
        {
          id: '1',
          type: 'facility',
          title: 'Room',
          iconType: 'building',
          image: '/path/to/image.jpg',
        },
      ];

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={resultsWithImage}
          isOpen={true}
        />
      );

      const img = screen.getByAltText('Room');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/path/to/image.jpg');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on input', () => {
      render(
        <SearchField value="" onChange={vi.fn()} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search input');
    });

    it('should use custom aria-label', () => {
      render(
        <SearchField
          value=""
          onChange={vi.fn()}
          ariaLabel="Custom search"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Custom search');
    });

    it('should have role="button" on results', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(mockResults.length);
    });

    it('should have tabIndex on results for keyboard navigation', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
        />
      );

      const firstResult = screen.getByText('Conference Room A').closest('div[role="button"]');
      expect(firstResult).toHaveAttribute('tabIndex', '0');
    });

    it('should have aria-hidden on search icon', () => {
      const { container } = render(
        <SearchField value="" onChange={vi.fn()} />
      );

      const searchIcon = container.querySelector('svg[aria-hidden="true"]');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <SearchField
          value=""
          onChange={vi.fn()}
          className="custom-search"
        />
      );

      const wrapper = container.querySelector('.custom-search');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Refs', () => {
    it('should accept inputRef', () => {
      const inputRef = React.createRef<HTMLInputElement>();

      render(
        <SearchField value="" onChange={vi.fn()} inputRef={inputRef} />
      );

      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should accept containerRef', () => {
      const containerRef = React.createRef<HTMLDivElement>();

      render(
        <SearchField value="" onChange={vi.fn()} containerRef={containerRef} />
      );

      expect(containerRef.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Focus Behavior', () => {
    it('should call onOpenChange when focused with value and results', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          onOpenChange={handleOpenChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('should not open when focused without value', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <SearchField
          value=""
          onChange={vi.fn()}
          results={mockResults}
          onOpenChange={handleOpenChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results array', () => {
      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={[]}
          isOpen={true}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle result without subtitle', () => {
      const resultsNoSubtitle: ISearchResult[] = [
        {
          id: '1',
          type: 'facility',
          title: 'Room A',
          iconType: 'building',
        },
      ];

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={resultsNoSubtitle}
          isOpen={true}
        />
      );

      expect(screen.getByText('Room A')).toBeInTheDocument();
    });

    it('should handle very long result titles', () => {
      const longTitle = 'A'.repeat(200);
      const longResults: ISearchResult[] = [
        {
          id: '1',
          type: 'facility',
          title: longTitle,
          iconType: 'building',
        },
      ];

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={longResults}
          isOpen={true}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle many results', () => {
      const manyResults = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        type: 'facility',
        title: `Result ${i}`,
        iconType: 'building',
      }));

      render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={manyResults}
          isOpen={true}
        />
      );

      expect(screen.getByText('Result 0')).toBeInTheDocument();
      expect(screen.getByText('Result 49')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const { container } = render(
        <SearchField value="" onChange={vi.fn()} />
      );

      const input = container.querySelector('.dark\\:border-gray-600');
      expect(input).toBeInTheDocument();
    });

    it('should have dark mode classes on dropdown', () => {
      const { container } = render(
        <SearchField
          value="query"
          onChange={vi.fn()}
          results={mockResults}
          isOpen={true}
        />
      );

      const dropdown = container.querySelector('.dark\\:bg-gray-800');
      expect(dropdown).toBeInTheDocument();
    });
  });
});
