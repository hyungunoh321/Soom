import * as Notifications from 'expo-notifications';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsHeader } from '@/components/SettingsHeader';
import { useToast } from '@/components/Toast';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp, type NotificationSettings } from '@/store/app-context';

const ITEMS: { key: keyof NotificationSettings; title: string; desc: string }[] = [
  {
    key: 'spotRecommend',
    title: '추천 스팟 알림',
    desc: '내 취향에 맞는 새 힐링 스팟이 등록되면 알려드려요.',
  },
  {
    key: 'comment',
    title: '댓글 알림',
    desc: '내 후기에 댓글이 달리면 알려드려요.',
  },
  {
    key: 'marketing',
    title: '이벤트·소식 알림',
    desc: '숨표의 새로운 소식과 이벤트를 받아볼래요.',
  },
];

// SOOM_SET_001 — 추천 스팟 및 댓글 알림 설정
export default function NotificationSettingsScreen() {
  const toast = useToast();
  const { notifications, setNotification } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);

  // 알림을 켤 때 OS 알림 권한을 실제로 요청한다 (웹은 미지원)
  const toggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (value && Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        toast.show('기기 설정에서 알림 권한을 허용해 주세요.');
        return;
      }
    }
    setNotification(key, value);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SettingsHeader title="알림 설정" />
      <View style={styles.content}>
        {ITEMS.map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDesc}>{item.desc}</Text>
            </View>
            <Switch
              value={notifications[item.key]}
              onValueChange={(v) => toggle(item.key, v)}
              trackColor={{ false: c.border, true: c.sageLight }}
              thumbColor={notifications[item.key] ? c.sage : '#FFFFFF'}
            />
          </View>
        ))}
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
    },
    textWrap: {
      flex: 1,
      gap: 4,
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
