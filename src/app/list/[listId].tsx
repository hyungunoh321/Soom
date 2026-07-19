import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SpotCard } from '@/components/SpotCard';
import { useToast } from '@/components/Toast';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { SPOTS, getSpot } from '@/data/spots';
import { useApp } from '@/store/app-context';

// SOOM_SAVE_002 — 힐링 리스트 상세: 스팟 추가/제거, 리스트 삭제
export default function ListDetailScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const toast = useToast();
  const { lists, toggleSpotInList, deleteList } = useApp();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const list = lists.find((l) => l.id === listId);
  if (!list) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>리스트를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const inListSpots = list.spotIds
    .map((id) => getSpot(id))
    .filter((s): s is NonNullable<ReturnType<typeof getSpot>> => s !== undefined);
  const candidates = SPOTS.filter((s) => !list.spotIds.includes(s.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.textMain} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {list.name}
        </Text>
        <Pressable onPress={() => setConfirmDelete(true)} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={colors.logout} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>담긴 스팟 {inListSpots.length}곳</Text>

        <View style={styles.cardList}>
          {inListSpots.map((spot) => (
            <View key={spot.id}>
              <SpotCard spot={spot} onPress={() => router.push(`/spot/${spot.id}`)} />
              <Pressable
                style={styles.removeBtn}
                onPress={() => {
                  toggleSpotInList(list.id, spot.id);
                  toast.show('리스트에서 뺐어요.');
                }}>
                <Ionicons name="remove-circle-outline" size={16} color={colors.logout} />
                <Text style={styles.removeText}>리스트에서 빼기</Text>
              </Pressable>
            </View>
          ))}
          {inListSpots.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={32} color={colors.sageLight} />
              <Text style={styles.emptyText}>아직 담긴 스팟이 없어요. 아래에서 추가해 보세요.</Text>
            </View>
          )}
        </View>

        {/* 스팟 추가 */}
        <Pressable style={styles.addToggle} onPress={() => setEditing(!editing)}>
          <Ionicons name={editing ? 'chevron-up' : 'add'} size={18} color={colors.sage} />
          <Text style={styles.addToggleText}>{editing ? '추가 닫기' : '스팟 추가하기'}</Text>
        </Pressable>

        {editing && (
          <View style={styles.candidateList}>
            {candidates.map((spot) => (
              <Pressable
                key={spot.id}
                style={styles.candidateRow}
                onPress={() => {
                  toggleSpotInList(list.id, spot.id);
                  toast.show(`'${spot.name}'을(를) 담았어요.`);
                }}>
                <Image source={{ uri: spot.image }} style={styles.candidateImage} contentFit="cover" />
                <View style={styles.candidateBody}>
                  <Text style={styles.candidateName} numberOfLines={1}>
                    {spot.name}
                  </Text>
                  <Text style={styles.candidateMeta}>{spot.address}</Text>
                </View>
                <Ionicons name="add-circle" size={24} color={colors.sage} />
              </Pressable>
            ))}
            {candidates.length === 0 && (
              <Text style={styles.emptyText}>모든 스팟이 이미 리스트에 있어요.</Text>
            )}
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmDelete}
        title="리스트 삭제"
        message={`'${list.name}' 리스트를 삭제할까요? 담긴 스팟 정보는 사라지지 않아요.`}
        confirmLabel="삭제"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteList(list.id);
          toast.show('리스트를 삭제했어요.');
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.beigeBg,
  },
  notFound: {
    padding: spacing.lg,
    fontSize: 15,
    color: colors.textSub,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  meta: {
    fontSize: 13,
    color: colors.textSub,
  },
  cardList: {
    gap: spacing.md,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.logout,
  },
  addToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.sageLight,
    paddingVertical: 14,
  },
  addToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.sage,
  },
  candidateList: {
    gap: 10,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: 10,
    ...shadow.card,
  },
  candidateImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.sageSoft,
  },
  candidateBody: {
    flex: 1,
    gap: 2,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  candidateMeta: {
    fontSize: 12,
    color: colors.textSub,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSub,
    textAlign: 'center',
  },
});
