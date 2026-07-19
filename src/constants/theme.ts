// 숨표(SOOM) 디자인 토큰 — CLAUDE.md 디자인 시스템 기준
// 색상·라운드·여백·그림자는 모두 이 파일에서 import 해서 사용한다.
// 컴포넌트에서는 useThemeColors()/useThemedStyles()로 현재 테마 팔레트를 받는다.

// 혼잡도 색은 신호등 의미가 있어 라이트/다크 공통으로 쓴다
const congestion = {
  congestionLow: '#5BB85D', // 여유로움
  congestionMid: '#F0A44B', // 보통
  congestionHigh: '#E85C4F', // 조금 붐빔
} as const;

export const lightColors = {
  sage: '#8DA284',
  sageLight: '#A8B89E',
  sageSoft: '#E3E9DD', // 태그 칩/아이콘 연한 배경
  beigeBg: '#F2EEE6',
  cardBg: '#FFFFFF',
  textMain: '#4A4A46',
  textSub: '#9A9A93',
  star: '#F5C24B',
  starEmpty: '#C9CDD2',
  logout: '#E8837A',
  logoutSoft: '#FBE3E0', // 경고성 아이콘 배경
  border: '#E8E4DA',
  // 목업 지도
  mapBg: '#EAE6D8',
  mapRiver: '#DCD8C8',
  mapRoad: '#F7F4EC',
  mapPark: '#CBD6BE',
  ...congestion,
};

export type ThemeColors = { [K in keyof typeof lightColors]: string };

// 다크 팔레트 — 따뜻한 톤을 유지한 어두운 베이지/세이지
export const darkColors: ThemeColors = {
  sage: '#9AB18F',
  sageLight: '#76886E',
  sageSoft: '#3A423A',
  beigeBg: '#201F1B',
  cardBg: '#2B2A25',
  textMain: '#EAE7DE',
  textSub: '#95938A',
  star: '#F5C24B',
  starEmpty: '#4C4B45',
  logout: '#E8837A',
  logoutSoft: '#45302D',
  border: '#3B3930',
  mapBg: '#26251F',
  mapRiver: '#33322A',
  mapRoad: '#3B3A32',
  mapPark: '#39443A',
  ...congestion,
};

export const radius = {
  card: 20,
  button: 18,
  input: 24,
  chip: 999,
  badge: 999,
  image: 16,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const shadow = {
  card: {
    shadowColor: '#7A7566',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const font = {
  title: 22,
  heading: 18,
  body: 15,
  caption: 13,
  small: 11,
} as const;
