import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsHeader } from '@/components/SettingsHeader';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';

const FAQS = [
  {
    q: '스팟은 어떻게 등록하나요?',
    a: '현재는 큐레이션된 스팟만 제공돼요. 직접 등록 기능은 다음 업데이트에서 만나보실 수 있어요.',
  },
  {
    q: '혼잡도 정보는 어떻게 만들어지나요?',
    a: '시간대별 데이터에 방문자들의 실시간 제보를 더해 계산돼요. 장소 상세의 "지금 이곳은 어때요?"에서 직접 제보할 수 있어요.',
  },
  {
    q: '내 후기를 수정하거나 삭제할 수 있나요?',
    a: '마이페이지 > 내가 작성한 후기 > 전체보기에서 수정과 삭제 모두 할 수 있어요.',
  },
  {
    q: '불쾌한 후기를 발견했어요.',
    a: '후기 오른쪽 아래의 신고 버튼을 눌러 주세요. 신고한 후기는 바로 숨겨지고, 검토 후 조치돼요.',
  },
];

// 고객 센터 — FAQ 및 문의 안내
export default function SupportScreen() {
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SettingsHeader title="고객 센터" />
      <View style={styles.content}>
        <View style={styles.contactCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={c.sage} />
          <View style={styles.contactBody}>
            <Text style={styles.contactTitle}>무엇이든 물어보세요</Text>
            <Text style={styles.contactDesc}>support@soom.app · 평일 10:00 ~ 18:00</Text>
          </View>
        </View>

        <Text style={styles.faqLabel}>자주 묻는 질문</Text>
        {FAQS.map((f) => (
          <View key={f.q} style={styles.faqCard}>
            <Text style={styles.faqQ}>Q. {f.q}</Text>
            <Text style={styles.faqA}>{f.a}</Text>
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
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.sageSoft,
      borderRadius: radius.card,
      padding: spacing.md,
    },
    contactBody: {
      gap: 3,
    },
    contactTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textMain,
    },
    contactDesc: {
      fontSize: 13,
      color: c.textSub,
    },
    faqLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: c.sage,
      marginTop: spacing.sm,
    },
    faqCard: {
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.md,
      gap: 6,
    },
    faqQ: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textMain,
    },
    faqA: {
      fontSize: 13,
      lineHeight: 20,
      color: c.textSub,
    },
  });
