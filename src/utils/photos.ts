import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// 이미지 픽커가 주는 URI는 임시 캐시 경로라서 OS가 지우면 사진이 깨진다.
// 앱 문서 폴더로 복사해 영구 URI를 돌려준다. (웹은 미지원 — 원본 유지)
export async function persistPhoto(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  try {
    const dir = `${FileSystem.documentDirectory}review-photos/`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const dest = `${dir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    // 복사 실패 시 원본 URI라도 사용
    return uri;
  }
}
