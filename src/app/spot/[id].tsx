import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CongestionChart } from '@/components/CongestionChart';
import { StarRating } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { getSpot } from '@/data/spots';
import { useApp } from '@/store/app-context';
import type { Review } from '@/types';

// SOOM_SPOT_001(장소 정보) + SOOM_SPOT_002(후기 목록) + SOOM_SPOT_004(혼잡도 차트)
export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark, myReviews } = useApp();

  const spot = getSpot(id);
  if (!spot) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>장소를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const bookmarked = isBookmarked(spot.id);
  const reviews: Review[] = [...(myReviews[spot.id] ?? []), ...spot.reviews];

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* 히어로 이미지 + 뒤로가기/북마크 */}
        <View style={styles.hero}>
          <Image source={{ uri: spot.image }} style={styles.heroImage} contentFit="cover" transition={250} />
          <View style={[styles.heroButtons, { top: insets.top + 8 }]}>
            <Pressable style={styles.circleBtn} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={colors.textMain} />
            </Pressable>
            <Pressable
              style={[styles.circleBtn, bookmarked && styles.circleBtnActive]}
              onPress={() => toggleBookmark(spot.id)}
              hitSlop={8}>
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={bookmarked ? '#FFFFFF' : colors.textMain}
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
              <Ionicons name="star" size={15} color={colors.star} />
              <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={14} color={colors.textSub} />
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

          {/* 방문자 후기 */}
          <View style={styles.reviewHeader}>
            <View style={styles.reviewTitleRow}>
              <Text style={styles.reviewTitle}>방문자 후기</Text>
              <Text style={styles.reviewCount}>{reviews.length}</Text>
            </View>
            <View style={styles.reviewTitleRow}>
              <Text style={styles.sectionLink}>전체보기</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textSub} />
            </View>
          </View>

          <View style={styles.reviewList}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
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
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
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
            <Text style={styles.reviewAuthor}>{review.author}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
      {review.photos.length > 0 && (
        <View style={styles.reviewPhotos}>
          {review.photos.map((photo, i) => (
            <Image key={i} source={{ uri: photo }} style={styles.reviewPhoto} contentFit="cover" />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.beigeBg,
  },
  notFound: {
    padding: spacing.lg,
    fontSize: 15,
    color: colors.textSub,
  },
  scroll: {
    paddingBottom: 120,
  },
  hero: {
    height: 300,
    backgroundColor: colors.sageSoft,
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
    backgroundColor: colors.sage,
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.beigeBg,
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
    color: colors.textMain,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardBg,
    borderRadius: radius.badge,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadow.card,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    fontSize: 14,
    color: colors.textSub,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMain,
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
    color: colors.textMain,
  },
  reviewCount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.sage,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.textSub,
  },
  reviewList: {
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.cardBg,
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
    backgroundColor: colors.sageSoft,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSub,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMain,
  },
  reviewPhotos: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewPhoto: {
    width: 96,
    height: 96,
    borderRadius: radius.image,
    backgroundColor: colors.sageSoft,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    backgroundColor: colors.beigeBg,
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.sage,
    borderRadius: radius.input,
    height: 54,
  },
  writeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
