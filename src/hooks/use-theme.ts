import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/constants/theme';
import { useApp } from '@/store/app-context';

// 사용자 설정(시스템/라이트/다크)을 실제 표시 모드로 해석
export function useThemeMode(): 'light' | 'dark' {
  const { theme } = useApp();
  const system = useColorScheme();
  if (theme === 'system') return system === 'dark' ? 'dark' : 'light';
  return theme;
}

export function useThemeColors(): ThemeColors {
  return useThemeMode() === 'dark' ? darkColors : lightColors;
}

// 팔레트 기반 StyleSheet 생성용. factory는 모듈 스코프 함수여야 메모이즈가 유지된다.
export function useThemedStyles<T>(factory: (c: ThemeColors) => T): T {
  const c = useThemeColors();
  return useMemo(() => factory(c), [c, factory]);
}
