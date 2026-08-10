# B:Scene Client

B:Scene은 인디 밴드와 팬, 밴드와 세션을 연결하는 음악 특화 모바일 플랫폼입니다. 팬은 좋아하는 밴드의 공연과 라이브 소식을 놓치지 않고 확인할 수 있고, 밴드는 공연 홍보, 라이브 소통, 세션 모집을 한 공간에서 진행할 수 있습니다.

## 프로젝트 소개

밴드 음악을 좋아하는 팬과 활동 중인 밴드가 더 자연스럽게 만날 수 있도록 돕는 프론트엔드 프로젝트입니다.

- 팬은 관심 장르와 지역을 기반으로 밴드, 공연, 라이브 정보를 탐색합니다.
- 밴드는 라이브를 개설하고 팬과 실시간으로 소통합니다.
- 밴드는 필요한 세션을 모집하고, 세션 지원자는 공고를 확인해 지원할 수 있습니다.

## B:Scene Member

<table align="center">
  <tr align="center">
    <td style="min-width: 150px;">
      <a href="https://github.com/kinjaebeom">
        <img width="160" height="160" alt="재범 프로필" src="https://github.com/kinjaebeom.png" />
        <br />
        <b>재범</b>
        <br />
        <sub>@kinjaebeom</sub>
      </a>
    </td>
    
  <td style="min-width: 150px;">
      <a href="https://github.com/yangyangeeee">
        <img width="160" height="160" alt="서윤 프로필" src="https://github.com/yangyangeeee.png" />
        <br />
        <b>서윤</b>
        <br />
        <sub>@yangyangeeee</sub>
      </a>
    </td>

   <td style="min-width: 150px;">
      <a href="https://github.com/Hyobee02">
        <img width="160" height="160" alt="효비 프로필" src="https://github.com/Hyobee02.png" />
        <br />
        <b>효비</b>
        <br />
        <sub>@Hyobee02</sub>
      </a>
    </td>

   <td style="min-width: 150px;">
      <a href="https://github.com/ysys3535">
        <img width="160" height="160" alt="윤서 프로필" src="https://github.com/ysys3535.png" />
        <br />
        <b>윤서</b>
        <br />
        <sub>@ysys3535</sub>
      </a>
    </td>

  </tr>
</table>

| 역할 | 담당 영역 |
| --- | --- |
| 재범 | 폴더구조 및 라우팅 설정, 밴드모드 라이브, 세션 모집 비즈니스 로직 |
| 효비 | 디자인 토큰, 로그인 및 온보딩, 팬모드 라이브 |
| 윤서 | 공통 컴포넌트, 팬모드 홈, 탐색, 마이페이지 |
| 서윤 | 공통 레이아웃, 밴드모드 홈, 밴드 마이페이지, 공연 관련 화면 |

## 기술 스택

## 기술 스택

프론트엔드는 **React, TypeScript, Vite** 기반으로 개발하고 있으며, 모바일 환경에서 팬 모드와 밴드 모드가 자연스럽게 전환되는 구조를 목표로 구현했습니다.  
API 연동, 서버 상태 관리, 전역 상태 관리, 라우팅, 스타일링, 코드 품질 관리를 각각 역할에 맞는 기술로 분리해 적용했습니다.

### Front-end

- **React**  
  컴포넌트 기반 UI 라이브러리입니다.  
  B:Scene에서는 팬 모드, 밴드 모드, 라이브, 세션, 마이페이지 등 화면을 기능 단위 컴포넌트로 나누어 구현했습니다. 공통 버튼, 모달, 바텀시트, 헤더, 카드 컴포넌트를 분리해 반복되는 UI를 재사용할 수 있도록 구성했습니다.

- **React DOM**  
  React 컴포넌트를 실제 브라우저 DOM에 렌더링하기 위한 라이브러리입니다.  
  Vite 환경에서 React 앱을 브라우저에 마운트하고, 전체 페이지 UI가 동작할 수 있도록 사용했습니다.

- **TypeScript**  
  JavaScript에 정적 타입을 추가해 코드 안정성을 높이는 언어입니다.  
  API 응답 타입, 컴포넌트 props, 라이브 채팅 메시지, 세션 지원서, 밴드/팬 프로필 데이터 등을 타입으로 정의해 데이터 구조를 명확하게 관리했습니다. 이를 통해 개발 중 잘못된 데이터 접근이나 props 전달 오류를 줄였습니다.

- **Vite**  
  빠른 개발 서버와 빌드 환경을 제공하는 프론트엔드 빌드 도구입니다.  
  B:Scene에서는 React + TypeScript 프로젝트의 개발 서버 실행, 프로덕션 빌드, 환경변수 주입, 플러그인 설정을 위해 사용했습니다.

- **@vitejs/plugin-react**  
  Vite에서 React를 사용할 수 있도록 지원하는 공식 플러그인입니다.  
  JSX 변환과 React Fast Refresh를 통해 개발 중 수정 사항을 빠르게 확인할 수 있도록 적용했습니다.

### Styling

- **Tailwind CSS**  
  유틸리티 클래스 기반 CSS 프레임워크입니다.  
  B:Scene에서는 모바일 앱 형태의 UI를 빠르게 구현하기 위해 사용했습니다. 색상, 간격, 폰트, radius, 레이아웃을 Tailwind class로 관리하고, 팬 모드와 밴드 모드의 UI 톤을 일관되게 유지했습니다.

- **@tailwindcss/vite**  
  Tailwind CSS를 Vite 빌드 파이프라인에 연결하기 위한 플러그인입니다.  
  Vite 환경에서 Tailwind 스타일이 정상적으로 빌드되고 적용될 수 있도록 설정했습니다.

### Routing

