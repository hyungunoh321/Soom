import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotCard } from '@/components/SpotCard';
import { TagChip } from '@/components/TagChip';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { MOOD_TAGS, SPOTS } from '@/data/spots';

// SOOM_HOME_001 — 위치 기반 주변 힐링 스팟 추천 목록
export default function HomeScreen() {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 현재 위치 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>현재 위치</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={colors.sage} />
              <Text style={styles.locationText}>서울시 마포구 연남동</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSub} />
            </View>
          </View>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=44' }}
            style={styles.avatar}
            contentFit="cover"
          />
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

        {/* 주변 힐링 스팟 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>주변 힐링 스팟</Text>
          <Text style={styles.sectionLink}>전체보기</Text>
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
