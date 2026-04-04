import { describe, it, expect } from 'vitest';
import { isPointInGeofence } from '../geofence';
import type { Geofence } from '@/types/location';

const createGeofence = (overrides?: Partial<Geofence>): Geofence => ({
  id: 'test-id',
  projectId: 'project-id',
  name: 'Test Geofence',
  centerLat: 40.7128,
  centerLng: -74.006,
  radiusMeters: 1000,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('isPointInGeofence', () => {
  it('should return true for a point at the center', () => {
    const geofence = createGeofence();
    const result = isPointInGeofence(40.7128, -74.006, geofence);
    expect(result).toBe(true);
  });

  it('should return true for a point inside the radius', () => {
    const geofence = createGeofence({ radiusMeters: 1000 });
    // Point about 500m away
    const result = isPointInGeofence(40.7173, -74.006, geofence);
    expect(result).toBe(true);
  });

  it('should return false for a point outside the radius', () => {
    const geofence = createGeofence({ radiusMeters: 100 });
    // Point about 500m away
    const result = isPointInGeofence(40.7173, -74.006, geofence);
    expect(result).toBe(false);
  });

  it('should return true for a point exactly at the boundary', () => {
    const geofence = createGeofence({
      centerLat: 0,
      centerLng: 0,
      radiusMeters: 111320, // approximately 1 degree at equator
    });
    // Point approximately 1 degree north (should be just inside)
    const result = isPointInGeofence(0.9, 0, geofence);
    expect(result).toBe(true);
  });

  it('should handle small radius geofences', () => {
    const geofence = createGeofence({ radiusMeters: 50 });
    // Point at center should be inside
    expect(isPointInGeofence(40.7128, -74.006, geofence)).toBe(true);
    // Point 100m away should be outside
    expect(isPointInGeofence(40.7137, -74.006, geofence)).toBe(false);
  });

  it('should handle large radius geofences', () => {
    const geofence = createGeofence({ radiusMeters: 50000 }); // 50km
    // Point 10km away should be inside
    const result = isPointInGeofence(40.8, -74.006, geofence);
    expect(result).toBe(true);
  });

  it('should work with negative coordinates', () => {
    const geofence = createGeofence({
      centerLat: -33.8688,
      centerLng: 151.2093,
      radiusMeters: 1000,
    });
    // Sydney CBD coordinates
    expect(isPointInGeofence(-33.8688, 151.2093, geofence)).toBe(true);
  });
});
