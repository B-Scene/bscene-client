import type { EnterLiveResponse } from "@/types/live/live";

export type BandLiveScreen =
  | "home"
  | "liveNowList"
  | "scheduledList"
  | "room"
  | "members"
  | "chat"
  | "endConfirm"
  | "ended"
  | "instantForm"
  | "reserveForm"
  | "editForm"
  | "cancelConfirm";

export type LiveFormMode = "instant" | "reserve" | "edit";

export type GoLiveScreen = (screen: BandLiveScreen) => void;

export type LiveCard = {
  id: number;
  title: string;
  subtitle: string;
  listeners?: string;
  imageUrl?: string | null;
  isMine?: boolean;
};

export type ScheduledLiveCardData = {
  id: number;
  title: string;
  bandName: string;
  scheduledAt: string;
  isMine: boolean;
  imageUrl?: string | null;
  coHostUserIds?: number[];
};

export type ChatMessage = {
  id: number;
  senderId?: number;
  sender: string;
  message: string;
  time: string;
  highlighted?: boolean;
  clientMsgId?: string | null;
  serverMessageId?: string | null;
  senderProfileImageUrl?: string | null;
  pending?: boolean;
};

export type Member = {
  id: number;
  name: string;
  role: string;
};

export type ActiveLive = EnterLiveResponse | null;