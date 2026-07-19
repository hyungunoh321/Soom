import { StyleSheet, Text, View } from 'react-native';

import { lightColors, radius, type ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';
import type { CongestionLevel } from '@/types';

// 혼잡도 색은 라이트/다크 공통 (신호등 의미 유지)
export const CONGESTION_META: Record<CongestionLevel, { label: string; color: string }> = {
  low: { label: '여유로움', color: lightColors.congestionLow },
  mid: { label: '보통', color: lightColors.congestionMid },
  high: { label: '조금 붐빔', color: lightColors.congestionHigh },
};

// 혼잡도 배지: 여유로움(초록) / 보통(주황) / 조금 붐빔(빨강)
export function CongestionBadge({ level }: { level: CongestionLevel }) {
  const styles = useThemedStyles(createStyles);
  const meta = CONGESTION_META[level];
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={styles.label}>{meta.label}</Text>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.cardBg,
      borderRadius: radius.badge,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMain,
    },
  });
