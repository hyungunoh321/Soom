import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import type { CongestionLevel } from '@/types';

export const CONGESTION_META: Record<CongestionLevel, { label: string; color: string }> = {
  low: { label: '여유로움', color: colors.congestionLow },
  mid: { label: '보통', color: colors.congestionMid },
  high: { label: '조금 붐빔', color: colors.congestionHigh },
};

// 혼잡도 배지: 여유로움(초록) / 보통(주황) / 조금 붐빔(빨강)
export function CongestionBadge({ level }: { level: CongestionLevel }) {
  const meta = CONGESTION_META[level];
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={styles.label}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardBg,
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
    color: colors.textMain,
  },
});
