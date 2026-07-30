// src/features/session/applicationHistory/applicationHistory.mock.ts

import type {
  ApplicationHistoryItem,
  RecruitmentHistoryItem,
} from "./applicationHistory.types";

export const INITIAL_APPLICATION_HISTORY: ApplicationHistoryItem[] = [
  {
    id: 1,
    status: "completed",
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    appliedAgo: "2일 전 지원",
    viewedAt: "7월 8일 열람",
    canMessage: true,
    canViewApplication: true,
    canCancel: true,
  },
  {
    id: 2,
    status: "accepted",
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    appliedAgo: "2일 전 지원",
    viewedAt: "7월 8일 열람",
    canMessage: true,
  },
  {
    id: 3,
    status: "rejected",
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    appliedAgo: "2일 전 지원",
    viewedAt: "7월 8일 열람",
  },
  {
    id: 4,
    status: "canceled",
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    appliedAgo: "2일 전 지원",
  },
];

export const INITIAL_SCRAP_HISTORY: RecruitmentHistoryItem[] = [
  {
    id: 101,
    deadlineLabel: "D-18",
    isClosed: false,
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디",
    region: "서울",
    viewedAgo: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    part: "드럼",
    skillLevel: "중급",
    bookmarked: true,
  },
  {
    id: 102,
    deadlineLabel: "D-18",
    isClosed: false,
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디",
    region: "서울",
    viewedAgo: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    part: "드럼",
    skillLevel: "중급",
    bookmarked: true,
  },
  {
    id: 103,
    deadlineLabel: "마감",
    isClosed: true,
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디",
    region: "서울",
    viewedAgo: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    part: "드럼",
    skillLevel: "중급",
    bookmarked: true,
  },
];

export const INITIAL_RECENT_HISTORY: RecruitmentHistoryItem[] = [
  {
    id: 201,
    deadlineLabel: "D-18",
    isClosed: false,
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디",
    region: "서울",
    viewedAgo: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    part: "드럼",
    skillLevel: "중급",
    bookmarked: true,
  },
  {
    id: 202,
    deadlineLabel: "D-18",
    isClosed: false,
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디",
    region: "서울",
    viewedAgo: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    part: "드럼",
    skillLevel: "중급",
    bookmarked: false,
  },
  {
    id: 203,
    deadlineLabel: "마감",
    isClosed: true,
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    genre: "인디",
    region: "서울",
    viewedAgo: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
    part: "드럼",
    skillLevel: "중급",
    bookmarked: false,
  },
];