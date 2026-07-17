# B:Scene Client

B:Scene은 인디 밴드와 팬, 밴드와 세션을 연결하는 음악 특화 모바일 플랫폼입니다. 팬은 좋아하는 밴드의 공연과 라이브 소식을 놓치지 않고 확인할 수 있고, 밴드는 공연 홍보, 라이브 소통, 세션 모집을 한 공간에서 진행할 수 있습니다.

## 프로젝트 소개

밴드 음악을 좋아하는 팬과 활동 중인 밴드가 더 자연스럽게 만날 수 있도록 돕는 프론트엔드 프로젝트입니다.

- 팬은 관심 장르와 지역을 기반으로 밴드, 공연, 라이브 정보를 탐색합니다.
- 밴드는 라이브를 개설하고 팬과 실시간으로 소통합니다.
- 밴드는 필요한 세션을 모집하고, 세션 지원자는 공고를 확인해 지원할 수 있습니다.

## 팀원 및 프론트엔드 역할 분담

| 역할 | 담당 영역 |
| --- | --- |
| 효비 | 공통 레이아웃, 디자인 토큰, 로그인 및 온보딩 |
| 윤서 | 팬모드 홈, 탐색, 마이페이지 |
| 재범 | 팬모드 라이브, 밴드모드 라이브, 세션 모집 비즈니스 로직 |
| 서윤 | 밴드모드 홈, 밴드 마이페이지, 공연 관련 화면 |

## 기술 스택

> 버전은 `package.json`에 명시된 버전을 기준으로 작성합니다.

### Front-end

- **React 19.2.7**: 컴포넌트 기반 UI 개발을 위해 사용합니다. 팬 모드와 밴드 모드의 화면을 기능 단위로 분리하여 재사용성과 유지보수성을 높입니다.
- **React DOM 19.2.7**: React 컴포넌트를 브라우저 DOM에 렌더링하기 위해 사용합니다.
- **TypeScript 6.0.2**: 정적 타입을 기반으로 컴파일 단계에서 오류를 줄이고, API 응답 데이터와 컴포넌트 props 타입을 명확하게 관리합니다.
- **Vite 8.1.0**: 빠른 개발 서버 실행과 빌드 속도를 위해 사용합니다.
- **@vitejs/plugin-react 6.0.2**: Vite 환경에서 React Fast Refresh와 JSX 변환을 지원하기 위해 사용합니다.

### Styling

- **Tailwind CSS 4.3.1**: 유틸리티 클래스 기반으로 모바일 중심 UI를 빠르게 구현하고, 공통 색상, 간격, radius, typography를 일관되게 관리합니다.
- **@tailwindcss/vite 4.3.1**: Vite에서 Tailwind CSS를 빌드 파이프라인에 연결하기 위해 사용합니다.

### Routing

- **React Router DOM 7.18.1**: 로그인, 온보딩, 팬 모드, 밴드 모드, 라이브, 세션, 마이페이지 등 페이지 간 이동을 관리합니다.

### Data Fetching & State Management

- **Axios 1.18.1**: API 요청과 응답 인터셉터를 관리하고, 토큰 재발급 등 공통 HTTP 로직을 처리합니다.
- **TanStack Query 5.101.2**: 서버 상태 캐싱, 로딩/에러 상태, 재요청 관리를 위해 사용합니다.
- **Zustand 5.0.14**: 사용자 모드, 로그인 상태, 필터 조건처럼 여러 페이지에서 공유되는 클라이언트 상태 관리를 위해 사용합니다.

### Validation

- **Zod 4.4.3**: 폼 입력값과 API 응답 데이터의 유효성 검증을 위해 사용합니다.

### 협업 및 품질 관리

- **ESLint 10.5.0**: 코드 스타일을 통일하고 기본적인 문법 오류를 사전에 방지하기 위해 사용합니다.
- **CodeRabbit**: Pull Request 기반 자동 코드 리뷰를 통해 코드 품질, 잠재적 버그, 유지보수성 문제를 점검합니다.
- **Git / GitHub**: `main`, `develop`, 작업 브랜치를 기준으로 Pull Request 기반 협업을 진행합니다.

### 추후 연동 예정

- **WebSocket / STOMP**: 실시간 채팅, 라이브 입장/퇴장 상태, 라이브 진행 상태 변경 이벤트 처리를 위해 도입을 고려합니다.
- **WebRTC**: 오디오 라이브 송수신 기능 구현을 위해 백엔드/인프라 준비 상황에 맞춰 단계적으로 도입을 고려합니다.

## 개발 환경

| 항목 | 권장 버전 | 확인 명령어 |
| --- | --- | --- |
| Node.js | 22.19.0 | `node -v` |
| pnpm | 11.7.0 | `pnpm -v` |

Node.js와 pnpm 버전을 맞춘 뒤 의존성을 설치합니다.

```bash
pnpm install
```

