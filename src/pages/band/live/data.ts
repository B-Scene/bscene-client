import type { ChatMessage, LiveCard, Member } from "./types";

export const liveCards: LiveCard[] = [
  {
    id: 1,
    title: "내 라이브 진행 중",
    subtitle: "라이브 제목 영역",
    listeners: "68명 청취 중",
  },
  {
    id: 2,
    title: "다른 밴드명",
    subtitle: "라이브 제목 영역",
    listeners: "68명 청취 중",
  },
];

export const initialChatMessages: ChatMessage[] = [
  { id: 1, sender: "최준우", message: "라이브 자주 해주세요!!", time: "20:34" },
  {
    id: 2,
    sender: "WAVY",
    message: "여러분 감사합니다!\n신곡은 다음 달 공개 예정이에요!",
    time: "20:33",
    highlighted: true,
  },
  { id: 3, sender: "한아영", message: "노래 너무 좋아요!!", time: "20:32" },
  { id: 4, sender: "최진우", message: "신곡 발매 언제하나요?", time: "20:32" },
];

export const members: Member[] = [
  { id: 1, name: "닉네임", role: "밴드 · 파트 · 리더" },
  { id: 2, name: "닉네임", role: "밴드 · 파트" },
  { id: 3, name: "닉네임", role: "밴드 · 파트" },
  { id: 4, name: "닉네임", role: "밴드 · 파트" },
  { id: 5, name: "닉네임", role: "밴드 · 파트" },
];
