import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, type ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** 카드 안에서 쓰는 작은 정적 태그 (#태그) */
  small?: boolean;
}

// 태그 칩: 선택 시 sage 배경 + 흰 글씨, 미선택 시 카드 배경 + 회색 글씨
export function TagChip({ label, selected = false, onPress, small = false }: TagChipProps) {
  const styles = useThemedStyles(createStyles);
  if (small) {
    return <Text style={styles.smallChip}>#{label}</Text>;
  }
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    chip: {
      borderRadius: radius.chip,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    chipSelected: {
      backgroundColor: c.sage,
    },
    chipUnselected: {
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.border,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
    },
    labelSelected: {
      color: '#FFFFFF',
    },
    labelUnselected: {
      color: c.textSub,
    },
    smallChip: {
      backgroundColor: c.sageSoft,
      color: c.sage,
      borderRadius: radius.chip,
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 12,
      fontWeight: '600',
      overflow: 'hidden',
    },
  });
