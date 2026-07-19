import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsHeader } from '@/components/SettingsHeader';
import { colors, radius, spacing } from '@/constants/theme';
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
  const { notifications, setNotification } = useApp();

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
              onValueChange={(v) => setNotification(item.key, v)}
              trackColor={{ false: colors.border, true: colors.sageLight }}
              thumbColor={notifications[item.key] ? colors.sage : '#FFFFFF'}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.beigeBg,
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
    backgroundColor: colors.cardBg,
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
    color: colors.textMain,
  },
  rowDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
  },
});
