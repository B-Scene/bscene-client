export interface LiveChatTicketResponse {
  ticket: string;
  subprotocol: "live-chat.v1";
  expiresInSeconds: number;
}

export interface LiveChatSendFrame {
  type: "live-chat.send";
  data: {
    content: string;
  };
  clientMsgId: string;
}

export interface LiveChatPingFrame {
  type: "ping";
  data: Record<string, never>;
  clientMsgId: null;
}

export type LiveChatClientFrame = LiveChatSendFrame | LiveChatPingFrame;

export interface LiveChatMessageData {
  messageId: string;
  liveId: number;
  senderId: number;
  senderName: string;
  senderProfileImageUrl: string | null;
  content: string;
  sentAt: string;
}

export interface LiveChatMessageFrame {
  type: "live-chat.message";
  id: null;
  data: LiveChatMessageData;
  clientMsgId: string;
  timeStamp: string;
}

export interface LiveChatConnectedFrame {
  type: "system.event";
  id: null;
  data: {
    event: "connected";
  };
  clientMsgId: null;
  timeStamp: string;
}

export interface LiveChatEndedFrame {
  type: "system.event";
  id: null;
  data: {
    event: "live-ended";
  };
  clientMsgId: null;
  timeStamp: string;
}

export interface LiveChatPongFrame {
  type: "pong";
  id: null;
  data: Record<string, never>;
  clientMsgId: null;
  timeStamp: string;
}

export interface LiveChatErrorFrame {
  type: "system.error";
  id: null;
  data: {
    code: string;
    message: string;
  };
  clientMsgId: string | null;
  timeStamp: string;
}

export type LiveChatServerFrame =
  | LiveChatMessageFrame
  | LiveChatConnectedFrame
  | LiveChatEndedFrame
  | LiveChatPongFrame
  | LiveChatErrorFrame;

export type LiveChatConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";