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
| 효비  | 공통 레이아웃, 디자인 토큰, 로그인 및 온보딩 |
| 윤서 | 팬모드 홈, 탐색, 마이페이지 |
| 재범 | 팬모드 라이브, 밴드모드 라이브, 세션 모집 비즈니스 로직 |
| 서윤 | 밴드모드 홈, 밴드 마이페이지, 공연 관련 화면 |

## 기술 스택

- React
- TypeScript
- Vite
- ESLint
- pnpm

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
- `feature/chore/fix` 브랜치: 기능 및 작업 단위 브랜치

브랜치명은 아래 형식을 따릅니다.

```text
{type}/{scope}-{short-description}
```

예시:

```text
feat/live-room
feat/session-feed
chore/project-structure
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
```

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

## 실행 방법

패키지를 설치합니다.

```bash
pnpm install
```

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
- README 프로젝트 설명 문서 작성 완료
