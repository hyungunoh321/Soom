import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotCard } from '@/components/SpotCard';
import { SpotImage } from '@/components/SpotImage';
import { RatingScore } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { MOOD_TAGS, SPOTS, recommendSpots } from '@/data/spots';
import { useLocationLabel } from '@/hooks/use-location';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';

// 위치 직접 선택용 프리셋 동네
const PRESET_AREAS = [
  '서울시 마포구 연남동',
  '서울시 마포구 망원동',
  '서울시 영등포구 여의도동',
  '서울시 성동구 성수동',
  '서울시 종로구 삼청동',
];

// SOOM_HOME_001(추천 스팟) + SOOM_HOME_002(맞춤 추천)
export default function HomeScreen() {
  const router = useRouter();
  const { user, bookmarks, myReviews, locationOverride, setLocationOverride, refreshCongestion } =
    useApp();
  const { label: gpsLabel, refresh: refreshLocation } = useLocationLabel();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const locationLabel = locationOverride ?? gpsLabel;

  const reviewedSpotIds = useMemo(
    () => Object.keys(myReviews).filter((id) => (myReviews[id] ?? []).length > 0),
    [myReviews],
  );
  const recommended = useMemo(
    () => recommendSpots(bookmarks, reviewedSpotIds),
    [bookmarks, reviewedSpotIds],
  );

  const spots = useMemo(
    () => (selectedTag ? SPOTS.filter((s) => s.tags.includes(selectedTag)) : SPOTS),
    [selectedTag],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshLocation(), refreshCongestion()]);
    setRefreshing(false);
  }, [refreshLocation, refreshCongestion]);

  const header = (
    <View style={styles.headerWrap}>
      {/* 현재 위치 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => setLocationPickerOpen(true)} accessibilityRole="button">
          <Text style={styles.locationLabel}>현재 위치</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={c.sage} />
            <Text style={styles.locationText}>{locationLabel}</Text>
            <Ionicons name="chevron-down" size={16} color={c.textSub} />
          </View>
        </Pressable>
        <Pressable onPress={() => router.push('/my')}>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
        </Pressable>
      </View>

      {/* 검색바 → 검색 화면 */}
      <Pressable
        style={styles.searchBar}
        onPress={() => router.push('/search')}
        accessibilityRole="button"
        accessibilityLabel="검색 화면 열기">
        <Ionicons name="search" size={18} color={c.textSub} />
        <Text style={styles.searchPlaceholder}>오늘 당신에게 필요한 쉼은 무엇인가요?</Text>
      </Pressable>

      {/* 분위기 태그 필터 */}
      <View style={styles.tagWrap}>
        <TagChip label="전체" selected={selectedTag === null} onPress={() => setSelectedTag(null)} />
        {MOOD_TAGS.map((tag) => (
          <TagChip
            key={tag}
            label={`#${tag}`}
            selected={selectedTag === tag}
            onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
          />
        ))}
      </View>

      {/* 맞춤 추천 (SOOM_HOME_002) — 필터 중에는 숨김 */}
      {!selectedTag && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{user?.name ?? '당신'}님을 위한 오늘의 쉼</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendRow}>
            {recommended.map((spot) => (
              <Pressable
                key={spot.id}
                style={({ pressed }) => [styles.recommendCard, pressed && styles.pressed]}
                onPress={() => router.push(`/spot/${spot.id}`)}>
                <SpotImage uri={spot.image} style={styles.recommendImage} />
                <View style={styles.recommendBody}>
                  <Text style={styles.recommendName} numberOfLines={1}>
                    {spot.name}
                  </Text>
                  <View style={styles.recommendMeta}>
                    <RatingScore rating={spot.rating} size={12} />
                    <Text style={styles.recommendTag} numberOfLines={1}>
                      #{spot.tags[0]}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* 주변 힐링 스팟 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>주변 힐링 스팟</Text>
        <Pressable onPress={() => router.push('/map')}>
          <Text style={styles.sectionLink}>전체보기</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={spots}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <SpotCard spot={item} onPress={() => router.push(`/spot/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={32} color={c.sageLight} />
            <Text style={styles.emptyText}>조건에 맞는 스팟이 아직 없어요</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.sage} />
        }
      />

      {/* 위치 선택 모달 */}
      <Modal
        visible={locationPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLocationPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>동네 선택</Text>
            <Pressable
              style={styles.areaRow}
              onPress={() => {
                setLocationOverride(null);
                setLocationPickerOpen(false);
                refreshLocation();
              }}>
              <Ionicons name="navigate" size={16} color={c.sage} />
              <Text style={styles.areaText}>현재 위치 사용 (GPS)</Text>
              {locationOverride === null && <Ionicons name="checkmark" size={16} color={c.sage} />}
            </Pressable>
            {PRESET_AREAS.map((area) => (
              <Pressable
                key={area}
                style={styles.areaRow}
                onPress={() => {
                  setLocationOverride(area);
                  setLocationPickerOpen(false);
                }}>
                <Ionicons name="location-outline" size={16} color={c.textSub} />
                <Text style={styles.areaText}>{area}</Text>
                {locationOverride === area && <Ionicons name="checkmark" size={16} color={c.sage} />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
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
      paddingBottom: spacing.xl,
    },
    headerWrap: {
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    locationLabel: {
      fontSize: 12,
      color: c.textSub,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 17,
      fontWeight: '700',
      color: c.textMain,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.sageSoft,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: radius.input,
      paddingHorizontal: 18,
      height: 52,
      ...shadow.card,
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: 14,
      color: c.textSub,
    },
    tagWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
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
    sectionLink: {
      fontSize: 13,
      color: c.sage,
      fontWeight: '600',
    },
    recommendRow: {
      gap: 12,
    },
    recommendCard: {
      width: 200,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      overflow: 'hidden',
      ...shadow.card,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    recommendImage: {
      height: 110,
      backgroundColor: c.sageSoft,
    },
    recommendBody: {
      padding: 12,
      gap: 6,
    },
    recommendName: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textMain,
    },
    recommendMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    recommendTag: {
      fontSize: 12,
      color: c.sage,
      fontWeight: '600',
    },
    cardWrap: {
      marginBottom: spacing.md,
    },
    empty: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 14,
      color: c.textSub,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.md,
      gap: 4,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textMain,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    areaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    areaText: {
      flex: 1,
      fontSize: 14,
      color: c.textMain,
    },
  });
