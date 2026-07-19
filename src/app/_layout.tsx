import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/Toast';
import { colors } from '@/constants/theme';
import { AppProvider } from '@/store/app-context';

export default function RootLayout() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.beigeBg },
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
            <Stack.Screen name="settings/account" />
            <Stack.Screen name="settings/support" />
          </Stack>
        </ToastProvider>
      </SafeAreaProvider>
    </AppProvider>
  );
}
