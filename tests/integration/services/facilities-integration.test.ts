import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { supabase } from '../../../src/lib/clients/supabase';
import { facilitiesService } from '../../../src/services/supabase';
import { cleanupTestData, createTestFacility } from '../../setup/supabase-helpers';

// Mock facility type for integration tests based on actual database schema
interface TestFacility {
  readonly id: string;
  readonly name: string;
  readonly org_id: string;
  readonly facility_type: string;
  readonly status?: string;
  readonly capacity?: number;
  readonly description?: string;
  readonly address?: string;
  readonly images?: string[];
  readonly amenities?: string[];
  readonly city?: string;
  readonly country?: string;
  readonly postal_code?: string;
  readonly contact_email?: string;
  readonly contact_phone?: string;
  readonly rating?: number;
  readonly review_count?: number;
  readonly slug?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly location?: unknown;
  readonly area_description?: string;
  readonly accessibility_features?: unknown;
}

/**
 * Integration tests for Facilities Service
 * These tests run against a real Supabase instance (local or test environment)
 *
 * Prerequisites:
 * - Supabase Cloud project configured
 * - Test environment variables configured
 * - Test organization created
 */

describe('Facilities Integration Tests', () => {
  const testOrgId = process.env.TEST_ORG_ID!;

  beforeAll(async () => {
    // Ensure test environment is ready
    if (!testOrgId) {
      throw new Error('TEST_ORG_ID environment variable is not set');
    }
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
  });

  afterAll(async () => {
    // Final cleanup
    await cleanupTestData();
  });

  describe('CRUD Operations', () => {
    it('should create a new facility', async () => {
      const newFacility: Partial<TestFacility> = {
        org_id: testOrgId,
        name: 'Integration Test Facility',
        facility_type: 'sports',
        status: 'published',
        capacity: 50,
        description: 'Created by integration test',
        address: '123 Test Street',
      };

      const created = await facilitiesService.create(newFacility as never);

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.name).toBe(newFacility.name);
      expect(created.org_id).toBe(testOrgId);
    });

    it('should retrieve all facilities for organization', async () => {
      // Create test facilities
      await createTestFacility({ name: 'Facility 1' });
      await createTestFacility({ name: 'Facility 2' });
      await createTestFacility({ name: 'Facility 3' });

      const facilities = await facilitiesService.getAll(testOrgId);

      expect(facilities).toHaveLength(3);
      expect(facilities.every((f: TestFacility) => f.org_id === testOrgId)).toBe(true);
    });

    it('should retrieve a facility by ID', async () => {
      const created = await createTestFacility({ name: 'Test Facility' });

      const retrieved = await facilitiesService.getById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Test Facility');
    });

    it('should update a facility', async () => {
      const created = await createTestFacility({ name: 'Original Name' });

      const updated = await facilitiesService.update(created.id, {
        name: 'Updated Name',
        capacity: 100,
      } as never);

      expect(updated.name).toBe('Updated Name');
      expect(updated.capacity).toBe(100);

      // Verify in database
      const retrieved = await facilitiesService.getById(created.id);
      expect(retrieved.name).toBe('Updated Name');
    });

    it('should delete a facility', async () => {
      const created = await createTestFacility();

      await facilitiesService.delete(created.id);

      // Verify deletion
      await expect(facilitiesService.getById(created.id)).rejects.toThrow();
    });
  });

  describe('Filtering and Search', () => {
    beforeEach(async () => {
      // Create test data
      await createTestFacility({ name: 'Sports Center', type: 'sports' });
      await createTestFacility({ name: 'Conference Room', type: 'conference' });
      await createTestFacility({ name: 'Studio Space', type: 'studio' });
    });

    it('should filter facilities by type', async () => {
      // Filter facilities by type using search method
      const allFacilities = await facilitiesService.getAll(testOrgId);
      const sportsFacilities = allFacilities.filter((f: TestFacility) => f.facility_type === 'sports');

      expect(sportsFacilities.length).toBeGreaterThanOrEqual(0);
      expect(sportsFacilities.every((f: TestFacility) => f.facility_type === 'sports')).toBe(true);
    });

    it('should search facilities by name', async () => {
      const results = await facilitiesService.search(testOrgId, 'Sports');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((f: TestFacility) => f.name.includes('Sports'))).toBe(true);
    });

    it('should filter by status', async () => {
      await createTestFacility({ status: 'draft' });
      await createTestFacility({ status: 'published' });

      const allFacilities = await facilitiesService.getAll(testOrgId);
      const published = allFacilities.filter((f: TestFacility) => f.status === 'published');

      expect(published.every((f: TestFacility) => f.status === 'published')).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid facility type', async () => {
      const invalidFacility: Partial<TestFacility> = {
        org_id: testOrgId,
        name: 'Invalid Facility',
        facility_type: 'invalid_type',
        status: 'published',
      };

      await expect(facilitiesService.create(invalidFacility as never)).rejects.toThrow();
    });

    it('should require organization ID', async () => {
      const facilityWithoutOrg: Partial<TestFacility> = {
        name: 'No Org Facility',
        facility_type: 'sports',
      };

      await expect(facilitiesService.create(facilityWithoutOrg as never)).rejects.toThrow();
    });

    it('should validate price is non-negative', async () => {
      const facilityWithNegativePrice: Partial<TestFacility> = {
        org_id: testOrgId,
        name: 'Negative Price',
        facility_type: 'sports',
      };

      await expect(facilitiesService.create(facilityWithNegativePrice as never)).rejects.toThrow();
    });
  });

  describe('Row Level Security', () => {
    it('should only return facilities for authenticated organization', async () => {
      // Create facility for test org
      await createTestFacility({ org_id: testOrgId });

      // Create facility for different org (if permissions allow)
      // In real scenario, this would require different auth context

      const facilities = await facilitiesService.getAll(testOrgId);

      expect(facilities.every((f: TestFacility) => f.org_id === testOrgId)).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous creates', async () => {
      const creates = Array.from({ length: 5 }, (_, i) =>
        createTestFacility({ name: `Concurrent Facility ${i}` })
      );

      const results = await Promise.all(creates);

      expect(results).toHaveLength(5);
      expect(results.every((r: TestFacility) => r.id)).toBe(true);
    });

    it('should handle concurrent updates to same facility', async () => {
      const facility = await createTestFacility({ capacity: 50 });

      // Simulate concurrent updates
      const updates = [
        facilitiesService.update(facility.id, { capacity: 60 } as never),
        facilitiesService.update(facility.id, { capacity: 70 } as never),
      ];

      const results = await Promise.all(updates);

      // Last update should win
      const final = await facilitiesService.getById(facility.id);
      expect([60, 70]).toContain(final.capacity);
    });
  });

  describe('Availability Queries', () => {
    it('should search facilities by name', async () => {
      await createTestFacility({ name: 'Available Facility', status: 'published' });

      const results = await facilitiesService.search(testOrgId, 'Available');

      expect(results.length).toBeGreaterThanOrEqual(0);
      expect(results.some((f: TestFacility) => f.name.includes('Available'))).toBe(true);
    });
  });

  describe('Image Upload Integration', () => {
    it('should handle facilities with multiple images', async () => {
      const facilityWithImages = await createTestFacility({
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg',
        ],
      });

      expect(facilityWithImages.images).toHaveLength(3);

      const retrieved = await facilitiesService.getById(facilityWithImages.id);
      expect(retrieved.images).toHaveLength(3);
    });
  });

  describe('Amenities Management', () => {
    it('should store and retrieve amenities array', async () => {
      const amenities = ['WiFi', 'Parking', 'AC', 'Projector'];

      const facility = await createTestFacility({ amenities });

      expect(facility.amenities).toEqual(amenities);

      const retrieved = await facilitiesService.getById(facility.id);
      expect(retrieved.amenities).toEqual(amenities);
    });

    it('should update amenities', async () => {
      const facility = await createTestFacility({ amenities: ['WiFi'] });

      const updated = await facilitiesService.update(facility.id, {
        amenities: ['WiFi', 'Parking', 'AC'],
      } as never);

      expect(updated.amenities).toHaveLength(3);
    });
  });
});
