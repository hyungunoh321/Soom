import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { getSpot } from '@/data/spots';
import { useApp } from '@/store/app-context';

// SOOM_MY_001(내 정보) + SOOM_MY_002(내 후기)
export default function MyScreen() {
  const router = useRouter();
  const { user, bookmarks, myReviews, lists, logout } = useApp();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const writtenReviews = Object.entries(myReviews).flatMap(([spotId, reviews]) =>
    reviews.map((r) => ({
      id: r.id,
      title: getSpot(spotId)?.name ?? '알 수 없는 장소',
      date: r.date,
      image: r.photos[0] ?? getSpot(spotId)?.image ?? '',
      spotId,
    })),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <Pressable onPress={() => router.push('/settings/account')} hitSlop={8}>
            <Ionicons name="settings-sharp" size={22} color={colors.sage} />
          </Pressable>
        </View>

        {/* 프로필 */}
        <View style={styles.profile}>
          <View>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.bio}>{user?.bio}</Text>
        </View>

        {/* 활동 내역 */}
        <View style={styles.statsCard}>
          <StatItem label="저장한 스팟" value={bookmarks.length} />
          <View style={styles.statDivider} />
          <StatItem label="작성한 후기" value={writtenReviews.length} />
          <View style={styles.statDivider} />
          <StatItem label="힐링 리스트" value={lists.length} />
        </View>

        {/* 내가 작성한 후기 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내가 작성한 후기</Text>
          <Pressable style={styles.sectionLinkRow} onPress={() => router.push('/my-reviews')}>
            <Text style={styles.sectionLink}>전체보기</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textSub} />
          </Pressable>
        </View>

        {writtenReviews.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.reviewRow}>
              {writtenReviews.map((card) => (
                <Pressable
                  key={card.id}
                  style={styles.reviewCard}
                  onPress={() => router.push(`/spot/${card.spotId}`)}>
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
        ) : (
          <View style={styles.emptyReview}>
            <Ionicons name="create-outline" size={26} color={colors.sageLight} />
            <Text style={styles.emptyReviewText}>
              방문한 스팟에 첫 후기를 남기면 여기에 모여요.
            </Text>
          </View>
        )}

        {/* 설정 */}
        <Text style={styles.settingsLabel}>설정</Text>
        <View style={styles.settingsList}>
          <SettingRow
            icon="notifications"
            label="알림 설정"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingRow
            icon="shield-checkmark"
            label="계정 관리"
            onPress={() => router.push('/settings/account')}
          />
          <SettingRow
            icon="information-circle"
            label="고객 센터"
            onPress={() => router.push('/settings/support')}
          />
          <SettingRow
            icon="log-out-outline"
            label="로그아웃"
            danger
            onPress={() => setConfirmLogout(true)}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmLogout}
        title="로그아웃"
        message="정말 로그아웃할까요? 저장한 스팟과 후기는 기기에 안전하게 남아 있어요."
        confirmLabel="로그아웃"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />
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
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress} accessibilityRole="button">
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
  emptyReview: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    paddingVertical: 28,
  },
  emptyReviewText: {
    fontSize: 13,
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
