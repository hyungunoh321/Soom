import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsHeader } from '@/components/SettingsHeader';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import type { ThemeSetting } from '@/types';

const OPTIONS: { value: ThemeSetting; icon: string; title: string; desc: string }[] = [
  {
    value: 'system',
    icon: 'phone-portrait-outline',
    title: '시스템 설정 따르기',
    desc: '기기의 라이트/다크 설정을 그대로 사용해요.',
  },
  {
    value: 'light',
    icon: 'sunny-outline',
    title: '라이트 모드',
    desc: '따뜻한 베이지 톤의 밝은 화면이에요.',
  },
  {
    value: 'dark',
    icon: 'moon-outline',
    title: '다크 모드',
    desc: '눈이 편한 어두운 세이지 톤 화면이에요.',
  },
];

// 화면 테마 설정 — 시스템/라이트/다크
export default function AppearanceScreen() {
  const { theme, setTheme } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SettingsHeader title="화면 테마" />
      <View style={styles.content}>
        {OPTIONS.map((option) => {
          const selected = theme === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => setTheme(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={option.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={20}
                  color={c.sage}
                />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.rowTitle}>{option.title}</Text>
                <Text style={styles.rowDesc}>{option.desc}</Text>
              </View>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? c.sage : c.textSub}
              />
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.beigeBg,
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.sm,
      gap: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1.5,
      borderColor: c.cardBg,
    },
    rowSelected: {
      borderColor: c.sage,
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.sageSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
      gap: 3,
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textMain,
    },
    rowDesc: {
      fontSize: 13,
      lineHeight: 19,
      color: c.textSub,
    },
  });
