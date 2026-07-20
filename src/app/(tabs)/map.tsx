import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONGESTION_META } from '@/components/CongestionBadge';
import { SpotImage } from '@/components/SpotImage';
import { SpotMap } from '@/components/SpotMap';
import { RatingScore } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { MOOD_TAGS, SPOTS, resolveCongestion } from '@/data/spots';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import type { Spot } from '@/types';

// SOOM_MAP_001 — 지도 위 힐링 스팟 마커 표시 및 탐색
// (react-native-maps 대신 시안 무드의 스타일드 목업 지도 사용 — 사용자 확정)
export default function MapScreen() {
  const router = useRouter();
  const { congestionReports } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [selectedTag, setSelectedTag] = useState<string | null>('조용함');
  const [query, setQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(SPOTS[0]);

  const spots = useMemo(() => {
    let list = SPOTS;
    if (selectedTag) list = list.filter((s) => s.tags.includes(selectedTag));
    if (query.trim()) {
      const q = query.trim();
      list = list.filter((s) => s.name.includes(q) || s.tags.some((t) => t.includes(q)));
    }
    return list;
  }, [selectedTag, query]);

  const visibleSelected =
    selectedSpot && spots.some((s) => s.id === selectedSpot.id) ? selectedSpot : spots[0] ?? null;

  const selectedCongestion = visibleSelected
    ? CONGESTION_META[resolveCongestion(visibleSelected, congestionReports[visibleSelected.id])]
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 검색바 + 태그 필터 */}
      <View style={styles.topArea}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={c.textSub} />
          <TextInput
            style={styles.searchInput}
            placeholder="어디서 쉬고 싶으신가요?"
            placeholderTextColor={c.textSub}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagRow}>
          {MOOD_TAGS.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={selectedTag === tag}
              onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 지도 (네이티브: 실제 지도 / 웹: 목업 폴백) */}
      <View style={styles.mapArea}>
        <SpotMap
          spots={spots}
          selectedId={visibleSelected?.id ?? null}
          onSelect={setSelectedSpot}
        />
      </View>

      {/* 선택된 스팟 하단 카드 */}
      {visibleSelected && selectedCongestion && (
        <View style={styles.sheet}>
          <View style={styles.sheetImageWrap}>
            <SpotImage uri={visibleSelected.image} style={styles.sheetImage} />
          </View>
          <View style={styles.sheetBody}>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetName} numberOfLines={1}>
                {visibleSelected.name}
              </Text>
              <RatingScore rating={visibleSelected.rating} />
            </View>
            <Text style={styles.sheetAddress}>{visibleSelected.address}</Text>
            <View style={styles.sheetTags}>
              {visibleSelected.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} label={tag} small />
              ))}
            </View>
            <View style={styles.sheetFooter}>
              <View style={styles.congestionRow}>
                <View
                  style={[styles.congestionDot, { backgroundColor: selectedCongestion.color }]}
                />
                <Text style={styles.congestionText}>
                  현재 혼잡도:{' '}
                  <Text style={{ color: selectedCongestion.color }}>
                    {selectedCongestion.label}
                  </Text>
                </Text>
              </View>
              <Pressable
                style={styles.detailBtn}
                onPress={() => router.push(`/spot/${visibleSelected.id}`)}
                accessibilityRole="button">
                <Text style={styles.detailBtnText}>상세보기</Text>
              </Pressable>
            </View>
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
    topArea: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      gap: spacing.md,
      zIndex: 2,
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
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: c.textMain,
      paddingVertical: 0,
    },
    tagRow: {
      gap: 8,
      paddingRight: spacing.lg,
    },
    mapArea: {
      flex: 1,
      backgroundColor: c.mapBg,
      overflow: 'hidden',
    },
    sheet: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.md,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      overflow: 'hidden',
      ...shadow.card,
    },
    sheetImageWrap: {
      height: 120,
      backgroundColor: c.sageSoft,
    },
    sheetImage: {
      flex: 1,
    },
    sheetBody: {
      padding: spacing.md,
      gap: 8,
    },
    sheetTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    sheetName: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: c.textMain,
    },
    sheetAddress: {
      fontSize: 13,
      color: c.textSub,
    },
    sheetTags: {
      flexDirection: 'row',
      gap: 8,
    },
    sheetFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    congestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    congestionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    congestionText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textMain,
    },
    detailBtn: {
      backgroundColor: c.sage,
      borderRadius: radius.button,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    detailBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
