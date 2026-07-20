import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// anon key는 클라이언트 공개용 키다 — 실제 보안은 RLS가 담당한다.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://wyyrvufvkxjnaxzwfoav.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eXJ2dWZ2a3hqbmF4endmb2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0Nzg4NTEsImV4cCI6MjEwMDA1NDg1MX0.Nockwki9jrVWyosczSO5o3lj6lurqikNuwZbQCQxKkU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // 네이티브는 AsyncStorage에 세션 저장, 웹은 기본(localStorage) 사용
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
