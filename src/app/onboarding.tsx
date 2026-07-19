import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/app-context';

const VALUES = [
  {
    icon: 'leaf-outline',
    title: '나만의 조용한 쉼',
    desc: '광고 없는, 실제 경험 기반의 감성 휴식 스팟을 발견하세요.',
  },
  {
    icon: 'map-outline',
    title: '지도로 한눈에',
    desc: '내 주변의 숨은 힐링 장소를 지도에서 바로 찾아보세요.',
  },
  {
    icon: 'people-outline',
    title: '함께 나누는 쉼표',
    desc: '방문 후기와 혼잡도 정보로 서로의 힐링을 나눠요.',
  },
] as const;

// SOOM_ONB_001 — 숨표 서비스 핵심 가치 소개 (최초 1회)
export default function OnboardingScreen() {
  const router = useRouter();
  const { hydrated, onboarded, completeOnboarding } = useApp();

  if (!hydrated) return null;
  if (onboarded) return <Redirect href="/auth/login" />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Ionicons name="leaf" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>숨표</Text>
        <Text style={styles.tagline}>바쁜 일상 속,{'\n'}나만의 조용한 쉼을 발견하세요</Text>
      </View>

      <View style={styles.values}>
        {VALUES.map((v) => (
          <View key={v.title} style={styles.valueRow}>
            <View style={styles.valueIcon}>
              <Ionicons name={v.icon} size={22} color={colors.sage} />
            </View>
            <View style={styles.valueTextWrap}>
              <Text style={styles.valueTitle}>{v.title}</Text>
              <Text style={styles.valueDesc}>{v.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        style={styles.startBtn}
        onPress={() => {
          completeOnboarding();
          router.replace('/auth/login');
        }}>
        <Text style={styles.startText}>숨표 시작하기</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.beigeBg,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    marginTop: 60,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textMain,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSub,
    textAlign: 'center',
  },
  values: {
    gap: spacing.md,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cardBg,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.sageSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTextWrap: {
    flex: 1,
    gap: 3,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
  },
  valueDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
  },
  startBtn: {
    backgroundColor: colors.sage,
    borderRadius: radius.input,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
