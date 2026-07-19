import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { StarRating } from '@/components/StarRating';
import { TagChip } from '@/components/TagChip';
import { useToast } from '@/components/Toast';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { MOOD_TAGS, getSpot } from '@/data/spots';
import { useThemeColors, useThemedStyles } from '@/hooks/use-theme';
import { useApp } from '@/store/app-context';
import { persistPhoto } from '@/utils/photos';

const MAX_PHOTOS = 5;

// SOOM_SPOT_003 — 사진 업로드 및 후기 텍스트 작성 (reviewId가 있으면 수정 모드)
export default function ReviewWriteScreen() {
  const { spotId, reviewId } = useLocalSearchParams<{ spotId: string; reviewId?: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user, myReviews, addReview, updateReview } = useApp();
  const c = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const spot = getSpot(spotId);

  const editing = (myReviews[spotId] ?? []).find((r) => r.id === reviewId);

  const [photos, setPhotos] = useState<string[]>(editing?.photos ?? []);
  const [rating, setRating] = useState(editing?.rating ?? 0);
  const [selectedTags, setSelectedTags] = useState<string[]>(editing?.tags ?? []);
  const [text, setText] = useState(editing?.text ?? '');

  if (!spot) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>장소를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const addPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      toast.show(`사진은 최대 ${MAX_PHOTOS}장까지 올릴 수 있어요.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.show('사진 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      // 임시 캐시 URI를 문서 폴더로 복사해 후기 저장 후에도 사진이 유지되게 한다
      const uris = await Promise.all(result.assets.map((a) => persistPhoto(a.uri)));
      setPhotos((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos(photos.filter((p) => p !== uri));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const canSubmit = rating > 0 && text.trim().length > 0;

  // 딥링크로 바로 들어온 경우 back 히스토리가 없을 수 있다
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/spot/${spotId}`);
  };

  const submit = () => {
    if (!canSubmit) {
      toast.show('별점과 후기 내용을 입력해 주세요.');
      return;
    }
    if (editing) {
      updateReview(spot.id, editing.id, {
        rating,
        text: text.trim(),
        photos,
        tags: selectedTags,
      });
      toast.show('후기를 수정했어요.');
    } else {
      const now = new Date();
      addReview(spot.id, {
        id: `my-${Date.now()}`,
        author: user?.name ?? '익명',
        avatar: user?.avatar,
        date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`,
        rating,
        text: text.trim(),
        photos,
        tags: selectedTags,
      });
      toast.show('후기가 등록되었어요.');
    }
    goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={8} accessibilityRole="button">
            <Ionicons name="chevron-back" size={24} color={c.textMain} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {spot.name}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* 공간 기록하기 — 사진 */}
          <Text style={styles.sectionTitle}>공간 기록하기</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photoRow}>
              <Pressable style={styles.photoAdd} onPress={addPhoto} accessibilityRole="button">
                <Ionicons name="camera" size={28} color={c.sage} />
                <Text style={styles.photoCount}>
                  {photos.length}/{MAX_PHOTOS}
                </Text>
              </Pressable>
              {photos.map((uri) => (
                <View key={uri} style={styles.photoWrap}>
                  <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                  <Pressable
                    style={styles.photoRemove}
                    onPress={() => removePhoto(uri)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="사진 삭제">
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* 별점 */}
          <Text style={styles.sectionTitle}>얼마나 편안했나요?</Text>
          <StarRating rating={rating} size={40} color={c.sage} onChange={setRating} />

          {/* 분위기 태그 */}
          <Text style={styles.sectionTitle}>이 공간의 분위기</Text>
          <View style={styles.tagWrap}>
            {MOOD_TAGS.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>

          {/* 후기 텍스트 */}
          <Text style={styles.sectionTitle}>후기 남기기</Text>
          <TextInput
            style={styles.textArea}
            placeholder="이 공간에서 어떤 휴식을 느끼셨나요?"
            placeholderTextColor={c.textSub}
            multiline
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
          />
        </ScrollView>

        {/* 등록하기 */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={submit}
            accessibilityRole="button">
            <Text style={styles.submitText}>{editing ? '수정하기' : '등록하기'}</Text>
          </Pressable>
        </View>
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
    notFound: {
      padding: spacing.lg,
      fontSize: 15,
      color: c.textSub,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
      color: c.textMain,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textMain,
      marginTop: spacing.sm,
    },
    photoRow: {
      flexDirection: 'row',
      gap: 12,
    },
    photoAdd: {
      width: 96,
      height: 96,
      borderRadius: radius.card,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.sageLight,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    photoCount: {
      fontSize: 13,
      fontWeight: '700',
      color: c.sage,
    },
    photoWrap: {
      width: 96,
      height: 96,
    },
    photo: {
      flex: 1,
      borderRadius: radius.card,
      backgroundColor: c.sageSoft,
    },
    photoRemove: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    textArea: {
      backgroundColor: c.cardBg,
      borderRadius: radius.card,
      padding: spacing.md,
      minHeight: 180,
      fontSize: 14,
      lineHeight: 22,
      color: c.textMain,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    submitBtn: {
      backgroundColor: c.sage,
      borderRadius: radius.input,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
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
