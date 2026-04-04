import { describe, it, expect } from 'vitest';
import { calculateDistance, isOnline, formatLastSeen } from '../location';

describe('calculateDistance', () => {
  it('should return 0 for the same point', () => {
    const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(distance).toBe(0);
  });

  it('should calculate distance between New York and Los Angeles correctly', () => {
    // New York: 40.7128, -74.0060
    // Los Angeles: 34.0522, -118.2437
    // Expected distance: approximately 3940 km
    const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(3900000); // > 3900 km
    expect(distance).toBeLessThan(4000000); // < 4000 km
  });

  it('should calculate short distances correctly', () => {
    // Two points about 1km apart
    const distance = calculateDistance(40.7128, -74.006, 40.7218, -74.006);
    expect(distance).toBeGreaterThan(900); // > 900m
    expect(distance).toBeLessThan(1100); // < 1100m
  });

  it('should handle crossing the prime meridian', () => {
    const distance = calculateDistance(51.5074, -0.1278, 51.5074, 0.1278);
    expect(distance).toBeGreaterThan(0);
  });

  it('should handle crossing the equator', () => {
    const distance = calculateDistance(1, 0, -1, 0);
    expect(distance).toBeGreaterThan(200000); // Should be about 222km
  });
});

describe('isOnline', () => {
  it('should return false for undefined lastSeenAt', () => {
    expect(isOnline(undefined)).toBe(false);
  });

  it('should return true for a timestamp within the last 10 minutes', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(isOnline(fiveMinutesAgo)).toBe(true);
  });

  it('should return false for a timestamp older than 10 minutes', () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    expect(isOnline(fifteenMinutesAgo)).toBe(false);
  });

  it('should return true for current timestamp', () => {
    const now = new Date().toISOString();
    expect(isOnline(now)).toBe(true);
  });

  it('should return false for exactly 10 minutes ago', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(isOnline(tenMinutesAgo)).toBe(false);
  });
});

describe('formatLastSeen', () => {
  it('should return "Never" for undefined', () => {
    expect(formatLastSeen(undefined)).toBe('Never');
  });

  it('should return "Just now" for very recent timestamps', () => {
    const now = new Date().toISOString();
    expect(formatLastSeen(now)).toBe('Just now');
  });

  it('should return minutes ago for timestamps less than an hour', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(formatLastSeen(thirtyMinutesAgo)).toBe('30m ago');
  });

  it('should return hours ago for timestamps less than a day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatLastSeen(threeHoursAgo)).toBe('3h ago');
  });

  it('should return days ago for older timestamps', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatLastSeen(twoDaysAgo)).toBe('2d ago');
  });
});
