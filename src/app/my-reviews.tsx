import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SettingsHeader } from '@/components/SettingsHeader';
import { SpotImage } from '@/components/SpotImage';
import { StarRating } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { getSpot } from '@/data/spots';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';

// SOOM_MY_002 — 내가 작성한 후기 전체 목록 (수정/삭제 지원)
export default function MyReviewsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { myReviews, deleteReview } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [pendingDelete, setPendingDelete] = useState<{ spotId: string; reviewId: string } | null>(
    null,
  );

  const entries = Object.entries(myReviews).flatMap(([spotId, reviews]) =>
    reviews.map((review) => ({ spotId, review, spotName: getSpot(spotId)?.name ?? '알 수 없는 장소' })),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SettingsHeader title="내가 작성한 후기" />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.review.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: { spotId, review, spotName } }) => (
          <View style={styles.card}>
            <Pressable style={styles.cardHeader} onPress={() => router.push(`/spot/${spotId}`)}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.spotName}>{spotName}</Text>
                <Text style={styles.date}>{review.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textSub} />
            </Pressable>
            <StarRating rating={review.rating} size={14} />
            <Text style={styles.text}>{review.text}</Text>
            {(review.tags ?? []).length > 0 && (
              <View style={styles.tags}>
                {(review.tags ?? []).map((tag) => (
                  <TagChip key={tag} label={tag} small />
                ))}
              </View>
            )}
            {review.photos.length > 0 && (
              <View style={styles.photos}>
                {review.photos.map((photo, i) => (
                  <SpotImage key={i} uri={photo} style={styles.photo} />
                ))}
              </View>
            )}
            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() =>
                  router.push({ pathname: '/review/[spotId]', params: { spotId, reviewId: review.id } })
                }
                accessibilityRole="button"
                accessibilityLabel="후기 수정">
                <Ionicons name="pencil-outline" size={14} color={c.sage} />
                <Text style={styles.editText}>수정</Text>
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                onPress={() => setPendingDelete({ spotId, reviewId: review.id })}
                accessibilityRole="button"
                accessibilityLabel="후기 삭제">
                <Ionicons name="trash-outline" size={14} color={c.logout} />
                <Text style={styles.deleteText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="create-outline" size={40} color={c.sageLight} />
            <Text style={styles.emptyTitle}>아직 작성한 후기가 없어요</Text>
            <Text style={styles.emptyText}>
              다녀온 힐링 스팟의 감상을 남기면{'\n'}다른 사람들의 쉼에도 도움이 돼요.
            </Text>
          </View>
        }
      />

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="후기 삭제"
        message="이 후기를 삭제할까요? 되돌릴 수 없어요."
        confirmLabel="삭제"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteReview(pendingDelete.spotId, pendingDelete.reviewId);
            toast.show('후기를 삭제했어요.');
          }
          setPendingDelete(null);
        }}
      />
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
      gap: spacing.md,
    },
    card: {
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.md,
      gap: 10,
      ...shadow.card,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardHeaderLeft: {
      gap: 2,
    },
    spotName: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textMain,
    },
    date: {
      fontSize: 12,
      color: c.textSub,
    },
    text: {
      fontSize: 14,
      lineHeight: 21,
      color: c.textMain,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    photos: {
      flexDirection: 'row',
      gap: 8,
    },
    photo: {
      width: 84,
      height: 84,
      borderRadius: radius.image,
      backgroundColor: c.sageSoft,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    editText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.sage,
    },
    deleteText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.logout,
    },
    empty: {
      alignItems: 'center',
      gap: 10,
      paddingVertical: 80,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.textMain,
    },
    emptyText: {
      fontSize: 13,
      lineHeight: 20,
      color: c.textSub,
      textAlign: 'center',
    },
  });
