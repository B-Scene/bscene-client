import type { ChatMessage } from "./sessionChat.types";

export const INITIAL_SESSION_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    direction: "received",
    content:
      "혹시 아직 드럼 세션 구하시나요?\n밴드 팀원이 되고 싶어서 연락드립니다.",
    time: "10:00",
  },
  {
    id: 2,
    direction: "sent",
    content:
      "안녕하세요! 지원해주셔서 감사합니다.\n아직 팀원 모집을 마감하지 않아서 지원가능합니다.\n팀원들과 상의 후 연락드리겠습니다.",
    time: "10:00",
  },
  {
    id: 3,
    direction: "received",
    content: "감사합니다!",
    time: "10:00",
  },
];
