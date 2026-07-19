import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';

// 설정 하위 화면 공통 헤더 (뒤로가기 + 타이틀)
export function SettingsHeader({ title }: { title: string }) {
  const router = useRouter();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/my'))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기">
        <Ionicons name="chevron-back" size={24} color={c.textMain} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textMain,
    },
  });
