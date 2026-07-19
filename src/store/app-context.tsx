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

import type { Review } from '@/types';

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

// AsyncStorage에 통째로 저장되는 부분
interface PersistedState {
  onboarded: boolean;
  user: UserProfile | null;
  bookmarks: string[];
  myReviews: Record<string, Review[]>; // spotId -> 내가 쓴 후기
  lists: HealingList[];
  notifications: NotificationSettings;
}

const INITIAL: PersistedState = {
  onboarded: false,
  user: null,
  bookmarks: [],
  myReviews: {},
  lists: [],
  notifications: { spotRecommend: true, comment: true, marketing: false },
};

interface AppState extends PersistedState {
  hydrated: boolean;
  isBookmarked: (spotId: string) => boolean;
  toggleBookmark: (spotId: string) => void;
  addReview: (spotId: string, review: Review) => void;
  deleteReview: (spotId: string, reviewId: string) => void;
  completeOnboarding: () => void;
  login: (user: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  logout: () => void;
  deleteAccount: () => void;
  createList: (name: string) => void;
  deleteList: (listId: string) => void;
  toggleSpotInList: (listId: string, spotId: string) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
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

  const deleteReview = useCallback((spotId: string, reviewId: string) => {
    setState((s) => ({
      ...s,
      myReviews: {
        ...s.myReviews,
        [spotId]: (s.myReviews[spotId] ?? []).filter((r) => r.id !== reviewId),
      },
    }));
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

  // 탈퇴: 온보딩 여부만 남기고 모든 데이터 삭제
  const deleteAccount = useCallback(() => {
    setState({ ...INITIAL, onboarded: true });
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

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      isBookmarked,
      toggleBookmark,
      addReview,
      deleteReview,
      completeOnboarding,
      login,
      updateProfile,
      logout,
      deleteAccount,
      createList,
      deleteList,
      toggleSpotInList,
      setNotification,
    }),
    [
      state,
      hydrated,
      isBookmarked,
      toggleBookmark,
      addReview,
      deleteReview,
      completeOnboarding,
      login,
      updateProfile,
      logout,
      deleteAccount,
      createList,
      deleteList,
      toggleSpotInList,
      setNotification,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
