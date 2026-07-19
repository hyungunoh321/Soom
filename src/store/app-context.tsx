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

import type { CongestionLevel, CongestionReport, Review, ThemeSetting } from '@/types';

const STORAGE_KEY = 'soom:state:v1';

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

export interface HealingList {
  id: string;
  name: string;
  spotIds: string[];
  createdAt: number;
}

export interface NotificationSettings {
  spotRecommend: boolean;
  comment: boolean;
  marketing: boolean;
}

// 후기 식별 키 (spotId + reviewId)
const reviewKey = (spotId: string, reviewId: string) => `${spotId}:${reviewId}`;

// AsyncStorage에 통째로 저장되는 부분
interface PersistedState {
  onboarded: boolean;
  user: UserProfile | null;
  bookmarks: string[];
  myReviews: Record<string, Review[]>; // spotId -> 내가 쓴 후기
  lists: HealingList[];
  notifications: NotificationSettings;
  searchHistory: string[];
  locationOverride: string | null; // 사용자가 직접 고른 동네 (null이면 GPS)
  reviewLikes: string[]; // 내가 '도움돼요' 누른 후기 키
  reportedReviews: string[]; // 내가 신고한 후기 키 (목록에서 숨김)
  congestionReports: Record<string, CongestionReport>; // spotId -> 내 혼잡도 제보
  theme: ThemeSetting;
}

const INITIAL: PersistedState = {
  onboarded: false,
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
  addSearchTerm: (term: string) => void;
  clearSearchHistory: () => void;
  setLocationOverride: (label: string | null) => void;
  completeOnboarding: () => void;
  login: (user: UserProfile) => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // 앱 시작 시 저장된 상태 복원
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

  const isBookmarked = useCallback(
    (spotId: string) => state.bookmarks.includes(spotId),
    [state.bookmarks],
  );

  const toggleBookmark = useCallback((spotId: string) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(spotId)
        ? s.bookmarks.filter((id) => id !== spotId)
        : [spotId, ...s.bookmarks],
    }));
  }, []);

  const addReview = useCallback((spotId: string, review: Review) => {
    setState((s) => ({
      ...s,
      myReviews: { ...s.myReviews, [spotId]: [review, ...(s.myReviews[spotId] ?? [])] },
    }));
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
  }, []);

  const isReviewLiked = useCallback(
    (spotId: string, reviewId: string) => state.reviewLikes.includes(reviewKey(spotId, reviewId)),
    [state.reviewLikes],
  );

  const toggleReviewLike = useCallback((spotId: string, reviewId: string) => {
    const key = reviewKey(spotId, reviewId);
    setState((s) => ({
      ...s,
      reviewLikes: s.reviewLikes.includes(key)
        ? s.reviewLikes.filter((k) => k !== key)
        : [...s.reviewLikes, key],
    }));
  }, []);

  const isReviewReported = useCallback(
    (spotId: string, reviewId: string) =>
      state.reportedReviews.includes(reviewKey(spotId, reviewId)),
    [state.reportedReviews],
  );

  const reportReview = useCallback((spotId: string, reviewId: string) => {
    const key = reviewKey(spotId, reviewId);
    setState((s) =>
      s.reportedReviews.includes(key)
        ? s
        : { ...s, reportedReviews: [...s.reportedReviews, key] },
    );
  }, []);

  const reportCongestion = useCallback((spotId: string, level: CongestionLevel) => {
    setState((s) => ({
      ...s,
      congestionReports: { ...s.congestionReports, [spotId]: { level, at: Date.now() } },
    }));
  }, []);

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

  const login = useCallback((user: UserProfile) => {
    setState((s) => ({ ...s, user }));
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s));
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, user: null }));
  }, []);

  // 탈퇴: 온보딩 여부·화면 테마만 남기고 모든 데이터 삭제
  const deleteAccount = useCallback(() => {
    setState((s) => ({ ...INITIAL, onboarded: true, theme: s.theme }));
  }, []);

  const createList = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      lists: [
        { id: `list-${Date.now()}`, name, spotIds: [], createdAt: Date.now() },
        ...s.lists,
      ],
    }));
  }, []);

  const deleteList = useCallback((listId: string) => {
    setState((s) => ({ ...s, lists: s.lists.filter((l) => l.id !== listId) }));
  }, []);

  const toggleSpotInList = useCallback((listId: string, spotId: string) => {
    setState((s) => ({
      ...s,
      lists: s.lists.map((l) =>
        l.id === listId
          ? {
              ...l,
              spotIds: l.spotIds.includes(spotId)
                ? l.spotIds.filter((id) => id !== spotId)
                : [...l.spotIds, spotId],
            }
          : l,
      ),
    }));
  }, []);

  const setNotification = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setState((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } }));
  }, []);

  const setTheme = useCallback((theme: ThemeSetting) => {
    setState((s) => ({ ...s, theme }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
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
      addSearchTerm,
      clearSearchHistory,
      setLocationOverride,
      completeOnboarding,
      login,
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
      addSearchTerm,
      clearSearchHistory,
      setLocationOverride,
      completeOnboarding,
      login,
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
