import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

const FALLBACK_LABEL = '서울시 마포구 연남동';

// 현재 위치의 행정동 라벨. 권한 거부/실패 시 기본 라벨로 폴백한다.
export function useLocationLabel() {
  const [label, setLabel] = useState(FALLBACK_LABEL);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const results = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const r = results[0];
      if (r) {
        const parts = [r.city ?? r.region, r.district ?? r.subregion, r.street].filter(Boolean);
        if (parts.length > 0) setLabel(parts.join(' '));
      }
    } catch {
      // 웹 등 미지원 환경/실패 시 기본 라벨 유지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { label, loading, refresh };
}
