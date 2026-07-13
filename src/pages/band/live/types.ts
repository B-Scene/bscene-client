export type BandLiveScreen =
  | "home"
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
};

export type ChatMessage = {
  id: number;
  sender: string;
  message: string;
  time: string;
  highlighted?: boolean;
};

export type Member = {
  id: number;
  name: string;
  role: string;
};
