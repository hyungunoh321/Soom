import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingScore } from '@/components/StarRating';
import { SpotCard } from '@/components/SpotCard';
import { TagChip } from '@/components/TagChip';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { MOOD_TAGS, SPOTS, recommendSpots } from '@/data/spots';
import { useLocationLabel } from '@/hooks/use-location';
import { useApp } from '@/store/app-context';

// SOOM_HOME_001(추천 스팟) + SOOM_HOME_002(맞춤 추천)
export default function HomeScreen() {
  const router = useRouter();
  const { user, bookmarks, myReviews } = useApp();
  const { label: locationLabel, refresh: refreshLocation } = useLocationLabel();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const reviewedSpotIds = useMemo(
    () => Object.keys(myReviews).filter((id) => (myReviews[id] ?? []).length > 0),
    [myReviews],
  );
  const recommended = useMemo(
    () => recommendSpots(bookmarks, reviewedSpotIds),
    [bookmarks, reviewedSpotIds],
  );

  const spots = useMemo(() => {
    let list = SPOTS;
    if (selectedTag) list = list.filter((s) => s.tags.includes(selectedTag));
    if (query.trim()) {
      const q = query.trim();
      list = list.filter(
        (s) => s.name.includes(q) || s.address.includes(q) || s.tags.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [selectedTag, query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  }, [refreshLocation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.sage} />
        }>
        {/* 현재 위치 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>현재 위치</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={colors.sage} />
              <Text style={styles.locationText}>{locationLabel}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSub} />
            </View>
          </View>
          <Pressable onPress={() => router.push('/my')}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
          </Pressable>
        </View>

        {/* 검색바 */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSub} />
          <TextInput
            style={styles.searchInput}
            placeholder="오늘 당신에게 필요한 쉼은 무엇인가요?"
            placeholderTextColor={colors.textSub}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textSub} />
            </Pressable>
          )}
        </View>

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

        {/* 맞춤 추천 (SOOM_HOME_002) — 검색/필터 중에는 숨김 */}
        {!selectedTag && !query.trim() && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {user?.name ?? '당신'}님을 위한 오늘의 쉼
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendRow}>
              {recommended.map((spot) => (
                <Pressable
                  key={spot.id}
                  style={styles.recommendCard}
                  onPress={() => router.push(`/spot/${spot.id}`)}>
                  <Image
                    source={{ uri: spot.image }}
                    style={styles.recommendImage}
                    contentFit="cover"
                    transition={200}
                  />
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

        <View style={styles.cardList}>
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} onPress={() => router.push(`/spot/${spot.id}`)} />
          ))}
          {spots.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={32} color={colors.sageLight} />
              <Text style={styles.emptyText}>조건에 맞는 스팟이 아직 없어요</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.textSub,
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
    color: colors.textMain,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.sageSoft,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBg,
    borderRadius: radius.input,
    paddingHorizontal: 18,
    height: 52,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textMain,
    paddingVertical: 0,
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
    color: colors.textMain,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.sage,
    fontWeight: '600',
  },
  recommendRow: {
    gap: 12,
  },
  recommendCard: {
    width: 200,
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadow.card,
  },
  recommendImage: {
    height: 110,
    backgroundColor: colors.sageSoft,
  },
  recommendBody: {
    padding: 12,
    gap: 6,
  },
  recommendName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  recommendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  recommendTag: {
    fontSize: 12,
    color: colors.sage,
    fontWeight: '600',
  },
  cardList: {
    gap: spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSub,
  },
});
