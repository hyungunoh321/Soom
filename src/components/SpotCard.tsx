import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CongestionBadge } from '@/components/CongestionBadge';
import { SpotImage } from '@/components/SpotImage';
import { RatingScore } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { useToast } from '@/components/Toast';
import { radius, shadow, type ThemeColors } from '@/constants/theme';
import { resolveCongestion } from '@/data/spots';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import type { Spot } from '@/types';

interface SpotCardProps {
  spot: Spot;
  onPress?: () => void;
}

// 홈/저장 목록에서 쓰는 스팟 카드 (시안: 이미지 + 혼잡도 배지 + 북마크 + 이름/거리/별점/태그)
export function SpotCard({ spot, onPress }: SpotCardProps) {
  const { isBookmarked, toggleBookmark, congestionReports } = useApp();
  const toast = useToast();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const bookmarked = isBookmarked(spot.id);

  return (
    // 웹에서 button 중첩(카드 > 북마크)을 피하기 위해 카드에는 role을 주지 않는다
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <SpotImage uri={spot.image} style={styles.image} fallbackIconSize={32} />
        <View style={styles.badgeWrap}>
          <CongestionBadge level={resolveCongestion(spot, congestionReports[spot.id])} />
        </View>
        <Pressable
          style={styles.bookmarkBtn}
          onPress={(e) => {
            e.stopPropagation();
            toast.show(bookmarked ? '저장 목록에서 뺐어요.' : '저장 목록에 담았어요.');
            toggleBookmark(spot.id);
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? '북마크 해제' : '북마크 저장'}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {spot.name}
          </Text>
          <RatingScore rating={spot.rating} />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="navigate-outline" size={13} color={c.textSub} />
          <Text style={styles.meta}>
            {spot.walkTime} · {spot.distance}
          </Text>
        </View>
        <View style={styles.tagRow}>
          {spot.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} label={tag} small />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      overflow: 'hidden',
      ...shadow.card,
    },
    imageWrap: {
      height: 190,
      backgroundColor: c.sageSoft,
    },
    image: {
      flex: 1,
    },
    badgeWrap: {
      position: 'absolute',
      top: 12,
      right: 12,
    },
    bookmarkBtn: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      padding: 16,
      gap: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    name: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: c.textMain,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    meta: {
      fontSize: 13,
      color: c.textSub,
    },
    tagRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 2,
    },
  });
