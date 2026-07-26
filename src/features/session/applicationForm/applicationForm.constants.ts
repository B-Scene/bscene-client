// src/features/session/applicationForm/applicationForm.constants.ts

import type { SessionApplicationDraft } from "@/features/session/applicationForm/applicationForm.types";

export const PART_OPTIONS = [
  "보컬",
  "기타",
  "베이스",
  "키보드",
  "드럼",
  "etc.",
];

export const SKILL_LEVEL_OPTIONS = [
  "입문",
  "중급",
  "상급",
];

export const GENRE_OPTIONS = [
  "인디",
  "팝",
  "팝록",
  "재즈",
  "블루스",
  "얼터너티브록",
  "사이키델릭록",
  "일렉트로닉록",
  "포크록",
  "펑크록",
  "하드록",
  "메탈",
  "etc.",
];

export const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "대전",
  "세종",
  "충북",
  "충남",
  "대구",
  "경북",
  "부산",
  "울산",
  "경남",
  "광주",
  "전북",
  "전남",
  "제주",
];

export const ACTIVITY_OPTIONS = [
  "정기 합주",
  "경연",
  "라이브 공연",
  "멤버 전환",
  "앨범 및 음원 작업",
];

export const INPUT_CLASS_NAME =
  "h-[30px] w-full rounded-[5px] border border-neutral-400 bg-neutral-0 px-4 text-caption2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-secondary-500";

export const createInitialApplicationForm =
  (): SessionApplicationDraft => ({
    applicationType: "",
    title: "",
    shortIntroduction: "",
    introduction: "",
    part: "",
    skillLevel: "",
    genre: "",
    region: "",
    activities: [],
    experiences: [],
    portfolioLinks: [""],
  });