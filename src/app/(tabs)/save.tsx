import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotCard } from '@/components/SpotCard';
import { useToast } from '@/components/Toast';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { SPOTS, getSpot } from '@/data/spots';
import { useApp } from '@/store/app-context';

type Segment = 'bookmarks' | 'lists';

// SOOM_SAVE_001(북마크 목록) + SOOM_SAVE_002(힐링 리스트)
export default function SaveScreen() {
  const router = useRouter();
  const toast = useToast();
  const { bookmarks, lists, createList } = useApp();
  const [segment, setSegment] = useState<Segment>('bookmarks');
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const savedSpots = bookmarks
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is (typeof SPOTS)[number] => s !== undefined);

  const submitNewList = () => {
    const name = newListName.trim();
    if (name.length < 1) return;
    createList(name);
    setNewListName('');
    setCreating(false);
    toast.show(`'${name}' 리스트를 만들었어요.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>저장</Text>

        {/* 세그먼트 */}
        <View style={styles.segmentWrap}>
          <Pressable
            style={[styles.segment, segment === 'bookmarks' && styles.segmentActive]}
            onPress={() => setSegment('bookmarks')}>
            <Text
              style={[styles.segmentText, segment === 'bookmarks' && styles.segmentTextActive]}>
              북마크 {savedSpots.length}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, segment === 'lists' && styles.segmentActive]}
            onPress={() => setSegment('lists')}>
            <Text style={[styles.segmentText, segment === 'lists' && styles.segmentTextActive]}>
              힐링 리스트 {lists.length}
            </Text>
          </Pressable>
        </View>

        {segment === 'bookmarks' && (
          <View style={styles.cardList}>
            {savedSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} onPress={() => router.push(`/spot/${spot.id}`)} />
            ))}
            {savedSpots.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="bookmark-outline" size={40} color={colors.sageLight} />
                <Text style={styles.emptyTitle}>아직 저장한 스팟이 없어요</Text>
                <Text style={styles.emptyText}>
                  마음에 드는 힐링 스팟의 북마크를 눌러{'\n'}나만의 쉼 목록을 만들어 보세요.
                </Text>
              </View>
            )}
          </View>
        )}

        {segment === 'lists' && (
          <View style={styles.cardList}>
            {/* 새 리스트 만들기 */}
            {creating ? (
              <View style={styles.createRow}>
                <TextInput
                  style={styles.createInput}
                  placeholder="리스트 이름 (예: 퇴근 후 산책 코스)"
                  placeholderTextColor={colors.textSub}
                  value={newListName}
                  onChangeText={setNewListName}
                  autoFocus
                  onSubmitEditing={submitNewList}
                  returnKeyType="done"
                />
                <Pressable style={styles.createConfirm} onPress={submitNewList}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={styles.createCancel}
                  onPress={() => {
                    setCreating(false);
                    setNewListName('');
                  }}>
                  <Ionicons name="close" size={20} color={colors.textSub} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.newListBtn} onPress={() => setCreating(true)}>
                <Ionicons name="add" size={20} color={colors.sage} />
                <Text style={styles.newListText}>새 힐링 리스트 만들기</Text>
              </Pressable>
            )}

            {lists.map((list) => {
              const cover = list.spotIds[0] ? getSpot(list.spotIds[0])?.image : undefined;
              return (
                <Pressable
                  key={list.id}
                  style={styles.listCard}
                  onPress={() => router.push(`/list/${list.id}`)}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={styles.listCover} contentFit="cover" />
                  ) : (
                    <View style={[styles.listCover, styles.listCoverEmpty]}>
                      <Ionicons name="leaf-outline" size={22} color={colors.sageLight} />
                    </View>
                  )}
                  <View style={styles.listBody}>
                    <Text style={styles.listName} numberOfLines={1}>
                      {list.name}
                    </Text>
                    <Text style={styles.listMeta}>스팟 {list.spotIds.length}곳</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
                </Pressable>
              );
            })}

            {lists.length === 0 && !creating && (
              <View style={styles.empty}>
                <Ionicons name="trail-sign-outline" size={40} color={colors.sageLight} />
                <Text style={styles.emptyTitle}>나만의 힐링 코스를 만들어 보세요</Text>
                <Text style={styles.emptyText}>
                  "퇴근 후 산책 코스"처럼 테마별로{'\n'}스팟을 묶어 관리할 수 있어요.
                </Text>
              </View>
            )}
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
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
    backgroundColor: colors.sage,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSub,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  cardList: {
    gap: spacing.md,
  },
  newListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.sageLight,
    paddingVertical: 16,
  },
  newListText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.sage,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createInput: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.input,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: colors.textMain,
  },
  createConfirm: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCancel: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: 12,
    ...shadow.card,
  },
  listCover: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.sageSoft,
  },
  listCoverEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: {
    flex: 1,
    gap: 3,
  },
  listName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  listMeta: {
    fontSize: 13,
    color: colors.textSub,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSub,
    textAlign: 'center',
  },
});
