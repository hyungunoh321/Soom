export type CongestionLevel = 'low' | 'mid' | 'high';

export type TimeSlot = '오전' | '오후' | '저녁' | '심야';

export type ThemeSetting = 'system' | 'light' | 'dark';

// 사용자가 남긴 실시간 혼잡도 제보 (일정 시간 동안만 유효)
export interface CongestionReport {
  level: CongestionLevel;
  at: number; // epoch ms
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  date: string; // YYYY.MM
  rating: number; // 1~5
  text: string;
  photos: string[]; // 이미지 URL
  tags?: string[]; // 분위기 태그
  likes?: number; // '도움돼요' 수 (내 좋아요 제외)
  userId?: string; // 서버 후기의 작성자 id (시드 후기는 없음)
}

// 나만의 힐링 코스 리스트
export interface HealingList {
  id: string;
  name: string;
  spotIds: string[];
  createdAt: number;
}

export interface Spot {
  id: string;
  name: string;
  address: string;
  walkTime: string; // "도보 8분"
  distance: string; // "450m"
  rating: number;
  tags: string[]; // "#" 제외한 태그명
  congestion: CongestionLevel;
  image: string;
  description: string;
  // 시간대별 혼잡도 (0~1), 오전/오후/저녁/심야 순
  congestionByTime: Record<TimeSlot, number>;
  // 목업 지도 위 마커 위치 (% 좌표)
  mapPos: { x: number; y: number };
  reviews: Review[];
}
