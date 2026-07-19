import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/Toast';
import { useThemeColors, useThemeMode } from '@/hooks/use-theme';
import { AppProvider } from '@/store/app-context';

// 테마 훅은 AppProvider 안에서만 쓸 수 있어 셸을 분리한다
function ThemedShell() {
  const mode = useThemeMode();
  const c = useThemeColors();
  return (
    <ToastProvider>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.beigeBg },
        }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/reset" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" />
        <Stack.Screen name="spot/[id]" />
        <Stack.Screen name="review/[spotId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="list/[listId]" />
        <Stack.Screen name="my-reviews" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/appearance" />
        <Stack.Screen name="settings/account" />
        <Stack.Screen name="settings/support" />
      </Stack>
    </ToastProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <ThemedShell />
      </SafeAreaProvider>
    </AppProvider>
  );
}
