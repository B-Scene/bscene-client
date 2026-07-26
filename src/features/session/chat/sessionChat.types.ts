export type MessageDirection = "received" | "sent";

export interface ChatMessage {
  id: number;
  direction: MessageDirection;
  content: string;
  time: string;
}

export interface ChatLocationState {
  senderName?: string;
  profileImageUrl?: string;
}
