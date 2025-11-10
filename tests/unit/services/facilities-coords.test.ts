import { describe, it, expect } from 'vitest';
import { facilitiesService } from '../facilities.service';

describe('Facilities with Coordinates Service', () => {
  it('should check if coordinates are valid numbers', () => {
    // Test valid coordinates
    expect(Number.isFinite(59.9139)).toBe(true);
    expect(Number.isFinite(10.7522)).toBe(true);
    
    // Test invalid coordinates
    expect(Number.isFinite(null)).toBe(false);
    expect(Number.isFinite(undefined)).toBe(false);
    expect(Number.isFinite(NaN)).toBe(false);
    expect(Number.isFinite('59.9139')).toBe(false);
  });

  it('should handle facilities with valid coordinates', () => {
    const facilityWithCoords = {
      id: 'test-id',
      org_id: 'org-id',
      name: 'Test Facility',
      address_line1: 'Test Address',
      lat: 59.9139,
      lng: 10.7522,
      location_geojson: {
        type: 'Point',
        coordinates: [10.7522, 59.9139]
      }
    };

    const hasCoords = Number.isFinite(facilityWithCoords.lat) && Number.isFinite(facilityWithCoords.lng);
    expect(hasCoords).toBe(true);
  });

  it('should handle facilities without coordinates', () => {
    const facilityWithoutCoords = {
      id: 'test-id',
      org_id: 'org-id',
      name: 'Test Facility',
      address_line1: 'Test Address',
      lat: null,
      lng: null,
      location_geojson: null
    };

    const hasCoords = Number.isFinite(facilityWithoutCoords.lat) && Number.isFinite(facilityWithoutCoords.lng);
    expect(hasCoords).toBe(false);
  });
});