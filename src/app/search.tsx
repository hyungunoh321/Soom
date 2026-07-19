import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotImage } from '@/components/SpotImage';
import { RatingScore } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { MOOD_TAGS, SPOTS } from '@/data/spots';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import type { Spot } from '@/types';

// SOOM_MAP_003 — 키워드 검색 (최근 검색어 · 인기 태그 · 결과)
export default function SearchScreen() {
  const router = useRouter();
  const { searchHistory, addSearchTerm, clearSearchHistory } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return SPOTS.filter(
      (s) =>
        s.name.includes(q) ||
        s.address.includes(q) ||
        s.description.includes(q) ||
        s.tags.some((t) => t.includes(q)),
    );
  }, [query]);

  const openSpot = (spot: Spot) => {
    addSearchTerm(query || spot.name);
    router.push(`/spot/${spot.id}`);
  };

  const showResults = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 검색바 + 뒤로가기 */}
      <View style={styles.searchRow}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="뒤로가기">
          <Ionicons name="chevron-back" size={24} color={c.textMain} />
        </Pressable>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={c.textSub} />
          <TextInput
            style={styles.searchInput}
            placeholder="장소, 동네, 분위기로 검색"
            placeholderTextColor={c.textSub}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => addSearchTerm(query)}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={c.textSub} />
            </Pressable>
          )}
        </View>
      </View>

      {showResults ? (
        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={styles.resultRow} onPress={() => openSpot(item)}>
              <SpotImage uri={item.image} style={styles.resultImage} />
              <View style={styles.resultBody}>
                <Text style={styles.resultName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.resultAddress} numberOfLines={1}>
                  {item.address}
                </Text>
                <View style={styles.resultMeta}>
                  <RatingScore rating={item.rating} size={12} />
                  <Text style={styles.resultTags} numberOfLines={1}>
                    {item.tags.map((t) => `#${t}`).join(' ')}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={32} color={c.sageLight} />
              <Text style={styles.emptyText}>'{query.trim()}'에 맞는 스팟이 없어요</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.content}>
          {/* 최근 검색어 */}
          {searchHistory.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>최근 검색어</Text>
                <Pressable onPress={clearSearchHistory}>
                  <Text style={styles.clearText}>전체 삭제</Text>
                </Pressable>
              </View>
              <View style={styles.chipWrap}>
                {searchHistory.map((term) => (
                  <Pressable key={term} style={styles.historyChip} onPress={() => setQuery(term)}>
                    <Ionicons name="time-outline" size={13} color={c.textSub} />
                    <Text style={styles.historyText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* 인기 태그 */}
          <Text style={[styles.sectionTitle, { marginTop: searchHistory.length > 0 ? spacing.md : 0 }]}>
            인기 분위기 태그
          </Text>
          <View style={styles.chipWrap}>
            {MOOD_TAGS.map((tag) => (
              <TagChip key={tag} label={`#${tag}`} onPress={() => setQuery(tag)} />
            ))}
          </View>

          {/* 추천 검색 */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>이런 곳은 어때요?</Text>
          <View style={styles.chipWrap}>
            {SPOTS.slice(0, 3).map((s) => (
              <Pressable key={s.id} style={styles.historyChip} onPress={() => setQuery(s.name)}>
                <Ionicons name="leaf-outline" size={13} color={c.sage} />
                <Text style={styles.historyText}>{s.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.beigeBg,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: radius.input,
      paddingHorizontal: 16,
      height: 48,
      ...shadow.card,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: c.textMain,
      paddingVertical: 0,
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.md,
      gap: 10,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textMain,
    },
    clearText: {
      fontSize: 13,
      color: c.textSub,
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    historyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.cardBg,
      borderRadius: radius.chip,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    historyText: {
      fontSize: 13,
      color: c.textMain,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: 10,
      marginBottom: 10,
      ...shadow.card,
    },
    resultImage: {
      width: 64,
      height: 64,
      borderRadius: 14,
      backgroundColor: c.sageSoft,
    },
    resultBody: {
      flex: 1,
      gap: 3,
    },
    resultName: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textMain,
    },
    resultAddress: {
      fontSize: 12,
      color: c.textSub,
    },
    resultMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resultTags: {
      flex: 1,
      fontSize: 12,
      color: c.sage,
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
  });
