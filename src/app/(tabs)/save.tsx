import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotCard } from '@/components/SpotCard';
import { SpotImage } from '@/components/SpotImage';
import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { SPOTS, getSpot } from '@/data/spots';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import type { Spot } from '@/types';

type Segment = 'bookmarks' | 'lists';

// SOOM_SAVE_001(북마크 목록) + SOOM_SAVE_002(힐링 리스트)
export default function SaveScreen() {
  const router = useRouter();
  const toast = useToast();
  const { bookmarks, lists, createList } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [segment, setSegment] = useState<Segment>('bookmarks');
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const savedSpots = bookmarks
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is Spot => s !== undefined);

  const submitNewList = () => {
    const name = newListName.trim();
    if (name.length < 1) return;
    createList(name);
    setNewListName('');
    setCreating(false);
    toast.show(`'${name}' 리스트를 만들었어요.`);
  };

  const header = (
    <View style={styles.headerWrap}>
      <Text style={styles.title}>저장</Text>
      <View style={styles.segmentWrap}>
        <Pressable
          style={[styles.segment, segment === 'bookmarks' && styles.segmentActive]}
          onPress={() => setSegment('bookmarks')}
          accessibilityRole="button">
          <Text style={[styles.segmentText, segment === 'bookmarks' && styles.segmentTextActive]}>
            북마크 {savedSpots.length}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segment, segment === 'lists' && styles.segmentActive]}
          onPress={() => setSegment('lists')}
          accessibilityRole="button">
          <Text style={[styles.segmentText, segment === 'lists' && styles.segmentTextActive]}>
            힐링 리스트 {lists.length}
          </Text>
        </Pressable>
      </View>

      {segment === 'lists' &&
        (creating ? (
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              placeholder="리스트 이름 (예: 퇴근 후 산책 코스)"
              placeholderTextColor={c.textSub}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              onSubmitEditing={submitNewList}
              returnKeyType="done"
            />
            <Pressable style={styles.createConfirm} onPress={submitNewList} accessibilityLabel="리스트 만들기">
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={styles.createCancel}
              onPress={() => {
                setCreating(false);
                setNewListName('');
              }}
              accessibilityLabel="취소">
              <Ionicons name="close" size={20} color={c.textSub} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.newListBtn} onPress={() => setCreating(true)}>
            <Ionicons name="add" size={20} color={c.sage} />
            <Text style={styles.newListText}>새 힐링 리스트 만들기</Text>
          </Pressable>
        ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {segment === 'bookmarks' ? (
        <FlatList
          data={savedSpots}
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
              <Ionicons name="bookmark-outline" size={40} color={c.sageLight} />
              <Text style={styles.emptyTitle}>아직 저장한 스팟이 없어요</Text>
              <Text style={styles.emptyText}>
                마음에 드는 힐링 스팟의 북마크를 눌러{'\n'}나만의 쉼 목록을 만들어 보세요.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          renderItem={({ item: list }) => {
            const cover = list.spotIds[0] ? getSpot(list.spotIds[0])?.image : undefined;
            return (
              <Pressable
                style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}
                onPress={() => router.push(`/list/${list.id}`)}>
                <SpotImage uri={cover} style={styles.listCover} fallbackIconSize={22} />
                <View style={styles.listBody}>
                  <Text style={styles.listName} numberOfLines={1}>
                    {list.name}
                  </Text>
                  <Text style={styles.listMeta}>스팟 {list.spotIds.length}곳</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={c.textSub} />
              </Pressable>
            );
          }}
          ListEmptyComponent={
            !creating ? (
              <View style={styles.empty}>
                <Ionicons name="trail-sign-outline" size={40} color={c.sageLight} />
                <Text style={styles.emptyTitle}>나만의 힐링 코스를 만들어 보세요</Text>
                <Text style={styles.emptyText}>
                  "퇴근 후 산책 코스"처럼 테마별로{'\n'}스팟을 묶어 관리할 수 있어요.
                </Text>
              </View>
            ) : null
          }
        />
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
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    headerWrap: {
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: c.textMain,
    },
    segmentWrap: {
      flexDirection: 'row',
      backgroundColor: c.cardBg,
      borderRadius: radius.input,
      padding: 4,
      ...shadow.card,
    },
    segment: {
      flex: 1,
      height: 42,
      borderRadius: radius.input - 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentActive: {
      backgroundColor: c.sage,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textSub,
    },
    segmentTextActive: {
      color: '#FFFFFF',
    },
    cardWrap: {
      marginBottom: spacing.md,
    },
    pressed: {
      opacity: 0.85,
    },
    newListBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: radius.card,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.sageLight,
      paddingVertical: 16,
    },
    newListText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.sage,
    },
    createRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    createInput: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: radius.input,
      paddingHorizontal: 16,
      height: 48,
      fontSize: 14,
      color: c.textMain,
    },
    createConfirm: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.sage,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createCancel: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: 12,
      marginBottom: spacing.md,
      ...shadow.card,
    },
    listCover: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: c.sageSoft,
    },
    listBody: {
      flex: 1,
      gap: 3,
    },
    listName: {
      fontSize: 16,
      fontWeight: '700',
      color: c.textMain,
    },
    listMeta: {
      fontSize: 13,
      color: c.textSub,
    },
    empty: {
      alignItems: 'center',
      gap: 10,
      paddingVertical: 60,
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
