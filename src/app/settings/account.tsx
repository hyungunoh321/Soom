import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SettingsHeader } from '@/components/SettingsHeader';
import { useToast } from '@/components/Toast';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';

// SOOM_SET_002 — 계정 관리: 프로필 수정 / 로그아웃 / 회원탈퇴
export default function AccountScreen() {
  const router = useRouter();
  const toast = useToast();
  const { user, updateProfile, logout, deleteAccount } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = name.trim() !== user?.name || bio.trim() !== user?.bio;
  const canSave = dirty && name.trim().length >= 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SettingsHeader title="계정 관리" />
      <View style={styles.content}>
        <Text style={styles.label}>이메일</Text>
        <View style={[styles.inputWrap, styles.inputDisabled]}>
          <Ionicons name="mail-outline" size={18} color={c.textSub} />
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <Text style={styles.label}>닉네임</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={18} color={c.textSub} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="닉네임"
            placeholderTextColor={c.textSub}
          />
        </View>

        <Text style={styles.label}>소개</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="leaf-outline" size={18} color={c.textSub} />
          <TextInput
            style={styles.input}
            value={bio}
            onChangeText={setBio}
            placeholder="한 줄 소개"
            placeholderTextColor={c.textSub}
          />
        </View>

        <Pressable
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={() => {
            if (!canSave) return;
            updateProfile({ name: name.trim(), bio: bio.trim() });
            toast.show('프로필을 저장했어요.');
          }}>
          <Text style={styles.saveText}>프로필 저장</Text>
        </Pressable>

        <View style={styles.dangerZone}>
          <Pressable style={styles.dangerRow} onPress={() => setConfirmLogout(true)}>
            <Ionicons name="log-out-outline" size={18} color={c.logout} />
            <Text style={styles.dangerText}>로그아웃</Text>
          </Pressable>
          <Pressable style={styles.dangerRow} onPress={() => setConfirmDelete(true)}>
            <Ionicons name="trash-outline" size={18} color={c.logout} />
            <Text style={styles.dangerText}>회원탈퇴</Text>
          </Pressable>
        </View>
      </View>

      <ConfirmDialog
        visible={confirmLogout}
        title="로그아웃"
        message="정말 로그아웃할까요? 저장한 스팟과 후기는 기기에 안전하게 남아 있어요."
        confirmLabel="로그아웃"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
          router.replace('/auth/login');
        }}
      />
      <ConfirmDialog
        visible={confirmDelete}
        title="회원탈퇴"
        message="탈퇴하면 저장한 스팟, 힐링 리스트, 작성한 후기가 모두 삭제되며 되돌릴 수 없어요."
        confirmLabel="탈퇴하기"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteAccount();
          router.replace('/auth/login');
        }}
      />
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
      paddingTop: spacing.sm,
      gap: 10,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSub,
      marginTop: 6,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: radius.input,
      paddingHorizontal: 16,
      height: 50,
    },
    inputDisabled: {
      opacity: 0.7,
    },
    emailText: {
      fontSize: 14,
      color: c.textSub,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: c.textMain,
      paddingVertical: 0,
    },
    saveBtn: {
      backgroundColor: c.sage,
      borderRadius: radius.input,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },
    saveBtnDisabled: {
      opacity: 0.5,
    },
    saveText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    dangerZone: {
      marginTop: spacing.lg,
      gap: 10,
    },
    dangerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
    },
    dangerText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.logout,
    },
  });
