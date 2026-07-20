import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  authErrorMessage,
  deleteListRow,
  deleteMyData,
  deleteReviewRow,
  ensureProfile,
  fetchCongestion,
  fetchMyData,
  insertCongestionReport,
  insertList,
  insertReview,
  insertReviewReport,
  isRemoteReviewId,
  reviewKey,
  setBookmark,
  setListSpot,
  setReviewLike,
  updateProfileRow,
  updateReviewRow,
  uuid,
} from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type {
  CongestionLevel,
  CongestionReport,
  HealingList,
  Review,
  ThemeSetting,
} from '@/types';

export type { HealingList } from '@/types';

const STORAGE_KEY = 'soom:state:v1';

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

export interface NotificationSettings {
  spotRecommend: boolean;
  comment: boolean;
  marketing: boolean;
}

// 서버 동기화 실패는 조용히 무시한다 — 로컬 우선, 다음 로그인 때 서버 상태로 복원
const sync = (p: Promise<unknown>) => {
  p.catch(() => {});
};

// AsyncStorage에 통째로 저장되는 부분 (서버 데이터의 오프라인 캐시 겸용)
interface PersistedState {
  onboarded: boolean;
  userId: string | null;
  user: UserProfile | null;
  bookmarks: string[];
  myReviews: Record<string, Review[]>; // spotId -> 내가 쓴 후기
  lists: HealingList[];
  notifications: NotificationSettings;
  searchHistory: string[];
  locationOverride: string | null; // 사용자가 직접 고른 동네 (null이면 GPS)
  reviewLikes: string[]; // 내가 '도움돼요' 누른 후기 키 (spotId:reviewId)
  reportedReviews: string[]; // 내가 신고한 후기 키 (목록에서 숨김)
  congestionReports: Record<string, CongestionReport>; // spotId -> 현재 유효 제보(서버 집계)
  theme: ThemeSetting;
}

const INITIAL: PersistedState = {
  onboarded: false,
  userId: null,
  user: null,
  bookmarks: [],
  myReviews: {},
  lists: [],
  notifications: { spotRecommend: true, comment: true, marketing: false },
  searchHistory: [],
  locationOverride: null,
  reviewLikes: [],
  reportedReviews: [],
  congestionReports: {},
  theme: 'system',
};

interface AppState extends PersistedState {
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsEmailConfirm: boolean }>;
  resetPassword: (email: string) => Promise<string | null>;
  isBookmarked: (spotId: string) => boolean;
  toggleBookmark: (spotId: string) => void;
  addReview: (spotId: string, review: Review) => void;
  updateReview: (spotId: string, reviewId: string, patch: Partial<Review>) => void;
  deleteReview: (spotId: string, reviewId: string) => void;
  isReviewLiked: (spotId: string, reviewId: string) => boolean;
  toggleReviewLike: (spotId: string, reviewId: string) => void;
  isReviewReported: (spotId: string, reviewId: string) => boolean;
  reportReview: (spotId: string, reviewId: string) => void;
  reportCongestion: (spotId: string, level: CongestionLevel) => void;
  refreshCongestion: () => Promise<void>;
  addSearchTerm: (term: string) => void;
  clearSearchHistory: () => void;
  setLocationOverride: (label: string | null) => void;
  completeOnboarding: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  logout: () => void;
  deleteAccount: () => void;
  createList: (name: string) => void;
  deleteList: (listId: string) => void;
  toggleSpotInList: (listId: string, spotId: string) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  setTheme: (theme: ThemeSetting) => void;
}

const AppContext = createContext<AppState | null>(null);

