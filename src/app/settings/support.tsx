import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsHeader } from '@/components/SettingsHeader';
import { colors, radius, spacing } from '@/constants/theme';

const FAQS = [
  {
    q: '스팟은 어떻게 등록하나요?',
    a: '현재는 큐레이션된 스팟만 제공돼요. 직접 등록 기능은 다음 업데이트에서 만나보실 수 있어요.',
  },
  {
    q: '혼잡도 정보는 어떻게 만들어지나요?',
    a: '방문자 후기와 시간대별 데이터를 기반으로 계산돼요. 실시간 연동은 준비 중이에요.',
  },
  {
    q: '내 후기를 수정하거나 삭제할 수 있나요?',
    a: '마이페이지 > 내가 작성한 후기 > 전체보기에서 수정과 삭제 모두 할 수 있어요.',
  },
];

// 고객 센터 — FAQ 및 문의 안내
export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SettingsHeader title="고객 센터" />
      <View style={styles.content}>
        <View style={styles.contactCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.sage} />
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.sageSoft,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  contactBody: {
    gap: 3,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
  },
  contactDesc: {
    fontSize: 13,
    color: colors.textSub,
  },
  faqLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.sage,
    marginTop: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: 6,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  faqA: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSub,
  },
});
