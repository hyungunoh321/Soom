import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, shadow, spacing } from '@/constants/theme';
import { getSpot } from '@/data/spots';
import { useApp } from '@/store/app-context';

// 시안의 "내가 작성한 후기" 기본 카드 (아직 작성한 후기가 없을 때 예시로 표시)
const SAMPLE_MY_REVIEWS = [
  {
    id: 'sample-1',
    title: '비밀의 숲길 산책로',
    date: '2026.05',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=60',
    spotId: 'night-trail',
  },
  {
    id: 'sample-2',
    title: '창가 자리가 예쁜 카페',
    date: '2026.04',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=60',
    spotId: 'space-rest',
  },
];

// SOOM_MY_001(내 정보) + SOOM_MY_002(내 후기)
export default function MyScreen() {
  const router = useRouter();
  const { bookmarks, myReviews } = useApp();

  const writtenReviews = Object.entries(myReviews).flatMap(([spotId, reviews]) =>
    reviews.map((r) => ({
      id: r.id,
      title: getSpot(spotId)?.name ?? '알 수 없는 장소',
      date: r.date,
      image: r.photos[0] ?? getSpot(spotId)?.image ?? '',
      spotId,
    })),
  );
  const myReviewCards = [...writtenReviews, ...SAMPLE_MY_REVIEWS];
  const reviewCount = writtenReviews.length + SAMPLE_MY_REVIEWS.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <Ionicons name="settings-sharp" size={22} color={colors.sage} />
        </View>

        {/* 프로필 */}
        <View style={styles.profile}>
          <View>
            <Image
              source={{ uri: 'https://i.pravatar.cc/200?img=44' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>서연</Text>
          <Text style={styles.bio}>조용한 산책을 좋아해요</Text>
        </View>

        {/* 활동 내역 */}
        <View style={styles.statsCard}>
          <StatItem label="저장한 스팟" value={bookmarks.length} />
          <View style={styles.statDivider} />
          <StatItem label="작성한 후기" value={reviewCount} />
          <View style={styles.statDivider} />
          <StatItem label="방문한 코스" value={3} />
        </View>

        {/* 내가 작성한 후기 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내가 작성한 후기</Text>
          <View style={styles.sectionLinkRow}>
            <Text style={styles.sectionLink}>전체보기</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textSub} />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.reviewRow}>
            {myReviewCards.map((card) => (
              <Pressable
                key={card.id}
                style={styles.reviewCard}
                onPress={() => router.push(`/spot/${card.spotId}`)}
                accessibilityRole="button">
                <Image source={{ uri: card.image }} style={styles.reviewImage} contentFit="cover" />
                <View style={styles.reviewBody}>
                  <Text style={styles.reviewTitle} numberOfLines={1}>
                    {card.title}
                  </Text>
                  <View style={styles.reviewDateRow}>
                    <Ionicons name="star" size={13} color={colors.sageLight} />
                    <Text style={styles.reviewDate}>{card.date}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* 설정 */}
        <Text style={styles.settingsLabel}>설정</Text>
        <View style={styles.settingsList}>
          <SettingRow icon="notifications" label="알림 설정" />
          <SettingRow icon="shield-checkmark" label="계정 관리" />
          <SettingRow icon="information-circle" label="고객 센터" />
          <SettingRow icon="log-out-outline" label="로그아웃" danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  danger = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.settingRow} accessibilityRole="button">
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
          <Ionicons name={icon} size={18} color={danger ? colors.logout : colors.sage} />
        </View>
        <Text style={[styles.settingText, danger && styles.settingTextDanger]}>{label}</Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.textSub} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.beigeBg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
  },
  profile: {
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: colors.cardBg,
    backgroundColor: colors.sageSoft,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.sageLight,
    borderWidth: 2,
    borderColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.textSub,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radius.card + 8,
    paddingVertical: 20,
    ...shadow.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSub,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textMain,
  },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.textSub,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reviewCard: {
    width: 220,
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadow.card,
  },
  reviewImage: {
    height: 130,
    backgroundColor: colors.sageSoft,
  },
  reviewBody: {
    padding: 12,
    gap: 6,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  reviewDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSub,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.sage,
    marginTop: spacing.sm,
  },
  settingsList: {
    gap: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.sageSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDanger: {
    backgroundColor: '#FBE3E0',
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  settingTextDanger: {
    color: colors.logout,
  },
});
