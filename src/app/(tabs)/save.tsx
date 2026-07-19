import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpotCard } from '@/components/SpotCard';
import { colors, spacing } from '@/constants/theme';
import { SPOTS } from '@/data/spots';
import { useApp } from '@/store/app-context';

// SOOM_SAVE_001 — 저장한 힐링 스팟 목록
export default function SaveScreen() {
  const router = useRouter();
  const { bookmarks } = useApp();

  const savedSpots = bookmarks
    .map((id) => SPOTS.find((s) => s.id === id))
    .filter((s): s is (typeof SPOTS)[number] => s !== undefined);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>저장한 스팟</Text>
        <Text style={styles.subtitle}>마음에 담아둔 나만의 쉼 {savedSpots.length}곳</Text>

        <View style={styles.cardList}>
          {savedSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} onPress={() => router.push(`/spot/${spot.id}`)} />
          ))}
        </View>

        {savedSpots.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={40} color={colors.sageLight} />
            <Text style={styles.emptyTitle}>아직 저장한 스팟이 없어요</Text>
            <Text style={styles.emptyText}>
              마음에 드는 힐링 스팟의 북마크를 눌러{'\n'}나만의 쉼 목록을 만들어 보세요.
            </Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  cardList: {
    gap: spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 80,
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
