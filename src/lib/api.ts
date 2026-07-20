import { supabase } from '@/lib/supabase';
import { CONGESTION_REPORT_TTL_MS } from '@/data/spots';
import type { CongestionLevel, CongestionReport, HealingList, Review } from '@/types';

// ─── 공용 유틸 ───────────────────────────────────────────

export function uuid(): string {
  const g = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (g?.randomUUID) return g.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 서버에 존재하는 후기인지(시드 후기 r1/r2...와 구분) */
export function isRemoteReviewId(id: string): boolean {
  return UUID_RE.test(id);
}

export const reviewKey = (spotId: string, reviewId: string) => `${spotId}:${reviewId}`;

const dateLabel = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export function authErrorMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return '이메일 또는 비밀번호가 올바르지 않아요.';
  if (/already registered/i.test(message)) return '이미 가입된 이메일이에요.';
  if (/at least 6 characters|password/i.test(message)) return '비밀번호는 6자 이상이어야 해요.';
  if (/rate limit/i.test(message)) return '요청이 많아요. 잠시 후 다시 시도해 주세요.';
  if (/confirm/i.test(message)) return '이메일 인증이 필요해요. 메일함을 확인해 주세요.';
  return '요청을 처리하지 못했어요. 네트워크를 확인해 주세요.';
}

// ─── 행(row) 타입 ────────────────────────────────────────

interface ReviewRow {
  id: string;
  spot_id: string;
  user_id: string;
  rating: number;
  text: string;
  tags: string[];
  photos: string[];
  created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
  review_likes: { count: number }[];
}

function mapReviewRow(row: ReviewRow, likedByMe: boolean): Review {
  const total = row.review_likes?.[0]?.count ?? 0;
  return {
    id: row.id,
    author: row.profiles?.name ?? '숨표 사용자',
    avatar: row.profiles?.avatar_url ?? undefined,
    date: dateLabel(row.created_at),
    rating: row.rating,
    text: row.text,
    photos: row.photos ?? [],
    tags: row.tags ?? [],
    likes: Math.max(0, total - (likedByMe ? 1 : 0)),
    userId: row.user_id,
  };
}

// review_likes/review_reports 경유 경로와의 모호성 때문에 FK를 명시해야 한다
const REVIEW_SELECT =
  'id, spot_id, user_id, rating, text, tags, photos, created_at, profiles!reviews_user_id_fkey(name, avatar_url), review_likes(count)';

// ─── 조회 ────────────────────────────────────────────────

/** 한 스팟의 모든 후기 (작성자·좋아요 수 포함, 최신순) */
export async function fetchSpotReviews(
  spotId: string,
  myLikeKeys: string[],
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const liked = new Set(myLikeKeys);
  return (data as unknown as ReviewRow[]).map((row) =>
    mapReviewRow(row, liked.has(reviewKey(row.spot_id, row.id))),
  );
}

export interface MyServerData {
  user: { name: string; bio: string; avatar: string } | null;
  myReviews: Record<string, Review[]>;
  reviewLikes: string[];
  reportedReviews: string[];
  bookmarks: string[];
  lists: HealingList[];
}