- **React Router DOM**  
  React 앱에서 페이지 이동과 라우팅을 관리하는 라이브러리입니다.  
  로그인, 온보딩, 팬 모드 홈, 팬 탐색, 팬 라이브, 밴드 홈, 밴드 라이브, 세션, 마이페이지 등 주요 화면 경로를 관리하는 데 사용했습니다. 사용자 모드에 따라 팬/밴드 화면으로 이동하는 흐름도 라우팅 구조 안에서 처리했습니다.

### Data Fetching & State Management

- **Axios**  
  HTTP API 요청을 처리하는 라이브러리입니다.  
  B:Scene에서는 백엔드 API 요청을 위한 공통 Axios 인스턴스를 구성하고, access token 자동 첨부, 401 응답 시 refresh token 기반 토큰 재발급, 요청 재시도 로직을 처리했습니다.

- **TanStack Query**  
  서버 상태를 관리하고 캐싱하는 라이브러리입니다.  
  팬/밴드 프로필, 라이브 목록, 세션 모집 공고, 지원서 목록, 알림 데이터처럼 서버에서 받아오는 데이터를 관리하는 데 사용했습니다. 로딩 상태, 에러 상태, refetch, mutation 처리 등을 TanStack Query 기반으로 구성했습니다.

- **Zustand**  
  가볍고 단순한 전역 상태 관리 라이브러리입니다.  
  B:Scene에서는 현재 사용자 모드, 로그인 사용자 정보, 화면 전환에 필요한 클라이언트 상태처럼 여러 페이지에서 공유되는 값을 관리하는 데 사용했습니다.

### 협업 및 품질 관리

- **ESLint**  
  코드 스타일과 문법 오류를 검사하는 정적 분석 도구입니다.  
  프로젝트 전반에서 일관된 코드 스타일을 유지하고, 사용하지 않는 변수나 기본적인 문법 오류를 사전에 확인하기 위해 사용했습니다.

- **CodeRabbit**  
  Pull Request 기반 AI 코드 리뷰 도구입니다.  
  PR마다 변경된 코드의 잠재적 문제, 개선 가능한 구조, 유지보수성 이슈를 자동으로 검토하는 데 사용했습니다. 팀원들은 CodeRabbit 리뷰를 참고해 코드 품질을 개선하고, 필요한 부분을 반영했습니다.

- **Git / GitHub**  
  버전 관리와 협업을 위한 도구입니다.  
  `main`, `develop`, 작업 브랜치를 기준으로 브랜치를 나누고, Pull Request를 통해 기능을 병합하는 방식으로 협업했습니다. Issue와 PR을 활용해 작업 단위, 구현 내용, 리뷰 과정을 관리했습니다.

### Real-time & Media

- **WebSocket / STOMP**  
  실시간 양방향 통신을 위한 기술입니다.  
  B:Scene에서는 라이브 채팅, 라이브 입장/퇴장 상태, 실시간 이벤트 처리를 위해 도입을 고려했습니다. 실시간 채팅과 라이브 상태 변경처럼 서버와 클라이언트가 즉시 데이터를 주고받아야 하는 기능에 활용할 수 있습니다.

- **WebRTC**  
  브라우저 간 실시간 오디오, 비디오, 데이터 통신을 가능하게 하는 기술입니다.  
  B:Scene에서는 오디오 라이브 송수신 기능 구현을 위해 백엔드 및 인프라 준비 상황에 맞춰 단계적으로 도입을 고려했습니다. 밴드가 라이브를 송출하고 팬이 실시간으로 청취하는 흐름에 활용될 수 있습니다.

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

프로젝트 루트에 `.env` 파일을 직접 생성하고 아래 값을 설정합니다. Vite에서 클라이언트 환경변수로 사용하려면 변수명은 반드시 `VITE_`로 시작해야 합니다.

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

브랜치명은 아래 형식을 따릅니다.

```text
{type}/{scope}-{short-description}
```

- `type`은 소문자로 작성합니다.
- `scope`는 가능한 짧게 작성합니다. 예: `web`, `admin`, `api`, `auth`, `evaluation`
- `short-description`은 kebab-case로 작성합니다.
- 가능한 경우 한글과 지역 변수명은 사용하지 않고, 약어는 남발하지 않습니다.

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
feat/admin-evaluation-create
feat/login-page
fix/web-admin-rewrite
chore/web-add-admin-app-url
refactor/admin-api-client
hotfix/admin-login-redirect
```

Bad 예시:

```text
admin
feature-1
fix_login
프론트수정
bugFix-admin
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

## 현재 구현 상태

- GitHub Repository 연결 및 협업 환경 구성 완료
- React + TypeScript + Vite 기반 프론트엔드 개발 환경 구성 완료
- 팬 모드 / 밴드 모드 듀얼 모드 화면 구조 구현
- OAuth 로그인 및 온보딩 플로우 구현
- 팬모드 홈, 탐색, 라이브, 마이페이지 주요 화면 구현
- 밴드모드 홈, 라이브, 세션 모집/지원 관리, 마이페이지 주요 화면 구현
- Axios 인스턴스 기반 API 요청 구조 및 토큰 재발급 로직 구현
- TanStack Query 기반 서버 상태 관리 및 Mutation 처리 적용
- Zustand 기반 사용자 모드 및 클라이언트 전역 상태 관리 적용
- 공통 컴포넌트, 레이아웃, 하단 탭바, 모달, 바텀시트 구조 구현
- 모바일 중심 반응형 UI 및 PWA 환경 적용
- Pull Request 기반 협업 및 CodeRabbit 자동 코드 리뷰 적용
- README 프로젝트 소개, 기술 스택, 실행 방법, 컨벤션 문서화 완료
