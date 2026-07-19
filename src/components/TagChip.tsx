import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/constants/theme';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** 카드 안에서 쓰는 작은 정적 태그 (#태그) */
  small?: boolean;
}

// 태그 칩: 선택 시 sage 배경 + 흰 글씨, 미선택 시 흰 배경 + 회색 글씨
export function TagChip({ label, selected = false, onPress, small = false }: TagChipProps) {
  if (small) {
    return (
      <Text style={styles.smallChip}>#{label}</Text>
    );
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

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.chip,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: colors.sage,
  },
  chipUnselected: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  labelUnselected: {
    color: colors.textSub,
  },
  smallChip: {
    backgroundColor: colors.sageSoft,
    color: colors.sage,
    borderRadius: radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
