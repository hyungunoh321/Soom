import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SpotImage } from '@/components/SpotImage';
import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { getSpot } from '@/data/spots';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import { persistPhoto } from '@/utils/photos';

// SOOM_MY_001(내 정보) + SOOM_MY_002(내 후기)
export default function MyScreen() {
  const router = useRouter();
  const toast = useToast();
  const { user, bookmarks, myReviews, lists, logout, updateProfile } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const changeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.show('사진 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = await persistPhoto(result.assets[0].uri);
      updateProfile({ avatar: uri });
      toast.show('프로필 사진을 바꿨어요.');
    }
  };

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
            <Ionicons name="settings-sharp" size={22} color={c.sage} />
          </Pressable>
        </View>

        {/* 프로필 */}
        <View style={styles.profile}>
          <Pressable onPress={changeAvatar} accessibilityRole="button" accessibilityLabel="프로필 사진 변경">
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
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
            <Ionicons name="chevron-forward" size={14} color={c.textSub} />
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
                  <SpotImage uri={card.image} style={styles.reviewImage} />
                  <View style={styles.reviewBody}>
                    <Text style={styles.reviewTitle} numberOfLines={1}>
                      {card.title}
                    </Text>
                    <View style={styles.reviewDateRow}>
                      <Ionicons name="star" size={13} color={c.sageLight} />
                      <Text style={styles.reviewDate}>{card.date}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyReview}>
            <Ionicons name="create-outline" size={26} color={c.sageLight} />
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
            icon="moon"
            label="화면 테마"
            onPress={() => router.push('/settings/appearance')}
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
  const styles = useThemedStyles(createStyles);
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
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable style={styles.settingRow} onPress={onPress} accessibilityRole="button">
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
          <Ionicons name={icon} size={18} color={danger ? c.logout : c.sage} />
        </View>
        <Text style={[styles.settingText, danger && styles.settingTextDanger]}>{label}</Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color={c.textSub} />}
    </Pressable>
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
      color: c.textMain,
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
      borderColor: c.cardBg,
      backgroundColor: c.sageSoft,
    },
    cameraBadge: {
      position: 'absolute',
      right: 0,
      bottom: 4,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: c.sageLight,
      borderWidth: 2,
      borderColor: c.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      fontSize: 24,
      fontWeight: '800',
      color: c.textMain,
      marginTop: 8,
    },
    bio: {
      fontSize: 14,
      color: c.textSub,
    },
    statsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.cardBg,
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
      color: c.textSub,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
      color: c.textMain,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: c.border,
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
      color: c.textMain,
    },
    sectionLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    sectionLink: {
      fontSize: 13,
      color: c.textSub,
    },
    reviewRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    reviewCard: {
      width: 220,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      overflow: 'hidden',
      ...shadow.card,
    },
    reviewImage: {
      height: 130,
      backgroundColor: c.sageSoft,
    },
    reviewBody: {
      padding: 12,
      gap: 6,
    },
    reviewTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textMain,
    },
    reviewDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    reviewDate: {
      fontSize: 12,
      color: c.textSub,
    },
    emptyReview: {
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      paddingVertical: 28,
    },
    emptyReviewText: {
      fontSize: 13,
      color: c.textSub,
    },
    settingsLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: c.sage,
      marginTop: spacing.sm,
    },
    settingsList: {
      gap: 10,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.cardBg,
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
      backgroundColor: c.sageSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingIconDanger: {
      backgroundColor: c.logoutSoft,
    },
    settingText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textMain,
    },
    settingTextDanger: {
      color: c.logout,
    },
  });
