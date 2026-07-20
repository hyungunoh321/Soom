import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONGESTION_META } from '@/components/CongestionBadge';
import { CongestionChart } from '@/components/CongestionChart';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SpotImage } from '@/components/SpotImage';
import { StarRating } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { getSpot, resolveCongestion } from '@/data/spots';
import { useSpotReviews } from '@/hooks/use-spot-reviews';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import type { CongestionLevel, Review } from '@/types';

const CONGESTION_LEVELS: CongestionLevel[] = ['low', 'mid', 'high'];

// SOOM_SPOT_001(장소 정보) + SOOM_SPOT_002(후기 목록) + SOOM_SPOT_004(혼잡도 차트/제보)
export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const {
    userId,
    isBookmarked,
    toggleBookmark,
    myReviews,
    isReviewReported,
    reportReview,
    congestionReports,
    reportCongestion,
  } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [pendingReport, setPendingReport] = useState<Review | null>(null);

  const spot = getSpot(id);
  // 서버에 쌓인 다른 사용자들의 후기 (미연결 시 빈 배열)
  const { reviews: serverReviews } = useSpotReviews(spot?.id);

  if (!spot) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>장소를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const bookmarked = isBookmarked(spot.id);
  const mine = myReviews[spot.id] ?? [];
  const myIds = new Set(mine.map((r) => r.id));
  // 내 후기(로컬 최신) → 다른 사용자 서버 후기 → 시드 후기 순, 신고한 후기는 숨김
  const others = serverReviews.filter((r) => !myIds.has(r.id) && r.userId !== userId);
  const reviews: Review[] = [...mine, ...others, ...spot.reviews].filter(
    (r) => !isReviewReported(spot.id, r.id),
  );

  const myCongestionReport = congestionReports[spot.id];
  const currentCongestion = resolveCongestion(spot, myCongestionReport);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* 히어로 이미지 + 뒤로가기/북마크 */}
        <View style={styles.hero}>
          <SpotImage uri={spot.image} style={styles.heroImage} transition={250} fallbackIconSize={40} />
          <View style={[styles.heroButtons, { top: insets.top + 8 }]}>
            <Pressable style={styles.circleBtn} onPress={goBack} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={c.textMain} />
            </Pressable>
            <Pressable
              style={[styles.circleBtn, bookmarked && styles.circleBtnActive]}
              onPress={() => toggleBookmark(spot.id)}
              hitSlop={8}>
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={bookmarked ? '#FFFFFF' : c.textMain}
              />
            </Pressable>
          </View>
        </View>

        {/* 본문 시트 */}
        <View style={styles.sheet}>
          {/* 장소 정보 */}
          <View style={styles.titleRow}>
            <Text style={styles.name}>{spot.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={15} color={c.star} />
              <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={14} color={c.textSub} />
            <Text style={styles.address}>{spot.address}</Text>
          </View>
          <View style={styles.tagRow}>
            {spot.tags.map((tag) => (
              <TagChip key={tag} label={tag} small />
            ))}
          </View>
          <Text style={styles.description}>{spot.description}</Text>

          {/* 시간대별 혼잡도 */}
          <CongestionChart data={spot.congestionByTime} />

          {/* 실시간 혼잡도 제보 */}
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>지금 이곳은 어때요?</Text>
              <View style={styles.currentRow}>
                <View
                  style={[
                    styles.currentDot,
                    { backgroundColor: CONGESTION_META[currentCongestion].color },
                  ]}
                />
                <Text style={styles.currentText}>{CONGESTION_META[currentCongestion].label}</Text>
              </View>
            </View>
            <Text style={styles.reportDesc}>
              방문 중이라면 혼잡도를 제보해 주세요. 2시간 동안 다른 정보보다 우선 표시돼요.
            </Text>
            <View style={styles.reportChips}>
              {CONGESTION_LEVELS.map((level) => {
                const active = currentCongestion === level && myCongestionReport != null;
                return (
                  <Pressable
                    key={level}
                    style={[styles.reportChip, active && styles.reportChipActive]}
                    onPress={() => {
                      reportCongestion(spot.id, level);
                      toast.show('혼잡도 제보 고마워요! 바로 반영했어요.');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${CONGESTION_META[level].label} 제보`}>
                    <View
                      style={[styles.currentDot, { backgroundColor: CONGESTION_META[level].color }]}
                    />
                    <Text style={[styles.reportChipText, active && styles.reportChipTextActive]}>
                      {CONGESTION_META[level].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 방문자 후기 */}
          <View style={styles.reviewHeader}>
            <View style={styles.reviewTitleRow}>
              <Text style={styles.reviewTitle}>방문자 후기</Text>
              <Text style={styles.reviewCount}>{reviews.length}</Text>
            </View>
          </View>

          <View style={styles.reviewList}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                spotId={spot.id}
                review={review}
                mine={myIds.has(review.id)}
                onReport={() => setPendingReport(review)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 후기 작성하기 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.writeBtn}
          onPress={() => router.push(`/review/${spot.id}`)}
          accessibilityRole="button">
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.writeBtnText}>후기 작성하기</Text>
        </Pressable>
      </View>

      {/* 후기 신고 확인 */}
      <ConfirmDialog
        visible={pendingReport !== null}
        title="후기 신고"
        message="이 후기를 신고할까요? 신고한 후기는 목록에서 보이지 않으며, 검토 후 조치돼요."
        confirmLabel="신고하기"
        danger
        onCancel={() => setPendingReport(null)}
        onConfirm={() => {
          if (pendingReport) {
            reportReview(spot.id, pendingReport.id);
            toast.show('신고가 접수됐어요. 해당 후기를 숨겼어요.');
          }
          setPendingReport(null);
        }}
      />
    </View>
  );
}

function ReviewCard({
  spotId,
  review,
  mine,
  onReport,
}: {
  spotId: string;
  review: Review;
  mine: boolean;
  onReport: () => void;
}) {
  const { isReviewLiked, toggleReviewLike } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const liked = isReviewLiked(spotId, review.id);
  const likeCount = (review.likes ?? 0) + (liked ? 1 : 0);

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTopRow}>
        <View style={styles.reviewAuthorRow}>
          <Image
            source={{ uri: review.avatar ?? 'https://i.pravatar.cc/100?img=1' }}
            style={styles.reviewAvatar}
            contentFit="cover"
          />
          <View>
            <View style={styles.reviewNameRow}>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
              {mine && <Text style={styles.myBadge}>내 후기</Text>}
            </View>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
      {(review.tags ?? []).length > 0 && (
        <View style={styles.reviewTags}>
          {(review.tags ?? []).map((tag) => (
            <TagChip key={tag} label={tag} small />
          ))}
        </View>
      )}
      {review.photos.length > 0 && (
        <View style={styles.reviewPhotos}>
          {review.photos.map((photo, i) => (
            <SpotImage key={i} uri={photo} style={styles.reviewPhoto} />
          ))}
        </View>
      )}
      <View style={styles.reviewActions}>
        <Pressable
          style={styles.likeBtn}
          onPress={() => toggleReviewLike(spotId, review.id)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="도움돼요">
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={16}
            color={liked ? c.logout : c.textSub}
          />
          <Text style={[styles.likeText, liked && styles.likeTextActive]}>
            도움돼요 {likeCount}
          </Text>
        </Pressable>
        {!mine && (
          <Pressable
            style={styles.likeBtn}
            onPress={onReport}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="후기 신고">
            <Ionicons name="flag-outline" size={14} color={c.textSub} />
            <Text style={styles.likeText}>신고</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.beigeBg,
    },
    notFound: {
      padding: spacing.lg,
      fontSize: 15,
      color: c.textSub,
    },
    scroll: {
      paddingBottom: 120,
    },
    hero: {
      height: 300,
      backgroundColor: c.sageSoft,
    },
    heroImage: {
      flex: 1,
    },
    heroButtons: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.85)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleBtnActive: {
      backgroundColor: c.sage,
    },
    sheet: {
      marginTop: -24,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: c.beigeBg,
      padding: spacing.lg,
      gap: 14,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    name: {
      flex: 1,
      fontSize: 24,
      fontWeight: '800',
      color: c.textMain,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.cardBg,
      borderRadius: radius.badge,
      paddingHorizontal: 12,
      paddingVertical: 6,
      ...shadow.card,
    },
    ratingText: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textMain,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    address: {
      fontSize: 14,
      color: c.textSub,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    description: {
      fontSize: 14,
      lineHeight: 22,
      color: c.textMain,
    },
    reportCard: {
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.md,
      gap: 10,
    },
    reportHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textMain,
    },
    currentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    currentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    currentText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textMain,
    },
    reportDesc: {
      fontSize: 12,
      lineHeight: 18,
      color: c.textSub,
    },
    reportChips: {
      flexDirection: 'row',
      gap: 8,
    },
    reportChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: radius.chip,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 9,
    },
    reportChipActive: {
      borderColor: c.sage,
      backgroundColor: c.sageSoft,
    },
    reportChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSub,
    },
    reportChipTextActive: {
      color: c.textMain,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    reviewTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    reviewTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: c.textMain,
    },
    reviewCount: {
      fontSize: 18,
      fontWeight: '800',
      color: c.sage,
    },
    reviewList: {
      gap: spacing.md,
    },
    reviewCard: {
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.md,
      gap: 10,
    },
    reviewTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    reviewAuthorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    reviewAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.sageSoft,
    },
    reviewNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    reviewAuthor: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textMain,
    },
    myBadge: {
      fontSize: 10,
      fontWeight: '700',
      color: c.sage,
      backgroundColor: c.sageSoft,
      borderRadius: radius.chip,
      paddingHorizontal: 7,
      paddingVertical: 2,
      overflow: 'hidden',
    },
    reviewDate: {
      fontSize: 12,
      color: c.textSub,
    },
    reviewText: {
      fontSize: 14,
      lineHeight: 22,
      color: c.textMain,
    },
    reviewTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    reviewPhotos: {
      flexDirection: 'row',
      gap: 8,
    },
    reviewPhoto: {
      width: 96,
      height: 96,
      borderRadius: radius.image,
      backgroundColor: c.sageSoft,
    },
    reviewActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    likeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    likeText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSub,
    },
    likeTextActive: {
      color: c.logout,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.lg,
      paddingTop: 12,
      backgroundColor: c.beigeBg,
    },
    writeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.sage,
      borderRadius: radius.input,
      height: 54,
    },
    writeBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
