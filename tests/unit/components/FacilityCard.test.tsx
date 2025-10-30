/**
 * FacilityCard Component Tests
 *
 * Comprehensive test suite for the FacilityCard component
 * covering rendering, interactions, favorite management, and accessibility.
 *
 * Test Coverage:
 * - Rendering facility information
 * - User interactions (click, favorite, view details)
 * - Favorite toggle functionality
 * - Image display and error handling
 * - Accessibility features
 * - Responsive design
 * - i18n translations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FacilityCardUser } from '@/components/features/facilities/components/FacilityCard/FacilityCardUser';
import type { Facility } from '@/types/database';

expect.extend(toHaveNoViolations);

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'facilities.viewDetails': 'Vis detaljer',
        'facilities.book': 'Book nå',
        'facilities.addToFavorites': 'Legg til favoritter',
        'facilities.removeFromFavorites': 'Fjern fra favoritter',
        'facilities.capacity': 'Kapasitet',
        'facilities.priceFrom': 'Fra',
        'facilities.perHour': 'per time',
        'facilities.available': 'Tilgjengelig',
        'facilities.unavailable': 'Ikke tilgjengelig',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'no',
    },
  }),
}));

// Mock router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock favorite hook
const mockToggleFavorite = vi.fn();
vi.mock('@/hooks/features/favorites', () => ({
  useFavorites: () => ({
    isFavorite: (id: string) => id === 'fav-facility-1',
    toggleFavorite: mockToggleFavorite,
  }),
}));

/**
 * Create mock facility with default values
 */
const createMockFacility = (overrides?: Partial<Facility>): Facility => ({
  id: 'facility-123',
  name: 'Conference Room A',
  description: 'Modern conference room with AV equipment',
  address: 'Oslo Street 123',
  city: 'Oslo',
  postal_code: '0150',
  capacity: 50,
  price_per_hour_cents: 50000, // 500 kr
  is_available: true,
  images: [
    { url: 'https://example.com/image1.jpg', alt: 'Room view 1' },
    { url: 'https://example.com/image2.jpg', alt: 'Room view 2' },
  ],
  amenities: ['wifi', 'projector', 'whiteboard'],
  organization_id: 'org-001',
  created_at: '2025-10-01T10:00:00Z',
  updated_at: '2025-10-30T10:00:00Z',
  ...overrides,
});

/**
 * Render FacilityCard with default props
 */
const renderFacilityCard = (facility?: Partial<Facility>) => {
  const mockFacility = createMockFacility(facility);
  const onBookClick = vi.fn();

  return {
    ...render(<FacilityCardUser facility={mockFacility} onBookClick={onBookClick} />),
    onBookClick,
    facility: mockFacility,
  };
};

