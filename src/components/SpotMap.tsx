import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { radius, shadow, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles, useThemeMode } from '@/hooks/use-theme';
import type { Spot } from '@/types';

export interface SpotMapProps {
  spots: Spot[];
  selectedId: string | null;
  onSelect: (spot: Spot) => void;
}

// 연남·망원·여의도 일대가 한눈에 들어오는 초기 영역
const INITIAL_REGION = {
  latitude: 37.548,
  longitude: 126.913,
  latitudeDelta: 0.075,
  longitudeDelta: 0.055,
};

// 네이티브: react-native-maps 실제 지도 (iOS는 Apple 지도,
// Android 스탠드얼론 빌드는 Google Maps API 키 필요 — 웹은 SpotMap.web.tsx의 목업 사용)
export function SpotMap({ spots, selectedId, onSelect }: SpotMapProps) {
  const c = useThemeColors();
  const mode = useThemeMode();
  const styles = useThemedStyles(createStyles);

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={INITIAL_REGION}
      userInterfaceStyle={mode}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}>
      {spots.map((spot) => {
        const active = selectedId === spot.id;
        return (
          <Marker
            key={spot.id}
            coordinate={spot.coords}
            onPress={() => onSelect(spot)}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={active}
            accessibilityLabel={spot.name}>
            <View style={styles.markerWrap}>
              {active && (
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText}>{spot.name}</Text>
                </View>
              )}
              <Ionicons
                name="location"
                size={active ? 38 : 28}
                color={active ? c.sage : c.sageLight}
              />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    markerWrap: {
      alignItems: 'center',
    },
    markerLabel: {
      backgroundColor: c.cardBg,
      borderRadius: radius.image - 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 4,
      ...shadow.card,
    },
    markerLabelText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMain,
    },
  });