/** 로그인 직후 내 데이터 전체 로드 */
export async function fetchMyData(userId: string): Promise<MyServerData> {
  const [profileRes, reviewsRes, likesRes, reportsRes, bookmarksRes, listsRes] =
    await Promise.all([
      supabase.from('profiles').select('name, bio, avatar_url').eq('id', userId).maybeSingle(),
      supabase
        .from('reviews')
        .select(REVIEW_SELECT)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase.from('review_likes').select('review_id, reviews(spot_id)').eq('user_id', userId),
      supabase.from('review_reports').select('review_id, reviews(spot_id)').eq('user_id', userId),
      supabase.from('bookmarks').select('spot_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase
        .from('lists')
        .select('id, name, created_at, list_spots(spot_id, created_at)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

  const likeRows = (likesRes.data ?? []) as unknown as {
    review_id: string;
    reviews: { spot_id: string } | null;
  }[];
  const reviewLikes = likeRows
    .filter((r) => r.reviews)
    .map((r) => reviewKey(r.reviews!.spot_id, r.review_id));

  const reportRows = (reportsRes.data ?? []) as unknown as {
    review_id: string;
    reviews: { spot_id: string } | null;
  }[];
  const reportedReviews = reportRows
    .filter((r) => r.reviews)
    .map((r) => reviewKey(r.reviews!.spot_id, r.review_id));

  const likedSet = new Set(reviewLikes);
  const myReviews: Record<string, Review[]> = {};
  for (const row of (reviewsRes.data ?? []) as unknown as ReviewRow[]) {
    const review = mapReviewRow(row, likedSet.has(reviewKey(row.spot_id, row.id)));
    myReviews[row.spot_id] = [...(myReviews[row.spot_id] ?? []), review];
  }

  const listRows = (listsRes.data ?? []) as unknown as {
    id: string;
    name: string;
    created_at: string;
    list_spots: { spot_id: string; created_at: string }[];
  }[];
  const lists: HealingList[] = listRows.map((l) => ({
    id: l.id,
    name: l.name,
    createdAt: new Date(l.created_at).getTime(),
    spotIds: [...(l.list_spots ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((s) => s.spot_id),
  }));

  const p = profileRes.data as { name: string; bio: string; avatar_url: string | null } | null;
  return {
    user: p ? { name: p.name, bio: p.bio, avatar: p.avatar_url ?? '' } : null,
    myReviews,
    reviewLikes,
    reportedReviews,
    bookmarks: ((bookmarksRes.data ?? []) as { spot_id: string }[]).map((b) => b.spot_id),
    lists,
  };
}

/** 트리거 적용 전에 가입한 계정 등 프로필 행이 없으면 만들어 준다 */
export async function ensureProfile(userId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}

/** 전체 스팟의 최근 2시간 혼잡도 제보 → 다수결 집계 */
export async function fetchCongestion(): Promise<Record<string, CongestionReport>> {
  const since = new Date(Date.now() - CONGESTION_REPORT_TTL_MS).toISOString();
  const { data, error } = await supabase
    .from('congestion_reports')
    .select('spot_id, level, created_at')
    .gte('created_at', since);
  if (error) throw error;

  const bySpot = new Map<string, { counts: Record<CongestionLevel, number>; latest: number }>();
  for (const row of (data ?? []) as { spot_id: string; level: CongestionLevel; created_at: string }[]) {
    const entry = bySpot.get(row.spot_id) ?? {
      counts: { low: 0, mid: 0, high: 0 },
      latest: 0,
    };
    entry.counts[row.level] += 1;
    entry.latest = Math.max(entry.latest, new Date(row.created_at).getTime());
    bySpot.set(row.spot_id, entry);
  }

  const result: Record<string, CongestionReport> = {};
  for (const [spotId, { counts, latest }] of bySpot) {
    const level = (['high', 'mid', 'low'] as CongestionLevel[]).reduce((best, l) =>
      counts[l] > counts[best] ? l : best,
    );
    result[spotId] = { level, at: latest };
  }
  return result;
}

// ─── 변경 (실패는 호출부에서 무시 — 로컬 우선) ─────────────

export async function insertReview(
  userId: string,
  spotId: string,
  review: Pick<Review, 'id' | 'rating' | 'text' | 'photos' | 'tags'>,
): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    id: review.id,
    spot_id: spotId,
    user_id: userId,
    rating: review.rating,
    text: review.text,
    tags: review.tags ?? [],
    photos: review.photos,
  });
  if (error) throw error;
}

export async function updateReviewRow(
  reviewId: string,
  patch: Partial<Pick<Review, 'rating' | 'text' | 'photos' | 'tags'>>,
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      ...(patch.rating !== undefined ? { rating: patch.rating } : {}),
      ...(patch.text !== undefined ? { text: patch.text } : {}),
      ...(patch.photos !== undefined ? { photos: patch.photos } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId);
  if (error) throw error;
}

export async function deleteReviewRow(reviewId: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}

export async function setReviewLike(
  userId: string,
  reviewId: string,
  liked: boolean,
): Promise<void> {
  const { error } = liked
    ? await supabase.from('review_likes').insert({ review_id: reviewId, user_id: userId })
    : await supabase
        .from('review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId);
  if (error) throw error;
}

export async function insertReviewReport(userId: string, reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('review_reports')
    .insert({ review_id: reviewId, user_id: userId });
  if (error) throw error;
}

export async function setBookmark(
  userId: string,
  spotId: string,
  bookmarked: boolean,
): Promise<void> {
  const { error } = bookmarked
    ? await supabase.from('bookmarks').insert({ user_id: userId, spot_id: spotId })
    : await supabase.from('bookmarks').delete().eq('user_id', userId).eq('spot_id', spotId);
  if (error) throw error;
}

export async function insertList(userId: string, listId: string, name: string): Promise<void> {
  const { error } = await supabase.from('lists').insert({ id: listId, user_id: userId, name });
  if (error) throw error;
}

export async function deleteListRow(listId: string): Promise<void> {
  const { error } = await supabase.from('lists').delete().eq('id', listId);
  if (error) throw error;
}

export async function setListSpot(
  listId: string,
  spotId: string,
  included: boolean,
): Promise<void> {
  const { error } = included
    ? await supabase.from('list_spots').insert({ list_id: listId, spot_id: spotId })
    : await supabase.from('list_spots').delete().eq('list_id', listId).eq('spot_id', spotId);
  if (error) throw error;
}

export async function insertCongestionReport(
  userId: string,
  spotId: string,
  level: CongestionLevel,
): Promise<void> {
  const { error } = await supabase
    .from('congestion_reports')
    .insert({ spot_id: spotId, user_id: userId, level });
  if (error) throw error;
}

export async function updateProfileRow(
  userId: string,
  patch: Partial<{ name: string; bio: string; avatar: string }>,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
      ...(patch.avatar !== undefined ? { avatar_url: patch.avatar } : {}),
    })
    .eq('id', userId);
  if (error) throw error;
}

/** 탈퇴: 내 데이터 전부 삭제 (계정 완전 삭제는 서버 함수 필요 — 데이터만 정리) */
export async function deleteMyData(userId: string): Promise<void> {
  await supabase.from('congestion_reports').delete().eq('user_id', userId);
  await supabase.from('review_reports').delete().eq('user_id', userId);
  await supabase.from('review_likes').delete().eq('user_id', userId);
  await supabase.from('reviews').delete().eq('user_id', userId);
  await supabase.from('bookmarks').delete().eq('user_id', userId);
  await supabase.from('lists').delete().eq('user_id', userId);
}
