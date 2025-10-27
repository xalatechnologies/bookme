import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';
import { facilitiesService } from '@/services/supabase/facilities.service';
import { cleanupTestData, createTestFacility } from '../../setup/supabase-helpers';

/**
 * Integration tests for Facilities Service
 * These tests run against a real Supabase instance (local or test environment)
 *
 * Prerequisites:
 * - Supabase local dev running: npx supabase start
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
      const newFacility = {
        org_id: testOrgId,
        name: 'Integration Test Facility',
        description: 'Created by integration test',
        address: '123 Test Street',
        type: 'sports' as const,
        status: 'published' as const,
        capacity: 50,
        price_per_hour: 500,
      };

      const created = await facilitiesService.create(newFacility);

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
      expect(facilities.every(f => f.org_id === testOrgId)).toBe(true);
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
      });

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
      const sportsFacilities = await facilitiesService.getByType(testOrgId, 'sports');

      expect(sportsFacilities.length).toBeGreaterThan(0);
      expect(sportsFacilities.every(f => f.type === 'sports')).toBe(true);
    });

    it('should search facilities by name', async () => {
      const results = await facilitiesService.search(testOrgId, 'Sports');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(f => f.name.includes('Sports'))).toBe(true);
    });

    it('should filter by status', async () => {
      await createTestFacility({ status: 'draft' });
      await createTestFacility({ status: 'published' });

      const published = await facilitiesService.getByStatus(testOrgId, 'published');

      expect(published.every(f => f.status === 'published')).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid facility type', async () => {
      const invalidFacility = {
        org_id: testOrgId,
        name: 'Invalid Facility',
        type: 'invalid_type' as any,
        status: 'published' as const,
      };

      await expect(facilitiesService.create(invalidFacility)).rejects.toThrow();
    });

    it('should require organization ID', async () => {
      const facilityWithoutOrg = {
        name: 'No Org Facility',
        type: 'sports' as const,
      };

      await expect(facilitiesService.create(facilityWithoutOrg as any)).rejects.toThrow();
    });

    it('should validate price is non-negative', async () => {
      const facilityWithNegativePrice = {
        org_id: testOrgId,
        name: 'Negative Price',
        type: 'sports' as const,
        price_per_hour: -100,
      };

      await expect(facilitiesService.create(facilityWithNegativePrice)).rejects.toThrow();
    });
  });

  describe('Row Level Security', () => {
    it('should only return facilities for authenticated organization', async () => {
      // Create facility for test org
      await createTestFacility({ org_id: testOrgId });

      // Create facility for different org (if permissions allow)
      // In real scenario, this would require different auth context

      const facilities = await facilitiesService.getAll(testOrgId);

      expect(facilities.every(f => f.org_id === testOrgId)).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous creates', async () => {
      const creates = Array.from({ length: 5 }, (_, i) =>
        createTestFacility({ name: `Concurrent Facility ${i}` })
      );

      const results = await Promise.all(creates);

      expect(results).toHaveLength(5);
      expect(results.every(r => r.id)).toBe(true);
    });

    it('should handle concurrent updates to same facility', async () => {
      const facility = await createTestFacility({ capacity: 50 });

      // Simulate concurrent updates
      const updates = [
        facilitiesService.update(facility.id, { capacity: 60 }),
        facilitiesService.update(facility.id, { capacity: 70 }),
      ];

      const results = await Promise.all(updates);

      // Last update should win
      const final = await facilitiesService.getById(facility.id);
      expect([60, 70]).toContain(final.capacity);
    });
  });

  describe('Availability Queries', () => {
    it('should return available facilities for date range', async () => {
      await createTestFacility({ name: 'Available Facility', status: 'published' });

      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-31');

      const available = await facilitiesService.getAvailable(
        testOrgId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      expect(available.length).toBeGreaterThan(0);
      expect(available.every(f => f.status === 'published')).toBe(true);
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
      });

      expect(updated.amenities).toHaveLength(3);
    });
  });
});
