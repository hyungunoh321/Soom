import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { Review } from '@/types';

// 앱 전역 상태: 북마크한 스팟 id 목록, 내가 작성한 후기(스팟별)
interface AppState {
  bookmarks: string[];
  myReviews: Record<string, Review[]>; // spotId -> 내가 쓴 후기
  isBookmarked: (spotId: string) => boolean;
  toggleBookmark: (spotId: string) => void;
  addReview: (spotId: string, review: Review) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>(['forest-bookstore', 'sunset-bench']);
  const [myReviews, setMyReviews] = useState<Record<string, Review[]>>({});

  const isBookmarked = useCallback((spotId: string) => bookmarks.includes(spotId), [bookmarks]);

  const toggleBookmark = useCallback((spotId: string) => {
    setBookmarks((prev) =>
      prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [spotId, ...prev],
    );
  }, []);

  const addReview = useCallback((spotId: string, review: Review) => {
    setMyReviews((prev) => ({
      ...prev,
      [spotId]: [review, ...(prev[spotId] ?? [])],
    }));
  }, []);

  const value = useMemo(
    () => ({ bookmarks, myReviews, isBookmarked, toggleBookmark, addReview }),
    [bookmarks, myReviews, isBookmarked, toggleBookmark, addReview],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
