import { useEffect, useRef, useCallback } from 'react';
import { sendLocationUpdate } from '@/services/location';

interface LocationTrackerProps {
  subcontractorId: string;
  intervalMinutes?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function LocationTracker({
  subcontractorId,
  intervalMinutes = 3,
  enabled = true,
  onError,
  onSuccess,
}: LocationTrackerProps) {
  const intervalRef = useRef<number | null>(null);
  const isFirstUpdate = useRef(true);

  const sendUpdate = useCallback(async () => {
    console.log('[LocationTracker] Attempting to send location update...');

    if (!enabled) {
      console.log('[LocationTracker] Tracking is disabled');
      return;
    }

    if (!navigator.geolocation) {
      console.log('[LocationTracker] Geolocation API not available');
      return;
    }

    try {
      console.log('[LocationTracker] Requesting location permission...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      console.log('[LocationTracker] Got position:', position.coords.latitude, position.coords.longitude);

      await sendLocationUpdate({
        subcontractorId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || undefined,
      });

      console.log('[LocationTracker] Location sent successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('[LocationTracker] Error:', error);
      const err = error instanceof Error ? error : new Error('Location update failed');
      onError?.(err);
    }
  }, [subcontractorId, enabled, onError, onSuccess]);

  useEffect(() => {
    console.log('[LocationTracker] Component mounted for subcontractor:', subcontractorId);

    if (!enabled) {
      console.log('[LocationTracker] Disabled, not starting tracking');
      return;
    }

    if (!navigator.geolocation) {
      console.log('[LocationTracker] Geolocation not supported by this browser');
      return;
    }

    if (isFirstUpdate.current) {
      isFirstUpdate.current = false;
      console.log('[LocationTracker] Sending first location update...');
      sendUpdate();
    }

    intervalRef.current = window.setInterval(
      sendUpdate,
      intervalMinutes * 60 * 1000
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sendUpdate, intervalMinutes, enabled]);

  return null;
}
