import { useCallback, useEffect, useState } from 'react';

import { fetchSpotReviews } from '@/lib/api';
import { useApp } from '@/store/app-context';
import type { Review } from '@/types';

// 한 스팟의 서버 후기 목록 (다른 사용자 후기 포함).
// 실패(오프라인/스키마 미적용) 시 빈 배열 — 화면은 시드+내 후기로 동작한다.
export function useSpotReviews(spotId: string | undefined) {
  const { reviewLikes } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!spotId) return;
    setLoading(true);
    try {
      setReviews(await fetchSpotReviews(spotId, reviewLikes));
    } catch {
      // 서버 미연결 — 기존 목록 유지
    } finally {
      setLoading(false);
    }
    // reviewLikes는 좋아요 수 보정용 — 목록 자체를 다시 부를 필요는 없어 초기값만 쓴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reviews, loading, refresh };
}
