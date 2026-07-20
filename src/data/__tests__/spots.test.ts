import {
  CONGESTION_REPORT_TTL_MS,
  SPOTS,
  currentTimeSlot,
  getCurrentCongestion,
  getSpot,
  recommendSpots,
  resolveCongestion,
} from '@/data/spots';

const at = (hour: number) => new Date(2026, 6, 19, hour, 0, 0);

describe('currentTimeSlot', () => {
  it('시각을 오전/오후/저녁/심야 시간대로 나눈다', () => {
    expect(currentTimeSlot(at(6))).toBe('오전');
    expect(currentTimeSlot(at(11))).toBe('오전');
    expect(currentTimeSlot(at(12))).toBe('오후');
    expect(currentTimeSlot(at(17))).toBe('오후');
    expect(currentTimeSlot(at(18))).toBe('저녁');
    expect(currentTimeSlot(at(23))).toBe('저녁');
    expect(currentTimeSlot(at(0))).toBe('심야');
    expect(currentTimeSlot(at(5))).toBe('심야');
  });
});

describe('getCurrentCongestion', () => {
  const spot = getSpot('sunset-bench')!; // 오전 0.2 / 오후 0.45 / 저녁 0.6 / 심야 0.25

  it('시간대 값에 따라 low/mid/high를 돌려준다', () => {
    expect(getCurrentCongestion(spot, at(9))).toBe('low'); // 0.2
    expect(getCurrentCongestion(spot, at(14))).toBe('mid'); // 0.45
    expect(getCurrentCongestion(spot, at(20))).toBe('high'); // 0.6 (경계값 포함)
  });
});

describe('resolveCongestion', () => {
  const spot = getSpot('sunset-bench')!; // 오전 0.2 → 데이터 기준 low

  it('유효한 제보가 있으면 제보 값을 우선한다', () => {
    const now = at(9);
    const report = { level: 'high' as const, at: now.getTime() - 10 * 60 * 1000 }; // 10분 전
    expect(resolveCongestion(spot, report, now)).toBe('high');
  });

  it('유효 시간이 지난 제보는 무시하고 시간대 데이터로 돌아간다', () => {
    const now = at(9);
    const report = { level: 'high' as const, at: now.getTime() - CONGESTION_REPORT_TTL_MS - 1 };
    expect(resolveCongestion(spot, report, now)).toBe('low');
  });

  it('제보가 없으면 시간대 데이터를 그대로 쓴다', () => {
    expect(resolveCongestion(spot, undefined, at(9))).toBe('low');
    expect(resolveCongestion(spot, null, at(20))).toBe('high');
  });
});

describe('recommendSpots', () => {
  it('취향 데이터가 없으면 평점 높은 순으로 추천한다', () => {
    const result = recommendSpots([], []);
    expect(result).toHaveLength(4);
    const ratings = result.map((s) => s.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  it('북마크한 스팟은 추천에서 제외한다', () => {
    const result = recommendSpots(['sunset-bench'], []);
    expect(result.map((s) => s.id)).not.toContain('sunset-bench');
  });

  it('북마크한 스팟과 태그가 겹치는 스팟을 우선한다', () => {
    // sunset-bench 태그: 조용함/야경/산책 → 겹침 2개인 secret-bench(야경/산책)가 최상위
    const result = recommendSpots(['sunset-bench'], []);
    expect(result[0].id).toBe('secret-bench');
  });

  it('후기를 쓴 스팟도 취향 신호로 반영하고 추천에서 제외한다', () => {
    const result = recommendSpots([], ['forest-bookstore']);
    expect(result.map((s) => s.id)).not.toContain('forest-bookstore');
  });

  it('모든 스팟에는 목업 지도 좌표와 시간대 혼잡도 데이터가 있다', () => {
    for (const spot of SPOTS) {
      expect(spot.mapPos.x).toBeGreaterThanOrEqual(0);
      expect(spot.mapPos.x).toBeLessThanOrEqual(100);
      expect(Object.keys(spot.congestionByTime)).toEqual(['오전', '오후', '저녁', '심야']);
    }
  });

  it('모든 스팟에는 서울 범위의 실제 지도 좌표가 있다', () => {
    for (const spot of SPOTS) {
      expect(spot.coords.latitude).toBeGreaterThan(37.4);
      expect(spot.coords.latitude).toBeLessThan(37.7);
      expect(spot.coords.longitude).toBeGreaterThan(126.7);
      expect(spot.coords.longitude).toBeLessThan(127.2);
    }
  });
});
