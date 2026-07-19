// 숨표(SOOM) 디자인 토큰 — CLAUDE.md 디자인 시스템 기준
// 색상·라운드·여백·그림자는 모두 이 파일에서 import 해서 사용한다.

export const colors = {
  sage: '#8DA284',
  sageLight: '#A8B89E',
  sageSoft: '#E3E9DD', // 태그 칩/아이콘 연한 배경
  beigeBg: '#F2EEE6',
  cardBg: '#FFFFFF',
  textMain: '#4A4A46',
  textSub: '#9A9A93',
  star: '#F5C24B',
  logout: '#E8837A',
  // 혼잡도
  congestionLow: '#5BB85D', // 여유로움
  congestionMid: '#F0A44B', // 보통
  congestionHigh: '#E85C4F', // 조금 붐빔
  border: '#E8E4DA',
} as const;

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
