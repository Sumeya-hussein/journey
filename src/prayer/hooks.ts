import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Place } from './compute';

type LocationState = { status: 'loading' | 'denied' | 'ready'; place?: Place };

export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: 'loading' });

  const request = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setState({ status: 'denied' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      setState({ status: 'ready', place: { lat: pos.coords.latitude, lon: pos.coords.longitude } });
    } catch {
      setState({ status: 'denied' });
    }
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { ...state, request };
}

export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}