// 로그인 사용자 데이터만 초기화 (온보딩·테마·검색기록 등 로컬 설정은 유지)
const clearedUserData = (s: PersistedState): PersistedState => ({
  ...s,
  userId: null,
  user: null,
  bookmarks: [],
  myReviews: {},
  lists: [],
  reviewLikes: [],
  reportedReviews: [],
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);
  // 콜백들이 최신 상태를 의존성 없이 읽기 위한 ref
  const stateRef = useRef(state);
  stateRef.current = state;

  // 앱 시작 시 저장된 상태 복원 (서버 데이터의 오프라인 캐시)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
      } catch {
        // 손상된 저장값은 초기 상태로 시작
      } finally {
        hydratedRef.current = true;
        setHydrated(true);
      }
    })();
  }, []);

  // 상태 변경 시 저장 (복원 완료 후에만)
  useEffect(() => {
    if (!hydratedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  // 서버에서 내 데이터 + 혼잡도 집계 로드 (실패 시 캐시 유지)
  const loadServerData = useCallback(async (userId: string, email: string) => {
    try {
      let [mine, congestion] = await Promise.all([fetchMyData(userId), fetchCongestion()]);
      if (!mine.user) {
        // 트리거 적용 전 가입 계정 — 프로필 행을 만들어 주고 다시 읽는다
        await ensureProfile(userId, email.split('@')[0]);
        mine = await fetchMyData(userId);
      }
      setState((s) => ({
        ...s,
        userId,
        user: mine.user
          ? { name: mine.user.name, email, bio: mine.user.bio, avatar: mine.user.avatar }
          : s.user,
        myReviews: mine.myReviews,
        reviewLikes: mine.reviewLikes,
        reportedReviews: mine.reportedReviews,
        bookmarks: mine.bookmarks,
        lists: mine.lists,
        congestionReports: congestion,
      }));
    } catch {
      // 오프라인 등 — 캐시된 상태로 계속
    }
  }, []);

  // 세션 변화 감지: 로그인 → 서버 데이터 로드 / 로그아웃·세션 없음 → 사용자 데이터 정리
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email ?? '';
        setState((s) => ({ ...s, userId: session.user.id }));
        void loadServerData(session.user.id, email);
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        setState((s) => (s.userId !== null || s.user !== null ? clearedUserData(s) : s));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadServerData]);

  // ─── 인증 ───────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return authErrorMessage(error.message);
    if (data.user) {
      // 가드 리다이렉트가 바로 통과하도록 최소 프로필을 즉시 세팅 (서버 로드가 곧 갱신)
      setState((s) => ({
        ...s,
        userId: data.user.id,
        user: s.user ?? {
          name: email.split('@')[0],
          email,
          bio: '조용한 산책을 좋아해요',
          avatar: '',
        },
      }));
    }
    return null;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: authErrorMessage(error.message), needsEmailConfirm: false };
    if (!data.session) {
      // 이메일 확인이 켜져 있는 프로젝트 — 인증 메일 발송됨
      return { error: null, needsEmailConfirm: true };
    }
    setState((s) => ({
      ...s,
      userId: data.session!.user.id,
      user: { name, email, bio: '조용한 산책을 좋아해요', avatar: '' },
    }));
    return { error: null, needsEmailConfirm: false };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return error ? authErrorMessage(error.message) : null;
  }, []);

  const logout = useCallback(() => {
    sync(supabase.auth.signOut());
    setState(clearedUserData);
  }, []);

  // 탈퇴: 서버의 내 데이터 삭제 + 로그아웃 (로컬은 온보딩·테마만 유지)
  const deleteAccount = useCallback(() => {
    const uid = stateRef.current.userId;
    if (uid) sync(deleteMyData(uid).then(() => supabase.auth.signOut()));
    else sync(supabase.auth.signOut());
    setState((s) => ({ ...INITIAL, onboarded: true, theme: s.theme }));
  }, []);

  // ─── 북마크 ─────────────────────────────────────────

  const isBookmarked = useCallback(
    (spotId: string) => state.bookmarks.includes(spotId),
    [state.bookmarks],
  );

  const toggleBookmark = useCallback((spotId: string) => {
    const { bookmarks, userId } = stateRef.current;
    const next = !bookmarks.includes(spotId);
    setState((s) => ({
      ...s,
      bookmarks: next ? [spotId, ...s.bookmarks] : s.bookmarks.filter((id) => id !== spotId),
    }));
    if (userId) sync(setBookmark(userId, spotId, next));
  }, []);

  // ─── 후기 ───────────────────────────────────────────

  const addReview = useCallback((spotId: string, review: Review) => {
    const { userId } = stateRef.current;
    setState((s) => ({
      ...s,
      myReviews: { ...s.myReviews, [spotId]: [review, ...(s.myReviews[spotId] ?? [])] },
    }));
    if (userId) sync(insertReview(userId, spotId, review));
  }, []);

  const updateReview = useCallback(
    (spotId: string, reviewId: string, patch: Partial<Review>) => {
      setState((s) => ({
        ...s,
        myReviews: {
          ...s.myReviews,
          [spotId]: (s.myReviews[spotId] ?? []).map((r) =>
            r.id === reviewId ? { ...r, ...patch } : r,
          ),
        },
      }));
      if (isRemoteReviewId(reviewId)) sync(updateReviewRow(reviewId, patch));
    },
    [],
  );

  const deleteReview = useCallback((spotId: string, reviewId: string) => {
    setState((s) => ({
      ...s,
      myReviews: {
        ...s.myReviews,
        [spotId]: (s.myReviews[spotId] ?? []).filter((r) => r.id !== reviewId),
      },
    }));
    if (isRemoteReviewId(reviewId)) sync(deleteReviewRow(reviewId));
  }, []);

  const isReviewLiked = useCallback(
    (spotId: string, reviewId: string) => state.reviewLikes.includes(reviewKey(spotId, reviewId)),
    [state.reviewLikes],
  );

  const toggleReviewLike = useCallback((spotId: string, reviewId: string) => {
    const key = reviewKey(spotId, reviewId);
    const { reviewLikes, userId } = stateRef.current;
    const next = !reviewLikes.includes(key);
    setState((s) => ({
      ...s,
      reviewLikes: next ? [...s.reviewLikes, key] : s.reviewLikes.filter((k) => k !== key),
    }));
    if (userId && isRemoteReviewId(reviewId)) sync(setReviewLike(userId, reviewId, next));
  }, []);

  const isReviewReported = useCallback(
    (spotId: string, reviewId: string) =>
      state.reportedReviews.includes(reviewKey(spotId, reviewId)),
    [state.reportedReviews],
  );

  const reportReview = useCallback((spotId: string, reviewId: string) => {
    const key = reviewKey(spotId, reviewId);
    const { reportedReviews, userId } = stateRef.current;
    if (reportedReviews.includes(key)) return;
    setState((s) => ({ ...s, reportedReviews: [...s.reportedReviews, key] }));
    if (userId && isRemoteReviewId(reviewId)) sync(insertReviewReport(userId, reviewId));
  }, []);

  // ─── 혼잡도 제보 ────────────────────────────────────

  const reportCongestion = useCallback((spotId: string, level: CongestionLevel) => {
    const { userId } = stateRef.current;
    setState((s) => ({
      ...s,
      congestionReports: { ...s.congestionReports, [spotId]: { level, at: Date.now() } },
    }));
    if (userId) sync(insertCongestionReport(userId, spotId, level));
  }, []);

  const refreshCongestion = useCallback(async () => {
    try {
      const congestion = await fetchCongestion();
      setState((s) => ({ ...s, congestionReports: congestion }));
    } catch {
      // 오프라인 — 기존 값 유지
    }
  }, []);

  // ─── 검색/위치/온보딩/알림/테마 (로컬 전용) ─────────

  const addSearchTerm = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    setState((s) => ({
      ...s,
      searchHistory: [t, ...s.searchHistory.filter((x) => x !== t)].slice(0, 10),
    }));
  }, []);

  const clearSearchHistory = useCallback(() => {
    setState((s) => ({ ...s, searchHistory: [] }));
  }, []);

  const setLocationOverride = useCallback((label: string | null) => {
    setState((s) => ({ ...s, locationOverride: label }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboarded: true }));
  }, []);

  const setNotification = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setState((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } }));
  }, []);

  const setTheme = useCallback((theme: ThemeSetting) => {
    setState((s) => ({ ...s, theme }));
  }, []);

  // ─── 프로필 ─────────────────────────────────────────

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    const { userId } = stateRef.current;
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s));
    if (userId) {
      sync(
        updateProfileRow(userId, {
          name: patch.name,
          bio: patch.bio,
          avatar: patch.avatar,
        }),
      );
    }
  }, []);

  // ─── 힐링 리스트 ────────────────────────────────────

  const createList = useCallback((name: string) => {
    const { userId } = stateRef.current;
    const id = uuid(); // 서버와 같은 id를 쓰도록 클라이언트에서 생성
    setState((s) => ({
      ...s,
      lists: [{ id, name, spotIds: [], createdAt: Date.now() }, ...s.lists],
    }));
    if (userId) sync(insertList(userId, id, name));
  }, []);

  const deleteList = useCallback((listId: string) => {
    setState((s) => ({ ...s, lists: s.lists.filter((l) => l.id !== listId) }));
    if (isRemoteReviewId(listId)) sync(deleteListRow(listId));
  }, []);

  const toggleSpotInList = useCallback((listId: string, spotId: string) => {
    const list = stateRef.current.lists.find((l) => l.id === listId);
    const next = list ? !list.spotIds.includes(spotId) : true;
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId
          ? {
              ...l,
              spotIds: next ? [...l.spotIds, spotId] : l.spotIds.filter((id) => id !== spotId),
            }
          : l,
      ),
    }));
    if (isRemoteReviewId(listId)) sync(setListSpot(listId, spotId, next));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      signIn,
      signUp,
      resetPassword,
      isBookmarked,
      toggleBookmark,
      addReview,
      updateReview,
      deleteReview,
      isReviewLiked,
      toggleReviewLike,
      isReviewReported,
      reportReview,
      reportCongestion,
      refreshCongestion,
      addSearchTerm,
      clearSearchHistory,
      setLocationOverride,
      completeOnboarding,
      updateProfile,
      logout,
      deleteAccount,
      createList,
      deleteList,
      toggleSpotInList,
      setNotification,
      setTheme,
    }),
    [
      state,
      hydrated,
      signIn,
      signUp,
      resetPassword,
      isBookmarked,
      toggleBookmark,
      addReview,
      updateReview,
      deleteReview,
      isReviewLiked,
      toggleReviewLike,
      isReviewReported,
      reportReview,
      reportCongestion,
      refreshCongestion,
      addSearchTerm,
      clearSearchHistory,
      setLocationOverride,
      completeOnboarding,
      updateProfile,
      logout,
      deleteAccount,
      createList,
      deleteList,
      toggleSpotInList,
      setNotification,
      setTheme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
