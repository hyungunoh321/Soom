# 숨표 (SOOM)

> 바쁜 일상 속, 나만의 조용한 쉼을 발견하는 감성 휴식 스팟 공유 플랫폼

숨표는 광고성 후기와 유명 장소 위주의 기존 서비스에서 벗어나, 실제 사용자 경험 기반으로
조용하고 감성적인 휴식 공간을 찾을 수 있게 돕는 모바일 앱입니다.
React Native + Expo로 개발되었으며 iOS / Android / Web을 모두 지원합니다.

## 주요 기능

- **위치 기반 스팟 추천** — 현재 위치 기준 주변 힐링 스팟 목록과 거리 표시
- **맞춤 추천** — 북마크·후기 이력의 태그를 분석한 개인화 추천
- **지도 탐색** — 실제 지도(react-native-maps) 위 마커 탐색, 분위기 태그 필터, 키워드 검색
- **후기 시스템** — 별점·사진·분위기 태그 후기 작성/수정/삭제, 좋아요, 신고
- **혼잡도 정보** — 시간대별 혼잡도 차트 + 사용자 실시간 혼잡도 제보(크라우드소싱, 2시간 유효)
- **저장** — 스팟 북마크, 나만의 힐링 리스트(커스텀 코스) 관리
- **계정** — 이메일 회원가입/로그인/비밀번호 재설정, 프로필(닉네임·아바타) 관리
- **다크 모드** — 시스템 연동 / 라이트 / 다크 테마 선택

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | React Native 0.86 · Expo SDK 57 |
| 언어 | TypeScript (strict) |
| 라우팅 | Expo Router (파일 기반, typed routes) |
| 상태 관리 | React Context + AsyncStorage 캐시 |
| 백엔드 | Supabase (Auth · PostgreSQL + RLS · Storage) |
| 지도 | react-native-maps (네이티브) / 목업 지도 폴백 (웹) |
| 테스트 | Jest + jest-expo |
| 배포 | EAS Build / Submit |

## 아키텍처

### 오프라인 우선 동기화

모든 사용자 액션(북마크, 후기, 좋아요, 혼잡도 제보 등)은 **로컬 상태에 즉시 반영**된 뒤
백그라운드로 Supabase에 동기화됩니다. 네트워크 실패 시에도 앱은 정상 동작하며,
로그인 시 서버 상태를 다시 불러와 복원합니다.

```
사용자 액션 → 로컬 상태 갱신 (낙관적) → AsyncStorage 캐시
                    └→ sync() → Supabase (실패해도 UX 영향 없음)
```

### 데이터 모델

- 큐레이션된 스팟 데이터는 앱에 정적으로 포함되고, 서버에는 UGC(후기·좋아요·북마크·리스트·혼잡도 제보)만 `spot_id` 기준으로 저장됩니다.
- 모든 테이블에 Row Level Security(RLS)가 적용되어 anon key가 공개되어도 안전합니다.
- 회원가입 시 DB 트리거(`handle_new_user`)가 프로필을 자동 생성합니다.
- 사진은 Supabase Storage(`photos` 버킷)에 업로드되며, 실패 시 로컬 저장으로 폴백합니다.

### 플랫폼 분기

지도는 Metro의 플랫폼별 확장자 해석을 이용해 분기합니다.

- `SpotMap.tsx` — 네이티브: react-native-maps 실제 지도 (iOS는 Apple 지도, 추가 키 불필요)
- `SpotMap.web.tsx` — 웹: react-native-maps 미지원이라 일러스트 목업 지도로 자동 폴백

## 프로젝트 구조

```
src/
├── app/                  # Expo Router 화면
│   ├── (tabs)/           # 하단 탭: 홈 · 지도 · 저장 · 마이
│   ├── auth/             # 로그인 · 회원가입 · 비밀번호 재설정
│   ├── spot/[id].tsx     # 장소 상세 (후기 · 혼잡도)
│   ├── review/[spotId]/  # 후기 작성 · 수정
│   ├── list/             # 힐링 리스트
│   └── settings/         # 알림 · 테마 · 계정 관리
├── components/           # SpotCard, TagChip, CongestionBadge, StarRating 등
├── constants/theme.ts    # 디자인 토큰 (라이트/다크 팔레트, radius, spacing)
├── data/spots.ts         # 큐레이션 스팟 데이터 + 혼잡도/추천 로직
├── hooks/                # useThemeColors, useSpotReviews 등
├── lib/                  # Supabase 클라이언트 · 서버 API 레이어
├── store/app-context.tsx # 전역 상태 (인증 · 동기화 · 영속화)
└── utils/                # 사진 업로드, 거리 계산 등
supabase/schema.sql       # DB 스키마 (테이블 · RLS · 트리거 · Storage 정책)
docs/                     # 기획서 · 배포 가이드
```

## 시작하기

### 요구 사항

- Node.js 20+
- (실기기 테스트) [Expo Go](https://expo.dev/go) 앱

### 설치 및 실행

```bash
npm install
npx expo start
```

- 실기기: 터미널의 QR 코드를 Expo Go로 스캔
- 웹: 터미널에서 `w` 입력

### 환경 변수

`.env`에 Supabase 접속 정보를 설정합니다. anon key는 RLS를 전제로 한 공개용 키입니다.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### 백엔드 설정 (새 Supabase 프로젝트 사용 시)

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. 대시보드 **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 실행
3. `.env`에 프로젝트 URL과 anon key 입력

## 개발

```bash
npm test          # Jest 단위 테스트 (혼잡도 · 추천 로직 · 데이터 무결성)
npm run lint      # ESLint
npx tsc --noEmit  # 타입 체크
```

## 배포

EAS 빌드 프로필(`eas.json`)과 앱 식별자(`com.hyungunoh.soom`)가 설정되어 있습니다.

```bash
npx eas-cli login && npx eas-cli init                        # 최초 1회
npx eas-cli build --profile preview --platform android       # 내부 테스트용 APK
npx eas-cli build --profile production --platform all        # 스토어 제출용
```

Android 스토어 빌드의 Google Maps API 키 설정 등 전체 절차는
[`docs/배포-가이드.md`](docs/배포-가이드.md)를 참고하세요.

## 문서

- [`CLAUDE.md`](CLAUDE.md) — 서비스 개요 · 디자인 시스템 · 화면 구조(IA) · 코딩 규칙
- [`docs/기획서.md`](docs/기획서.md) — PM 기획 문서
- [`docs/배포-가이드.md`](docs/배포-가이드.md) — EAS 빌드/배포 절차
