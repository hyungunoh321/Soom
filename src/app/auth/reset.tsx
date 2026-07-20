import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';

// SOOM_AUTH_003 — 이메일로 비밀번호 재설정 링크 발송 (Supabase Auth)
export default function ResetPasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const { resetPassword } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const canSubmit = /\S+@\S+\.\S+/.test(email) && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    const error = await resetPassword(email);
    setBusy(false);
    if (error) {
      toast.show(error);
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={c.textMain} />
        </Pressable>
        <Text style={styles.headerTitle}>비밀번호 찾기</Text>
        <View style={{ width: 24 }} />
      </View>

      {sent ? (
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Ionicons name="mail-open-outline" size={34} color={c.sage} />
          </View>
          <Text style={styles.doneTitle}>메일을 보냈어요</Text>
          <Text style={styles.doneDesc}>
            {email} 으로{'\n'}비밀번호 재설정 링크를 보냈어요.{'\n'}메일함을 확인해 주세요.
          </Text>
          <Pressable style={styles.submitBtn} onPress={() => router.back()}>
            <Text style={styles.submitText}>로그인으로 돌아가기</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>가입한 이메일을{'\n'}알려주세요</Text>
          <Text style={styles.subtitle}>비밀번호를 재설정할 수 있는 링크를 보내드릴게요.</Text>

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={c.textSub} />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={c.textSub}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={submit}>
            <Text style={styles.submitText}>{busy ? '보내는 중...' : '재설정 링크 보내기'}</Text>
          </Pressable>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textMain,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      lineHeight: 36,
      color: c.textMain,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSub,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: radius.input,
      paddingHorizontal: 18,
      height: 54,
      marginTop: spacing.sm,
      ...shadow.card,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: c.textMain,
      paddingVertical: 0,
    },
    submitBtn: {
      backgroundColor: c.sage,
      borderRadius: radius.input,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    doneWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      gap: 12,
      marginTop: -60,
    },
    doneIcon: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: c.sageSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    doneTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textMain,
    },
    doneDesc: {
      fontSize: 14,
      lineHeight: 22,
      color: c.textSub,
      textAlign: 'center',
    },
  });
