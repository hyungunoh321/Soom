import type { CongestionLevel, CongestionReport, Spot, TimeSlot } from '@/types';

// 분위기 태그 (기획서 핵심 기능 3)
export const MOOD_TAGS = ['조용함', '야경', '산책', '혼자 가기 좋음', '힐링'] as const;

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=60`;
const avatar = (n: number) => `https://i.pravatar.cc/100?img=${n}`;

export const SPOTS: Spot[] = [
  {
    id: 'sunset-bench',
    name: '한강 노을 벤치',
    address: '서울 영등포구 여의도동',
    walkTime: '도보 12분',
    distance: '900m',
    rating: 4.8,
    tags: ['조용함', '야경', '산책'],
    congestion: 'low',
    image: img('photo-1507525428034-b723cf961d3e'),
    description:
      '여의도 한강공원 서쪽 끝, 해질녘이면 강물 위로 노을이 길게 내려앉는 벤치. 사람이 적어 혼자 생각을 정리하기 좋다.',
    congestionByTime: { 오전: 0.2, 오후: 0.45, 저녁: 0.6, 심야: 0.25 },
    mapPos: { x: 42, y: 30 },
    reviews: [
      {
        id: 'r1',
        author: '민지',
        avatar: avatar(47),
        date: '2026.05',
        rating: 5,
        text: '해질녘에 맞춰서 갔는데 정말 이름 그대로 노을 맛집이네요. 생각보다 사람이 많지 않아서 조용히 명상하기 좋았어요.',
        photos: [img('photo-1507525428034-b723cf961d3e')],
        tags: ['조용함', '야경'],
        likes: 12,
      },
      {
        id: 'r2',
        author: '준영',
        avatar: avatar(12),
        date: '2026.05',
        rating: 4,
        text: '주말 저녁에는 조금 붐비지만 야경이 정말 예뻐요. 산책로가 잘 되어 있어서 연인과 오기 딱 좋습니다.',
        photos: [],
        tags: ['야경', '산책'],
        likes: 5,
      },
      {
        id: 'r3',
        author: '하늘',
        avatar: avatar(32),
        date: '2026.04',
        rating: 5,
        text: '퇴근길에 잠깐 들렀는데 30분이 금방 지나갔어요. 바람 소리랑 물소리만 들려서 마음이 편해집니다.',
        photos: [],
        tags: ['힐링'],
        likes: 8,
      },
    ],
  },
  {
    id: 'forest-bookstore',
    name: '연남동 숲길 서점',
    address: '서울 마포구 연남동',
    walkTime: '도보 8분',
    distance: '450m',
    rating: 4.8,
    tags: ['조용함', '혼자 가기 좋음', '독서'],
    congestion: 'low',
    image: img('photo-1507842217343-583bb7270b66'),
    description:
      '연남동 골목 안쪽, 나무 책장으로 가득한 작은 독립서점. 잔잔한 음악과 책 냄새 속에서 시간을 잊게 된다.',
    congestionByTime: { 오전: 0.25, 오후: 0.5, 저녁: 0.4, 심야: 0.1 },
    mapPos: { x: 25, y: 48 },
    reviews: [
      {
        id: 'r1',
        author: '서연',
        avatar: avatar(44),
        date: '2026.05',
        rating: 5,
        text: '평일 오전에 가면 거의 전세 낸 기분이에요. 책 고르다 보면 스트레스가 녹아요.',
        photos: [img('photo-1481627834876-b7833e8f5570')],
        tags: ['조용함', '혼자 가기 좋음'],
        likes: 9,
      },
      {
        id: 'r2',
        author: '도윤',
        avatar: avatar(15),
        date: '2026.04',
        rating: 4,
        text: '조용해서 좋아요. 주인분이 추천해 주시는 책이 늘 취향 저격입니다.',
        photos: [],
      },
    ],
  },
  {
    id: 'secret-bench',
    name: '망원 한강공원 비밀 벤치',
    address: '서울 마포구 망원동',
    walkTime: '도보 15분',
    distance: '1.2km',
    rating: 4.9,
    tags: ['야경', '산책', '물멍'],
    congestion: 'mid',
    image: img('photo-1477959858617-67f85cf4f1df'),
    description:
      '망원 한강공원 북단, 가로등 불빛이 강물에 비치는 산책로 끝의 벤치. 밤이 되면 다리 야경이 한눈에 들어온다.',
    congestionByTime: { 오전: 0.15, 오후: 0.35, 저녁: 0.7, 심야: 0.4 },
    mapPos: { x: 18, y: 26 },
    reviews: [
      {
        id: 'r1',
        author: '지우',
        avatar: avatar(20),
        date: '2026.05',
        rating: 5,
        text: '물멍하기 최고의 장소. 이어폰 끼고 한 시간 앉아 있다 왔어요.',
        photos: [],
        tags: ['혼자 가기 좋음', '힐링'],
        likes: 15,
      },
      {
        id: 'r2',
        author: '태현',
        avatar: avatar(8),
        date: '2026.03',
        rating: 5,
        text: '야경이 진짜 예쁩니다. 사람들이 잘 모르는 구간이라 조용해요.',
        photos: [img('photo-1477959858617-67f85cf4f1df')],
        tags: ['야경', '조용함'],
        likes: 7,
      },
    ],
  },
  {
    id: 'space-rest',
    name: '공간: 쉼',
    address: '서울 마포구 성산동',
    walkTime: '도보 5분',
    distance: '300m',
    rating: 4.7,
    tags: ['명상', '차음료', '식물'],
    congestion: 'high',
    image: img('photo-1554118811-1e0d58224f24'),
    description:
      '통유리 너머 작은 정원이 보이는 티하우스. 식물에 둘러싸여 따뜻한 차 한 잔으로 쉬어가기 좋다.',
    congestionByTime: { 오전: 0.3, 오후: 0.75, 저녁: 0.55, 심야: 0.05 },
    mapPos: { x: 62, y: 55 },
    reviews: [
      {
        id: 'r1',
        author: '수아',
        avatar: avatar(25),
        date: '2026.05',
        rating: 5,
        text: '차 향이 정말 좋고, 창밖 정원 보면서 멍때리기 좋아요. 주말엔 웨이팅이 있어요.',
        photos: [],
      },
      {
        id: 'r2',
        author: '민재',
        avatar: avatar(53),
        date: '2026.04',
        rating: 4,
        text: '평일 오전에 가면 여유롭습니다. 명상 클래스도 운영해요.',
        photos: [],
      },
    ],
  },
  {
    id: 'night-trail',
    name: '경의선 숲길 산책로',
    address: '서울 마포구 연남동',
    walkTime: '도보 6분',
    distance: '400m',
    rating: 4.6,
    tags: ['산책', '힐링', '조용함'],
    congestion: 'mid',
    image: img('photo-1441974231531-c6227db76b6e'),
    description:
      '옛 철길을 따라 이어지는 긴 숲길. 나무 그늘 아래를 걷다 보면 도심 소음이 멀어진다.',
    congestionByTime: { 오전: 0.35, 오후: 0.55, 저녁: 0.65, 심야: 0.2 },
    mapPos: { x: 35, y: 62 },
    reviews: [
      {
        id: 'r1',
        author: '예린',
        avatar: avatar(31),
        date: '2026.05',
        rating: 5,
        text: '출근 전에 한 바퀴 걷고 가면 하루가 달라져요.',
        photos: [img('photo-1441974231531-c6227db76b6e')],
        tags: ['산책', '힐링'],
        likes: 11,
      },
    ],
  },
  {
    id: 'rooftop-garden',
    name: '하늘 정원 루프탑',
    address: '서울 마포구 서교동',
    walkTime: '도보 10분',
    distance: '750m',
    rating: 4.5,
    tags: ['야경', '혼자 가기 좋음', '힐링'],
    congestion: 'low',
    image: img('photo-1444723121867-7a241cacace9'),
    description:
      '건물 옥상에 조성된 작은 정원. 해질 무렵 도시의 지붕들 위로 번지는 노을을 볼 수 있다.',
    congestionByTime: { 오전: 0.1, 오후: 0.3, 저녁: 0.6, 심야: 0.35 },
    mapPos: { x: 72, y: 38 },
    reviews: [
      {
        id: 'r1',
        author: '현우',
        avatar: avatar(60),
        date: '2026.04',
        rating: 4,
        text: '숨은 명소예요. 의자가 많지 않으니 일찍 가는 걸 추천합니다.',
        photos: [],
      },
    ],
  },
];

