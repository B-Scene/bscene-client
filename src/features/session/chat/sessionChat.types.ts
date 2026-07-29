export type MessageDirection = "received" | "sent";

export interface ChatMessage {
  id: number;
  direction: MessageDirection;
  content: string;
  time: string;
  isRead?: boolean;
}

export interface ChatLocationState {
  senderName?: string;
  profileImageUrl?: string;
}
