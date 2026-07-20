import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, shadow, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import type { Spot } from '@/types';

import type { SpotMapProps } from './SpotMap';

export type { SpotMapProps };

// 웹: react-native-maps 미지원 — 베이지 톤 일러스트 목업 지도로 폴백
export function SpotMap({ spots, selectedId, onSelect }: SpotMapProps) {
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.mapArea}>
      {/* 강 */}
      <View style={[styles.river, { top: '58%', left: '-10%', transform: [{ rotate: '-12deg' }] }]} />
      {/* 도로 */}
      <View style={[styles.road, { top: '20%', left: '-5%', width: '120%', transform: [{ rotate: '8deg' }] }]} />
      <View style={[styles.road, { top: '45%', left: '-10%', width: '130%', transform: [{ rotate: '-4deg' }] }]} />
      <View style={[styles.road, { top: '75%', left: '-5%', width: '120%', transform: [{ rotate: '5deg' }] }]} />
      <View style={[styles.roadVertical, { left: '30%', top: '-5%', transform: [{ rotate: '10deg' }] }]} />
      <View style={[styles.roadVertical, { left: '65%', top: '-8%', transform: [{ rotate: '-7deg' }] }]} />
      {/* 공원 */}
      <View style={[styles.park, { top: '12%', left: '55%', width: 70, height: 46 }]} />
      <View style={[styles.park, { top: '68%', left: '15%', width: 54, height: 54 }]} />
      <View style={[styles.park, { top: '35%', left: '10%', width: 40, height: 32 }]} />

      {spots.map((spot) => {
        const active = selectedId === spot.id;
        return (
          <Pressable
            key={spot.id}
            style={[styles.marker, { left: `${spot.mapPos.x}%`, top: `${spot.mapPos.y}%` }]}
            onPress={() => onSelect(spot)}
            accessibilityRole="button"
            accessibilityLabel={spot.name}>
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
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    mapArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.mapBg,
      overflow: 'hidden',
    },
    river: {
      position: 'absolute',
      width: '140%',
      height: 46,
      borderRadius: 23,
      backgroundColor: c.mapRiver,
    },
    road: {
      position: 'absolute',
      height: 5,
      borderRadius: 3,
      backgroundColor: c.mapRoad,
    },
    roadVertical: {
      position: 'absolute',
      width: 5,
      height: '115%',
      borderRadius: 3,
      backgroundColor: c.mapRoad,
    },
    park: {
      position: 'absolute',
      borderRadius: 14,
      backgroundColor: c.mapPark,
      opacity: 0.7,
    },
    marker: {
      position: 'absolute',
      alignItems: 'center',
      marginLeft: -19,
      marginTop: -34,
    },
    markerLabel: {
      backgroundColor: c.cardBg,
      borderRadius: 10,
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