export function getSpot(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id);
}

// 지금 시각이 속한 시간대
export function currentTimeSlot(date = new Date()): TimeSlot {
  const h = date.getHours();
  if (h >= 6 && h < 12) return '오전';
  if (h >= 12 && h < 18) return '오후';
  if (h >= 18) return '저녁';
  return '심야';
}

// 시간대별 데이터 기반의 "현재" 혼잡도 (카드/상세에서 실시간처럼 표시)
export function getCurrentCongestion(spot: Spot, date = new Date()): CongestionLevel {
  const v = spot.congestionByTime[currentTimeSlot(date)];
  if (v < 0.4) return 'low';
  if (v < 0.6) return 'mid';
  return 'high';
}

// 사용자 혼잡도 제보의 유효 시간
export const CONGESTION_REPORT_TTL_MS = 2 * 60 * 60 * 1000;

// 유효한 제보가 있으면 제보를, 없으면 시간대 데이터를 현재 혼잡도로 쓴다
export function resolveCongestion(
  spot: Spot,
  report?: CongestionReport | null,
  date = new Date(),
): CongestionLevel {
  if (report && date.getTime() - report.at < CONGESTION_REPORT_TTL_MS) return report.level;
  return getCurrentCongestion(spot, date);
}

// 맞춤 추천: 북마크·내 후기가 달린 스팟의 태그와 겹치는 정도로 점수화
export function recommendSpots(
  bookmarkIds: string[],
  reviewedSpotIds: string[],
  limit = 4,
): Spot[] {
  const likedTags = new Map<string, number>();
  const likedIds = new Set([...bookmarkIds, ...reviewedSpotIds]);
  for (const id of likedIds) {
    for (const tag of getSpot(id)?.tags ?? []) {
      likedTags.set(tag, (likedTags.get(tag) ?? 0) + 1);
    }
  }

  const scored = SPOTS.filter((s) => !likedIds.has(s.id)).map((s) => ({
    spot: s,
    score:
      s.tags.reduce((acc, t) => acc + (likedTags.get(t) ?? 0), 0) + s.rating / 10,
  }));
  scored.sort((a, b) => b.score - a.score);
  const picks = scored.slice(0, limit).map((x) => x.spot);
  // 취향 데이터가 없으면 평점순
  return picks.length > 0 ? picks : [...SPOTS].sort((a, b) => b.rating - a.rating).slice(0, limit);
}
