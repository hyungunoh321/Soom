import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONGESTION_META } from '@/components/CongestionBadge';
import { RatingScore } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { MOOD_TAGS, SPOTS } from '@/data/spots';
import type { Spot } from '@/types';

// SOOM_MAP_001 — 지도 위 힐링 스팟 마커 표시 및 탐색
// (react-native-maps 대신 시안 무드의 스타일드 목업 지도 사용 — 사용자 확정)
export default function MapScreen() {
  const router = useRouter();
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

  const visibleSelected = selectedSpot && spots.some((s) => s.id === selectedSpot.id)
    ? selectedSpot
    : spots[0] ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 검색바 + 태그 필터 */}
      <View style={styles.topArea}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSub} />
          <TextInput
            style={styles.searchInput}
            placeholder="어디서 쉬고 싶으신가요?"
            placeholderTextColor={colors.textSub}
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

      {/* 목업 지도 */}
      <View style={styles.mapArea}>
        <MockMapBackground />
        {spots.map((spot) => {
          const active = visibleSelected?.id === spot.id;
          return (
            <Pressable
              key={spot.id}
              style={[styles.marker, { left: `${spot.mapPos.x}%`, top: `${spot.mapPos.y}%` }]}
              onPress={() => setSelectedSpot(spot)}
              accessibilityRole="button"
              accessibilityLabel={spot.name}>
              {active && (
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText}>{spot.name}</Text>
                </View>
              )}
              <Ionicons
                name="location"
                size={active ? 38 : 28}
                color={active ? colors.sage : colors.sageLight}
              />
            </Pressable>
          );
        })}
      </View>

      {/* 선택된 스팟 하단 카드 */}
      {visibleSelected && (
        <View style={styles.sheet}>
          <View style={styles.sheetImageWrap}>
            <Image
              source={{ uri: visibleSelected.image }}
              style={styles.sheetImage}
              contentFit="cover"
              transition={200}
            />
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
                  style={[
                    styles.congestionDot,
                    { backgroundColor: CONGESTION_META[visibleSelected.congestion].color },
                  ]}
                />
                <Text style={styles.congestionText}>
                  현재 혼잡도:{' '}
                  <Text style={{ color: CONGESTION_META[visibleSelected.congestion].color }}>
                    {CONGESTION_META[visibleSelected.congestion].label}
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

// 베이지 톤 일러스트 느낌의 목업 지도 배경 (도로/강/공원)
function MockMapBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 강 */}
      <View style={[styles.river, { top: '58%', left: '-10%', transform: [{ rotate: '-12deg' }] }]} />
      {/* 도로 */}
      <View style={[styles.road, { top: '20%', left: '-5%', width: '120%', transform: [{ rotate: '8deg' }] }]} />
      <View style={[styles.road, { top: '45%', left: '-10%', width: '130%', transform: [{ rotate: '-4deg' }] }]} />
      <View style={[styles.road, { top: '75%', left: '-5%', width: '120%', transform: [{ rotate: '5deg' }] }]} />
      <View style={[styles.roadVertical, { left: '30%', top: '-5%', transform: [{ rotate: '10deg' }] }]} />
      <View style={[styles.roadVertical, { left: '65%', top: '-8%', transform: [{ rotate: '-7deg' }] }]} />
      {/* 공원 */}
      <View style={[styles.park, { top: '12%', left: '55%', width: 70, height: 46 }]} />
      <View style={[styles.park, { top: '68%', left: '15%', width: 54, height: 54 }]} />
      <View style={[styles.park, { top: '35%', left: '10%', width: 40, height: 32 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.beigeBg,
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
  tagRow: {
    gap: 8,
    paddingRight: spacing.lg,
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#EAE6D8',
    overflow: 'hidden',
  },
  river: {
    position: 'absolute',
    width: '140%',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCD8C8',
  },
  road: {
    position: 'absolute',
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F7F4EC',
  },
  roadVertical: {
    position: 'absolute',
    width: 5,
    height: '115%',
    borderRadius: 3,
    backgroundColor: '#F7F4EC',
  },
  park: {
    position: 'absolute',
    borderRadius: 14,
    backgroundColor: '#CBD6BE',
    opacity: 0.7,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -19,
    marginTop: -34,
  },
  markerLabel: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    ...shadow.card,
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain,
  },
  sheet: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadow.card,
  },
  sheetImageWrap: {
    height: 120,
    backgroundColor: colors.sageSoft,
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
    color: colors.textMain,
  },
  sheetAddress: {
    fontSize: 13,
    color: colors.textSub,
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
    color: colors.textMain,
  },
  detailBtn: {
    backgroundColor: colors.sage,
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
