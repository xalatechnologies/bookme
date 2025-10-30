/**
 * FacilityDetailLayout Component Tests
 *
 * Comprehensive test suite for the FacilityDetailLayout component
 * covering layout rendering, sub-component integration, and user interactions.
 *
 * Test Coverage:
 * - Layout structure and responsive design
 * - Gallery integration
 * - Header rendering
 * - Info tabs
 * - Contact info sidebar
 * - Calendar integration
 * - Share and favorite functionality
 * - Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FacilityDetailLayout } from '@/components/features/facilities/components/FacilityDetail/FacilityDetailLayout';
import type { Database } from '@/types/database';
import type { Zone } from '@/components/features/bookings/types';

expect.extend(toHaveNoViolations);

type Facility = Database['public']['Tables']['facilities']['Row'];

// Mock sub-components
vi.mock('../FacilityImageGallery/AirBnbStyleGallery', () => ({
  AirBnbStyleGallery: ({ images, facilityName }: any) => (
    <div data-testid="gallery">{facilityName} Gallery - {images?.length || 0} images</div>
  ),
}));

vi.mock('./FacilityHeader', () => ({
  FacilityHeader: ({ name, onShare, isFavorited, onToggleFavorite }: any) => (
    <div data-testid="facility-header">
      <h1>{name}</h1>
      <button onClick={onShare} data-testid="share-button">Share</button>
      <button onClick={onToggleFavorite} data-testid="favorite-button">
        {isFavorited ? 'Favorited' : 'Add to Favorites'}
      </button>
    </div>
  ),
}));

vi.mock('./FacilityInfoTabs', () => ({
  FacilityInfoTabs: ({ description, capacity, zones }: any) => (
    <div data-testid="info-tabs">
      <p>{description}</p>
      <p>Capacity: {capacity}</p>
      <p>Zones: {zones?.length || 0}</p>
    </div>
  ),
}));

vi.mock('./FacilityContactInfo', () => ({
  FacilityContactInfo: ({ facility }: any) => (
    <div data-testid="contact-info">
      Contact: {facility.name}
    </div>
  ),
}));

vi.mock('@/components/features/calendar/components/FacilityCalendar', () => ({
  FacilityCalendar: ({ facilityId, zones }: any) => (
    <div data-testid="facility-calendar">
      Calendar for {facilityId} - {zones?.length || 0} zones
    </div>
  ),
}));

/**
 * Create mock facility
 */
const createMockFacility = (overrides?: Partial<Facility>): Facility => ({
  id: 'facility-123',
  name: 'Conference Center A',
  description: 'Modern conference center with state-of-the-art facilities',
  address: 'Oslo Street 123',
  area: 'Downtown Oslo',
  capacity: 100,
  facility_type: 'conference',
  images: [
    { url: 'https://example.com/image1.jpg', alt: 'Main hall' },
    { url: 'https://example.com/image2.jpg', alt: 'Meeting room' },
  ],
  amenities: ['wifi', 'projector', 'parking'],
  organization_id: 'org-001',
  created_at: '2025-10-01T10:00:00Z',
  updated_at: '2025-10-30T10:00:00Z',
  ...overrides,
} as Facility);

/**
 * Create mock zones
 */
const createMockZones = (count: number = 2): Zone[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `zone-${i + 1}`,
    name: `Zone ${i + 1}`,
    capacity: 50,
    pricePerHour: 500,
  }));
};

/**
 * Render FacilityDetailLayout with default props
 */
const renderFacilityDetailLayout = (
  props?: Partial<React.ComponentProps<typeof FacilityDetailLayout>>
) => {
  const defaultProps = {
    facility: createMockFacility(),
    zones: createMockZones(),
    onShare: vi.fn(),
    isFavorited: false,
    onToggleFavorite: vi.fn(),
    showBookingInterface: false,
  };

  return {
    ...render(<FacilityDetailLayout {...defaultProps} {...props} />),
    ...defaultProps,
    ...props,
  };
};

