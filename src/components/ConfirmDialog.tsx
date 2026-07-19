import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/use-theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// 로그아웃/탈퇴 등 확인이 필요한 액션용 다이얼로그 (Alert 대체)
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = '확인',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <Pressable style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
              <Text style={styles.btnCancelText}>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, danger ? styles.btnDanger : styles.btnConfirm]}
              onPress={onConfirm}>
              <Text style={styles.btnConfirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.lg,
      gap: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textMain,
    },
    message: {
      fontSize: 14,
      lineHeight: 21,
      color: c.textSub,
    },
    buttons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },
    btn: {
      flex: 1,
      height: 46,
      borderRadius: radius.button,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnCancel: {
      backgroundColor: c.beigeBg,
    },
    btnCancelText: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textMain,
    },
    btnConfirm: {
      backgroundColor: c.sage,
    },
    btnDanger: {
      backgroundColor: c.logout,
    },
    btnConfirmText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
