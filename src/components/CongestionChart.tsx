import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import type { Spot, TimeSlot } from '@/types';

const TIME_SLOTS: TimeSlot[] = ['오전', '오후', '저녁', '심야'];
const CHART_HEIGHT = 110;

// SOOM_SPOT_004 — 시간대별 혼잡도 차트
export function CongestionChart({ data }: { data: Spot['congestionByTime'] }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>시간대별 혼잡도</Text>
        <Text style={styles.caption}>실시간 데이터 기준</Text>
      </View>

      <View style={styles.chart}>
        {TIME_SLOTS.map((slot) => {
          const value = data[slot];
          const busy = value >= 0.5;
          return (
            <View key={slot} style={styles.column}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(8, value * CHART_HEIGHT),
                      backgroundColor: busy ? colors.sage : colors.sageSoft,
                    },
                  ]}
                />
              </View>
              <Text style={styles.slotLabel}>{slot}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.sageSoft }]} />
          <Text style={styles.legendText}>한산</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.sage }]} />
          <Text style={styles.legendText}>보통</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  caption: {
    fontSize: 12,
    color: colors.sage,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  column: {
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 30,
    borderRadius: 8,
  },
  slotLabel: {
    fontSize: 12,
    color: colors.textSub,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textMain,
  },
});
