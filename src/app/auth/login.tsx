import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
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

// SOOM_AUTH_001 — 이메일 로그인 (데모: 서버 없이 형식 검증만)
export default function LoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const { hydrated, user, login } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!hydrated) return null;
  if (user) return <Redirect href="/(tabs)" />;

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length >= 4;

  const submit = () => {
    if (!canSubmit) {
      toast.show('이메일 형식과 비밀번호(4자 이상)를 확인해 주세요.');
      return;
    }
    login({
      name: email.split('@')[0],
      email,
      bio: '조용한 산책을 좋아해요',
      avatar: 'https://i.pravatar.cc/200?img=44',
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>다시 만나서 반가워요</Text>
            <Text style={styles.subtitle}>오늘도 나만의 쉼을 찾아볼까요?</Text>
          </View>

          <View style={styles.form}>
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
                autoComplete="email"
              />
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={c.textSub} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor={c.textSub}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={submit}>
              <Text style={styles.submitText}>로그인</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/auth/reset')}>
              <Text style={styles.forgot}>비밀번호를 잊으셨나요?</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>아직 계정이 없으신가요?</Text>
            <Pressable onPress={() => router.push('/auth/signup')}>
              <Text style={styles.footerLink}>회원가입</Text>
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
    content: {
      flexGrow: 1,
      padding: spacing.lg,
      justifyContent: 'center',
      gap: spacing.xl,
    },
    hero: {
      alignItems: 'center',
      gap: 8,
    },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.sage,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: c.textMain,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSub,
    },
    form: {
      gap: 12,
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
    forgot: {
      textAlign: 'center',
      fontSize: 13,
      color: c.textSub,
      marginTop: 6,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    footerText: {
      fontSize: 14,
      color: c.textSub,
    },
    footerLink: {
      fontSize: 14,
      fontWeight: '800',
      color: c.sage,
    },
  });
