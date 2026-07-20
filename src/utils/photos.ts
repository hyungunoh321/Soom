import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

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

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// atob가 없는 환경(Hermes 구버전)도 커버하는 순수 base64 디코더
function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = Math.floor((clean.length * 3) / 4);
  const bytes = new Uint8Array(len);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const a = BASE64_CHARS.indexOf(clean[i]);
    const b = BASE64_CHARS.indexOf(clean[i + 1]);
    const c = BASE64_CHARS.indexOf(clean[i + 2]);
    const d = BASE64_CHARS.indexOf(clean[i + 3]);
    bytes[p++] = (a << 2) | (b >> 4);
    if (c >= 0) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (d >= 0) bytes[p++] = ((c & 3) << 6) | d;
  }
  return bytes.subarray(0, p);
}

// 사진을 Supabase Storage에 올리고 공개 URL을 돌려준다.
// 업로드 실패(오프라인 등) 시 로컬 보존 URI로 폴백 — 후기는 항상 저장된다.
export async function uploadPhoto(
  uri: string,
  userId: string,
  folder: 'reviews' | 'avatars' = 'reviews',
): Promise<string> {
  if (/^https?:/.test(uri)) return uri; // 이미 원격 URL
  try {
    const rawExt = uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg';
    const ext = ['png', 'webp', 'gif', 'jpg', 'jpeg'].includes(rawExt) ? rawExt : 'jpg';
    const contentType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    const path = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    let body: Blob | ArrayBuffer;
    if (Platform.OS === 'web') {
      body = await (await fetch(uri)).blob();
    } else {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToBytes(base64);
      body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    }

    const { error } = await supabase.storage.from('photos').upload(path, body, { contentType });
    if (error) throw error;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  } catch {
    return persistPhoto(uri);
  }
}