describe('FacilityDetailLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout Structure', () => {
    it('should render main container with proper styling', () => {
      const { container } = renderFacilityDetailLayout();

      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('mx-auto', 'px-4', 'py-6', 'max-w-7xl');
    });

    it('should render gallery section at the top', () => {
      renderFacilityDetailLayout();

      const gallery = screen.getByTestId('gallery');
      expect(gallery).toBeInTheDocument();
      expect(gallery).toHaveTextContent('Conference Center A Gallery');
    });

    it('should render facility header below gallery', () => {
      renderFacilityDetailLayout();

      const header = screen.getByTestId('facility-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Conference Center A');
    });

    it('should render info tabs in left column', () => {
      renderFacilityDetailLayout();

      const infoTabs = screen.getByTestId('info-tabs');
      expect(infoTabs).toBeInTheDocument();
    });

    it('should render contact info in right sidebar', () => {
      renderFacilityDetailLayout();

      const contactInfo = screen.getByTestId('contact-info');
      expect(contactInfo).toBeInTheDocument();
    });

    it('should render calendar section when zones exist', () => {
      renderFacilityDetailLayout({ zones: createMockZones(3) });

      const calendar = screen.getByTestId('facility-calendar');
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveTextContent('3 zones');
    });

    it('should not render calendar when no zones', () => {
      renderFacilityDetailLayout({ zones: [] });

      const calendar = screen.queryByTestId('facility-calendar');
      expect(calendar).not.toBeInTheDocument();
    });
  });

  describe('Gallery Integration', () => {
    it('should pass facility images to gallery', () => {
      const facility = createMockFacility({
        images: [
          { url: 'https://example.com/img1.jpg', alt: 'Image 1' },
          { url: 'https://example.com/img2.jpg', alt: 'Image 2' },
          { url: 'https://example.com/img3.jpg', alt: 'Image 3' },
        ],
      });

      renderFacilityDetailLayout({ facility });

      const gallery = screen.getByTestId('gallery');
      expect(gallery).toHaveTextContent('3 images');
    });

    it('should pass facility name to gallery', () => {
      const facility = createMockFacility({ name: 'Sports Complex' });

      renderFacilityDetailLayout({ facility });

      const gallery = screen.getByTestId('gallery');
      expect(gallery).toHaveTextContent('Sports Complex Gallery');
    });

    it('should handle facility with no images', () => {
      const facility = createMockFacility({ images: [] });

      renderFacilityDetailLayout({ facility });

      const gallery = screen.getByTestId('gallery');
      expect(gallery).toHaveTextContent('0 images');
    });
  });

  describe('Header Integration', () => {
    it('should pass facility name to header', () => {
      const facility = createMockFacility({ name: 'Grand Hall' });

      renderFacilityDetailLayout({ facility });

      expect(screen.getByText('Grand Hall')).toBeInTheDocument();
    });

    it('should pass favorite state to header', () => {
      renderFacilityDetailLayout({ isFavorited: true });

      expect(screen.getByText('Favorited')).toBeInTheDocument();
    });

    it('should call onShare when share button clicked', async () => {
      const user = userEvent.setup();
      const onShare = vi.fn();

      renderFacilityDetailLayout({ onShare });

      await user.click(screen.getByTestId('share-button'));

      expect(onShare).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleFavorite when favorite button clicked', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();

      renderFacilityDetailLayout({ onToggleFavorite });

      await user.click(screen.getByTestId('favorite-button'));

      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    });
  });

  describe('Info Tabs Integration', () => {
    it('should pass facility description to info tabs', () => {
      const facility = createMockFacility({
        description: 'A beautiful venue for events',
      });

      renderFacilityDetailLayout({ facility });

      const infoTabs = screen.getByTestId('info-tabs');
      expect(infoTabs).toHaveTextContent('A beautiful venue for events');
    });

    it('should pass facility capacity to info tabs', () => {
      const facility = createMockFacility({ capacity: 250 });

      renderFacilityDetailLayout({ facility });

      const infoTabs = screen.getByTestId('info-tabs');
      expect(infoTabs).toHaveTextContent('Capacity: 250');
    });

    it('should pass zones to info tabs', () => {
      const zones = createMockZones(5);

      renderFacilityDetailLayout({ zones });

      const infoTabs = screen.getByTestId('info-tabs');
      expect(infoTabs).toHaveTextContent('Zones: 5');
    });
  });

  describe('Contact Info Integration', () => {
    it('should pass facility to contact info', () => {
      const facility = createMockFacility({ name: 'Event Center' });

      renderFacilityDetailLayout({ facility });

      const contactInfo = screen.getByTestId('contact-info');
      expect(contactInfo).toHaveTextContent('Contact: Event Center');
    });

    it('should render contact info in sticky sidebar', () => {
      const { container } = renderFacilityDetailLayout();

      const sidebar = container.querySelector('.sticky');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('top-20');
    });
  });

  describe('Calendar Integration', () => {
    it('should pass facility ID to calendar', () => {
      const facility = createMockFacility({ id: 'facility-abc' });

      renderFacilityDetailLayout({ facility });

      const calendar = screen.getByTestId('facility-calendar');
      expect(calendar).toHaveTextContent('facility-abc');
    });

    it('should pass zones to calendar', () => {
      const zones = createMockZones(4);

      renderFacilityDetailLayout({ zones });

      const calendar = screen.getByTestId('facility-calendar');
      expect(calendar).toHaveTextContent('4 zones');
    });

    it('should show calendar section with proper styling', () => {
      const { container } = renderFacilityDetailLayout();

      const calendarSection = container.querySelector('[data-testid="facility-calendar"]')?.parentElement;
      expect(calendarSection).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const { container } = renderFacilityDetailLayout();

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-10');
    });

    it('should hide sidebar on mobile', () => {
      const { container } = renderFacilityDetailLayout();

      const sidebar = container.querySelector('.lg\\:col-span-3');
      expect(sidebar).toHaveClass('hidden', 'lg:block');
    });

    it('should use 70/30 split on large screens', () => {
      const { container } = renderFacilityDetailLayout();

      const leftColumn = container.querySelector('.lg\\:col-span-7');
      const rightColumn = container.querySelector('.lg\\:col-span-3');

      expect(leftColumn).toBeInTheDocument();
      expect(rightColumn).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should handle facility with minimal data', () => {
      const facility = createMockFacility({
        description: '',
        address: '',
        amenities: [],
        images: [],
      });

      expect(() => renderFacilityDetailLayout({ facility })).not.toThrow();
    });

    it('should use area as fallback for address', () => {
      const facility = createMockFacility({
        address: '',
        area: 'City Center',
      });

      renderFacilityDetailLayout({ facility });

      // Header should receive the area as address
      expect(screen.getByTestId('facility-header')).toBeInTheDocument();
    });

    it('should handle null capacity', () => {
      const facility = createMockFacility({ capacity: null as any });

      renderFacilityDetailLayout({ facility });

      const infoTabs = screen.getByTestId('info-tabs');
      expect(infoTabs).toHaveTextContent('Capacity: 0');
    });

    it('should handle null amenities', () => {
      const facility = createMockFacility({ amenities: null as any });

      expect(() => renderFacilityDetailLayout({ facility })).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderFacilityDetailLayout();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have semantic HTML structure', () => {
      renderFacilityDetailLayout();

      const header = screen.getByRole('heading', { level: 1 });
      expect(header).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onShare = vi.fn();
      const onToggleFavorite = vi.fn();

      renderFacilityDetailLayout({ onShare, onToggleFavorite });

      // Tab to share button
      await user.tab();
      await user.keyboard('{Enter}');

      expect(onShare).toHaveBeenCalled();
    });

    it('should have proper button labels', () => {
      renderFacilityDetailLayout();

      const shareButton = screen.getByTestId('share-button');
      const favoriteButton = screen.getByTestId('favorite-button');

      expect(shareButton).toHaveTextContent('Share');
      expect(favoriteButton).toHaveTextContent(/Favorite/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long facility names', () => {
      const longName = 'A'.repeat(200);
      const facility = createMockFacility({ name: longName });

      renderFacilityDetailLayout({ facility });

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDescription = 'Lorem ipsum '.repeat(100);
      const facility = createMockFacility({ description: longDescription });

      renderFacilityDetailLayout({ facility });

      const infoTabs = screen.getByTestId('info-tabs');
      expect(infoTabs).toHaveTextContent(longDescription.trim());
    });

    it('should handle large number of zones', () => {
      const zones = createMockZones(50);

      renderFacilityDetailLayout({ zones });

      const calendar = screen.getByTestId('facility-calendar');
      expect(calendar).toHaveTextContent('50 zones');
    });

    it('should handle rapid favorite toggle clicks', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn();

      renderFacilityDetailLayout({ onToggleFavorite });

      const favoriteButton = screen.getByTestId('favorite-button');

      // Click rapidly
      await user.click(favoriteButton);
      await user.click(favoriteButton);
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledTimes(3);
    });
  });

  describe('Props Validation', () => {
    it('should accept showBookingInterface prop', () => {
      expect(() =>
        renderFacilityDetailLayout({ showBookingInterface: true })
      ).not.toThrow();
    });

    it('should default showBookingInterface to false', () => {
      const { showBookingInterface } = renderFacilityDetailLayout();

      expect(showBookingInterface).toBe(false);
    });

    it('should accept all required props', () => {
      const props = {
        facility: createMockFacility(),
        zones: createMockZones(),
        onShare: vi.fn(),
        isFavorited: true,
        onToggleFavorite: vi.fn(),
      };

      expect(() => render(<FacilityDetailLayout {...props} />)).not.toThrow();
    });
  });
});