## 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정합니다. Vite에서 클라이언트 환경변수로 사용하려면 변수명은 반드시 `VITE_`로 시작해야 합니다.

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_OAUTH_REDIRECT_URL=http://localhost:5173/oauth/callback
VITE_OAUTH_SIGNUP_REDIRECT_URL=http://localhost:5173/oauth/signup
```

| 변수명 | 설명 |
| --- | --- |
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소입니다. Axios 인스턴스와 OAuth 요청에 사용합니다. |
| `VITE_OAUTH_REDIRECT_URL` | OAuth 로그인 완료 후 이동할 프론트엔드 리다이렉트 주소입니다. |
| `VITE_OAUTH_SIGNUP_REDIRECT_URL` | OAuth 회원가입 완료 후 이동할 프론트엔드 리다이렉트 주소입니다. |

## 실행 방법

개발 서버를 실행합니다.

```bash
pnpm dev
```

빌드를 확인합니다.

```bash
pnpm build
```

린트를 실행합니다.

```bash
pnpm lint
```

## 폴더 구조

```text
src/
  app/

  pages/
    auth/
    onboarding/

    fan/
      home/
      explore/
      live/
      my/

    band/
      home/
      live/
      session/
      my/

    not-found/

  components/
    common/
      Button/
      Input/
      Modal/
      Select/
      Toast/
      EmptyState/
      Loading/

    layout/
      MobileLayout/
      BottomNavBar/
      Header/
      PageContainer/

  features/
    auth/
    user/
    band/
    live/
    session/
    performance/
    follow/
    notification/

  api/
  hooks/
  stores/
  types/
  constants/

  assets/
    icons/
    images/

  styles/
  utils/
```

## 브랜치, 커밋, PR 컨벤션

### 브랜치 전략

- `main`: 배포 및 최종 병합 브랜치
- `develop`: 개발 통합 브랜치
- 작업 브랜치: 기능, 수정, 리팩토링 등 작업 단위로 생성하는 브랜치

브랜치명은 작업 목적이 한눈에 보이도록 아래 형식을 따릅니다.

```text
{type}/{scope}-{short-description}
```

- `type`은 소문자로 작성합니다.
- `scope`는 가능한 짧게 작성합니다. 예: `fan`, `band`, `live`, `session`, `auth`, `common`, `api`
- `short-description`은 kebab-case로 작성합니다.
- 가능한 경우 한글과 지역 변수명은 사용하지 않고, 약어는 남발하지 않습니다.
- 예를 들어 `feat/band-live`는 `type=feat`, `scope=band`, `short-description=live`인 작업 브랜치입니다.

사용 가능한 `type`은 아래와 같습니다.

| type | 설명 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `chore` | 설정, 빌드, 패키지 등 기능 외 작업 |
| `refactor` | 동작 변경 없는 코드 구조 개선 |
| `hotfix` | 긴급 수정 |
| `docs` | 문서 수정 |

Good 예시:

```text
feat/band-live
feat/band-session
feat/fan-home
fix/band-live-modal
chore/project-structure
refactor/live-api-client
hotfix/auth-login-redirect
```

Bad 예시:

```text
band
feature-1
fix_login
프론트수정
bugFix-band
Feat/band_live
```

### 커밋 메시지

팀 PR 스타일에 맞춰 아래 형식을 사용합니다.

```text
[Type] 작업 내용
```

예시:

```text
[Feat] 라이브 목록 화면 구현
[Fix] 라이브 채팅 입력 오류 수정
[Chore] 프로젝트 폴더 구조 정리
[Docs] README 기술 스택 보완
```

### Issue Convention

이슈 제목은 아래 형식을 사용합니다.

```text
[Type] 작업 내용
```

예시:

```text
[Feat] 밴드 라이브 시작 화면 구현
[Fix] OAuth 리다이렉트 오류 수정
[Docs] 브랜치 컨벤션 문서 보완
```

이슈 본문에는 아래 내용을 포함합니다.

- 작업 페이지 또는 관련 영역
- 작업 상세 내용
- 완료 조건 체크리스트
- 참고 자료 또는 특이사항

### PR 규칙

- `main` 또는 `develop` 브랜치에 직접 push하지 않습니다.
- 작업 브랜치에서 `develop` 브랜치로 Pull Request를 생성합니다.
- PR 제목은 커밋 메시지와 동일한 형식을 사용합니다.
- 최소 2명의 코드 리뷰 Approve 이후 merge합니다.

PR 본문 예시:

```md
## ❓ 작업 페이지
팬모드 라이브

## ✅ 작업 상세 내용
- [x] 라이브 목록 UI 구현
- [x] 팔로우한 밴드 / 전체 밴드 탭 구성
- [x] 라이브 없음 empty state 처리

## 🗣 특이사항
- API 연동 전까지 mock data를 사용합니다.
```

## 화면 목록 및 플로우

### 공통

- 인증 화면
- 온보딩 화면
- 하단 탭 레이아웃
- 404 not found 화면

### 팬모드

1. 홈에서 추천 밴드, 공연, 라이브 정보를 확인합니다.
2. 탐색 화면에서 장르와 지역 기반으로 밴드 및 공연을 찾습니다.
3. 라이브 화면에서 현재 진행 중인 라이브와 예정된 라이브를 확인합니다.
4. 라이브 방에 입장해 오디오 라이브를 듣고 실시간 채팅에 참여합니다.
5. 마이페이지에서 팔로우, 알림, 계정 정보를 관리합니다.

### 밴드모드

1. 홈에서 밴드 활동 요약과 주요 알림을 확인합니다.
2. 라이브 화면에서 오디오 라이브를 시작하거나 예정된 라이브를 관리합니다.
3. 라이브 방에서 팬 채팅을 확인하고 라이브를 종료합니다.
4. 세션 화면에서 모집 공고를 등록하고 지원자를 확인합니다.
5. 마이페이지에서 밴드 프로필과 활동 정보를 관리합니다.

## 현재 세팅 상태

- GitHub Repository 연결 완료
- React + TypeScript + Vite 초기 세팅 완료
- `.gitignore` 설정 완료
- 기본 폴더 구조 정리 완료
- README 프로젝트 설명 및 컨벤션 문서화 완료