describe('FacilityCardUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render facility basic information', () => {
      renderFacilityCard();

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.getByText(/Modern conference room/)).toBeInTheDocument();
      expect(screen.getByText('Oslo')).toBeInTheDocument();
    });

    it('should display facility image', () => {
      renderFacilityCard();

      const image = screen.getByAltText('Room view 1');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
    });

    it('should display capacity information', () => {
      renderFacilityCard({ capacity: 100 });

      expect(screen.getByText(/kapasitet/i)).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should display price information', () => {
      renderFacilityCard({ price_per_hour_cents: 75000 }); // 750 kr

      expect(screen.getByText(/fra/i)).toBeInTheDocument();
      expect(screen.getByText(/750\.00 kr/i)).toBeInTheDocument();
      expect(screen.getByText(/per time/i)).toBeInTheDocument();
    });

    it('should show availability status', () => {
      const { rerender } = renderFacilityCard({ is_available: true });

      expect(screen.getByText(/tilgjengelig/i)).toBeInTheDocument();

      rerender(
        <FacilityCardUser
          facility={createMockFacility({ is_available: false })}
          onBookClick={vi.fn()}
        />
      );

      expect(screen.getByText(/ikke tilgjengelig/i)).toBeInTheDocument();
    });

    it('should display amenities', () => {
      renderFacilityCard({
        amenities: ['wifi', 'projector', 'parking'],
      });

      expect(screen.getByText(/wifi/i)).toBeInTheDocument();
      expect(screen.getByText(/projector/i)).toBeInTheDocument();
      expect(screen.getByText(/parking/i)).toBeInTheDocument();
    });

    it('should show placeholder image when no images available', () => {
      renderFacilityCard({ images: [] });

      const placeholderImage = screen.getByAltText(/placeholder/i);
      expect(placeholderImage).toBeInTheDocument();
    });

    it('should display address information', () => {
      renderFacilityCard({
        address: 'Main Street 456',
        city: 'Bergen',
        postal_code: '5003',
      });

      expect(screen.getByText('Main Street 456')).toBeInTheDocument();
      expect(screen.getByText('Bergen')).toBeInTheDocument();
      expect(screen.getByText('5003')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onBookClick when book button is clicked', async () => {
      const user = userEvent.setup();
      const { onBookClick, facility } = renderFacilityCard();

      const bookButton = screen.getByText(/book nå/i);
      await user.click(bookButton);

      expect(onBookClick).toHaveBeenCalledWith(facility);
      expect(onBookClick).toHaveBeenCalledTimes(1);
    });

    it('should navigate to facility details when view details is clicked', async () => {
      const user = userEvent.setup();
      const { facility } = renderFacilityCard();

      const viewDetailsButton = screen.getByText(/vis detaljer/i);
      await user.click(viewDetailsButton);

      expect(viewDetailsButton.closest('a')).toHaveAttribute(
        'href',
        `/facilities/${facility.id}`
      );
    });

    it('should toggle favorite when favorite button is clicked', async () => {
      const user = userEvent.setup();
      const { facility } = renderFacilityCard();

      const favoriteButton = screen.getByLabelText(/legg til favoritter/i);
      await user.click(favoriteButton);

      expect(mockToggleFavorite).toHaveBeenCalledWith(facility.id);
      expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
    });

    it('should show different favorite icon when facility is favorited', () => {
      // Facility with id 'fav-facility-1' is mocked as favorite
      renderFacilityCard({ id: 'fav-facility-1' });

      const favoriteButton = screen.getByLabelText(/fjern fra favoritter/i);
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should prevent booking unavailable facilities', () => {
      renderFacilityCard({ is_available: false });

      const bookButton = screen.getByText(/book nå/i);
      expect(bookButton).toBeDisabled();
    });

    it('should open card click handler when card is clicked', async () => {
      const user = userEvent.setup();
      const onCardClick = vi.fn();

      render(
        <FacilityCardUser
          facility={createMockFacility()}
          onBookClick={vi.fn()}
          onCardClick={onCardClick}
        />
      );

      const card = screen.getByRole('article');
      await user.click(card);

      expect(onCardClick).toHaveBeenCalled();
    });
  });

  describe('Image Handling', () => {
    it('should display first image from images array', () => {
      renderFacilityCard({
        images: [
          { url: 'https://example.com/first.jpg', alt: 'First image' },
          { url: 'https://example.com/second.jpg', alt: 'Second image' },
        ],
      });

      const image = screen.getByAltText('First image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/first.jpg');
    });

    it('should handle broken images gracefully', () => {
      renderFacilityCard({
        images: [{ url: 'https://example.com/broken.jpg', alt: 'Broken image' }],
      });

      const image = screen.getByAltText('Broken image');
      expect(image).toHaveAttribute('onerror'); // Should have error handler
    });

    it('should display multiple images in gallery', () => {
      renderFacilityCard({
        images: [
          { url: 'https://example.com/img1.jpg', alt: 'Image 1' },
          { url: 'https://example.com/img2.jpg', alt: 'Image 2' },
          { url: 'https://example.com/img3.jpg', alt: 'Image 3' },
        ],
      });

      // Check if gallery indicators are present (e.g., "3 photos")
      expect(screen.getByText(/3 bilder/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderFacilityCard();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for buttons', () => {
      renderFacilityCard();

      expect(screen.getByLabelText(/legg til favoritter/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /book nå/i })).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      renderFacilityCard();

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const { onBookClick } = renderFacilityCard();

      // Tab to book button
      await user.tab();
      await user.tab();

      const bookButton = screen.getByText(/book nå/i);
      await user.keyboard('{Enter}');

      expect(onBookClick).toHaveBeenCalled();
    });

    it('should have alt text for images', () => {
      renderFacilityCard();

      const image = screen.getByAltText('Room view 1');
      expect(image).toHaveAttribute('alt', 'Room view 1');
    });

    it('should indicate disabled state for unavailable facilities', () => {
      renderFacilityCard({ is_available: false });

      const bookButton = screen.getByText(/book nå/i);
      expect(bookButton).toHaveAttribute('disabled');
      expect(bookButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Price Display', () => {
    it('should format price correctly', () => {
      renderFacilityCard({ price_per_hour_cents: 125050 }); // 1250.50 kr

      expect(screen.getByText(/1250\.50 kr/i)).toBeInTheDocument();
    });

    it('should handle zero price', () => {
      renderFacilityCard({ price_per_hour_cents: 0 });

      expect(screen.getByText(/0\.00 kr/i)).toBeInTheDocument();
    });

    it('should handle large prices', () => {
      renderFacilityCard({ price_per_hour_cents: 999999900 }); // 9,999,999 kr

      expect(screen.getByText(/9999999\.00 kr/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render in grid layout', () => {
      const { container } = renderFacilityCard();

      const card = container.querySelector('.facility-card');
      expect(card).toHaveClass('grid-item'); // Assuming grid styling
    });

    it('should have mobile-friendly touch targets', () => {
      renderFacilityCard();

      const bookButton = screen.getByText(/book nå/i);
      const styles = window.getComputedStyle(bookButton);

      // Button should have minimum 44x44px touch target (WCAG 2.1 AA)
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Edge Cases', () => {
    it('should handle facility with no description', () => {
      renderFacilityCard({ description: '' });

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('should handle facility with no amenities', () => {
      renderFacilityCard({ amenities: [] });

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.queryByText(/amenities/i)).not.toBeInTheDocument();
    });

    it('should handle very long facility names', () => {
      const longName = 'A'.repeat(200);
      renderFacilityCard({ name: longName });

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle facilities with null values', () => {
      const facilityWithNulls = createMockFacility({
        description: null as any,
        amenities: null as any,
        images: null as any,
      });

      expect(() =>
        render(<FacilityCardUser facility={facilityWithNulls} onBookClick={vi.fn()} />)
      ).not.toThrow();
    });

    it('should handle rapid favorite toggle clicks', async () => {
      const user = userEvent.setup();
      renderFacilityCard();

      const favoriteButton = screen.getByLabelText(/legg til favoritter/i);

      // Click rapidly
      await user.click(favoriteButton);
      await user.click(favoriteButton);
      await user.click(favoriteButton);

      // Should debounce or handle gracefully
      expect(mockToggleFavorite).toHaveBeenCalled();
    });
  });

  describe('Integration with shadcn/ui Components', () => {
    it('should render Card component from shadcn/ui', () => {
      const { container } = renderFacilityCard();

      const card = container.querySelector('[role="article"]');
      expect(card).toHaveClass('rounded-lg'); // Card styling
    });

    it('should render Button components with correct variants', () => {
      renderFacilityCard();

      const bookButton = screen.getByText(/book nå/i);
      expect(bookButton).toHaveClass('btn-primary'); // Primary variant
    });

    it('should render Badge for availability status', () => {
      renderFacilityCard({ is_available: true });

      const badge = screen.getByText(/tilgjengelig/i);
      expect(badge.tagName).toBe('SPAN'); // Badges are typically spans
    });
  });
});
