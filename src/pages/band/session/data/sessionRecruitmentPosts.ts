import type {
  SessionFilterGroup,
  SessionFilterValues,
  SessionRecruitmentPost,
  SessionTabItem,
} from "../types";

export const SESSION_TABS: SessionTabItem[] = [
  { id: "recruitment", label: "세션 모집" },
  { id: "find", label: "세션 찾기" },
  { id: "applications", label: "내 지원서" },
];

export const SESSION_FILTERS = ["파트", "실력대", "장르", "지역"] as const;

export const INITIAL_SESSION_FILTERS: SessionFilterValues = {
  part: "드럼",
  skill: "중급",
  genre: "전체",
  region: "서울",
};

export const SESSION_FILTER_GROUPS: SessionFilterGroup[] = [
  {
    id: "part",
    title: "파트",
    options: ["전체", "보컬", "기타", "베이스", "키보드", "드럼", "etc."],
  },
  {
    id: "skill",
    title: "실력대",
    options: ["전체", "입문", "중급", "상급"],
  },
  {
    id: "genre",
    title: "장르",
    options: ["전체", "록", "인디팝", "펑크", "메탈", "재즈", "블루스", "R&B", "어쿠스틱", "포크"],
  },
  {
    id: "region",
    title: "지역",
    options: [
      "전체",
      "서울",
      "경기",
      "인천",
      "부산",
      "대구",
      "광주",
      "대전",
      "울산",
      "세종",
      "충남",
      "충북",
      "전남",
      "전북",
      "경남",
      "경북",
      "강원",
      "제주",
    ],
  },
];

export const sessionRecruitmentPosts: SessionRecruitmentPost[] = [
  {
    id: 1,
    deadline: "D-18",
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디록",
    location: "서울 마포구",
    description: "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    tags: ["드럼", "중급"],
    practiceSchedule: "매주 토요일 18:00",
    practiceLocation: "서울 마포구 합주실",
    deadlineDate: "2026.05.24. (금)",
    deadlineTime: "20:00",
    qualification: "라이브와 앨범 작업 경험이 있는 드러머를 우대합니다. 장기적으로 함께 활동할 수 있는 분이면 좋아요.",
    bookmarked: true,
  },
  {
    id: 2,
    deadline: "D-18",
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디록",
    location: "서울 마포구",
    description: "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    tags: ["드럼", "중급"],
    practiceSchedule: "평일 저녁 협의",
    practiceLocation: "서울 마포구 합주실",
    deadlineDate: "2026.05.24. (금)",
    deadlineTime: "20:00",
    qualification: "밴드 합주 경험이 있고 정기 연습에 참여 가능한 드러머를 찾습니다.",
    bookmarked: false,
  },
  {
    id: 3,
    deadline: "D-18",
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디록",
    location: "서울 마포구",
    description: "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    tags: ["드럼", "중급"],
    practiceSchedule: "주 1회 정기 합주",
    practiceLocation: "서울 마포구 합주실",
    deadlineDate: "2026.05.24. (금)",
    deadlineTime: "20:00",
    qualification: "공연 준비와 녹음 작업을 함께할 수 있는 분을 선호합니다.",
    bookmarked: false,
  },
];
