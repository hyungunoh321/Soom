import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';

/** 점수 표시용: ⭐ 4.8 */
export function RatingScore({ rating, size = 15 }: { rating: number; size?: number }) {
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.scoreRow}>
      <Ionicons name="star" size={size} color={c.star} />
      <Text style={[styles.scoreText, { fontSize: size }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

interface StarRatingProps {
  rating: number; // 1~5
  size?: number;
  color?: string;
  /** 지정하면 터치로 별점 선택 가능 */
  onChange?: (rating: number) => void;
}

/** 별 5개 표시/입력용 */
export function StarRating({ rating, size = 20, color, onChange }: StarRatingProps) {
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const fill = color ?? c.star;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = rating >= n ? 'star' : rating >= n - 0.5 ? 'star-half' : 'star-outline';
        const star = (
          <Ionicons name={icon} size={size} color={rating >= n - 0.5 ? fill : c.starEmpty} />
        );
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    scoreText: {
      fontWeight: '700',
      color: c.textMain,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 6,
    },
  });
