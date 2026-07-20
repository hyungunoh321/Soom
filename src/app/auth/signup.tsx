import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/Toast';
import { radius, shadow, spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';

// SOOM_AUTH_002 — 회원가입 (Supabase Auth)
export default function SignupScreen() {
  const router = useRouter();
  const toast = useToast();
  const { signUp } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit =
    name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && password.length >= 6 && !busy;

  const submit = async () => {
    if (!canSubmit) {
      toast.show('닉네임(2자 이상)·이메일·비밀번호(6자 이상)를 확인해 주세요.');
      return;
    }
    setBusy(true);
    const { error, needsEmailConfirm } = await signUp(name.trim(), email, password);
    setBusy(false);
    if (error) {
      toast.show(error);
      return;
    }
    if (needsEmailConfirm) {
      toast.show('인증 메일을 보냈어요. 메일 확인 후 로그인해 주세요.');
      router.replace('/auth/login');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={c.textMain} />
          </Pressable>
          <Text style={styles.headerTitle}>회원가입</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>숨표에 오신 것을{'\n'}환영해요</Text>
          <Text style={styles.subtitle}>쉼이 필요한 순간, 언제든 꺼내 쓸 수 있는 계정을 만들어요.</Text>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={c.textSub} />
              <TextInput
                style={styles.input}
                placeholder="닉네임"
                placeholderTextColor={c.textSub}
                value={name}
                onChangeText={setName}
              />
            </View>
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
              />
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={c.textSub} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 (6자 이상)"
                placeholderTextColor={c.textSub}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={submit}>
              <Text style={styles.submitText}>{busy ? '가입 중...' : '가입하고 시작하기'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.beigeBg,
    },
    flex: {
      flex: 1,
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
      lineHeight: 21,
      color: c.textSub,
    },
    form: {
      gap: 12,
      marginTop: spacing.md,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: radius.input,
      paddingHorizontal: 18,
      height: 54,
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
      marginTop: 8,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
