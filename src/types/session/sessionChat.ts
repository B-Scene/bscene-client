export interface SessionChatApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type ChatRoomContextType = "RECRUITMENT" | "SESSION_SEARCH";

export type ChatRoomListFilter = "ALL" | "UNREAD";

export type SessionChatRoomFilter = ChatRoomListFilter;

export interface CreateChatRoomRequest {
  contextType: ChatRoomContextType;
  sessionRecruitmentId?: number;
  sessionApplicationId?: number;
  applicationSubmissionId?: number;
}

export interface CreateChatRoomResponse {
  chatRoomId: number;
  contextType: ChatRoomContextType;
  contextId: number;
  title: string;
  genre: string;
  part: string;
  recipientUserId: number;
  recipientName: string;
  created: boolean;
}

export interface ChatRoomsParams {
  filter?: ChatRoomListFilter;
  cursorId?: number;
  size?: number;
}

export interface ChatRoomListItem {
  chatRoomId: number;
  contextType: ChatRoomContextType;
  contextId: number;
  counterpartUserId: number;
  counterpartName: string;
  counterpartProfileImageUrl: string | null;
  applicationStatus: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  canSend: boolean;
}

export type SessionChatRoomListItem = ChatRoomListItem;

export interface ChatRoomsResponse {
  content: ChatRoomListItem[];
  size: number;
  nextCursor: number | null;
  hasNext: boolean;
}

export type SessionChatRoomsResponse = ChatRoomsResponse;

export interface ChatRoomDetailParams {
  cursorId?: number;
  size?: number;
}

export interface ChatMessageItem {
  chatMessageId: number;
  senderUserId: number;
  senderName: string;
  content: string;
  isMine: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoomDetailResponse {
  chatRoomId: number;
  contextType: ChatRoomContextType;
  sessionApplicationId: number | null;
  sessionRecruitmentId: number | null;
  applicationSubmissionId: number | null;
  opponentUserId: number;
  opponentName: string;
  opponentProfileImageUrl: string | null;
  part: string;
  genre: string;
  region: string;
  canSend: boolean;
  messages: ChatMessageItem[];
  size: number;
  nextCursor: number | null;
  hasNext: boolean;
}

export type SessionChatRoomDetailResponse = ChatRoomDetailResponse;

export interface ChatWebSocketTicketResponse {
  ticket: string;
  subprotocol: string;
  expiresIn: number;
}

export interface DirectMessageSendPayload {
  chatRoomId: number;
  content: string;
}

export interface DirectMessageReadPayload {
  chatRoomId: number;
  lastReadMessageId: number;
}

export interface DirectMessageData {
  chatMessageId: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  profileImageUrl: string | null;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface DirectMessageReadData {
  chatRoomId: number;
  readerId: number;
  lastReadMessageId: number;
  readAt: string;
}

export interface DirectMessageErrorData {
  code: string;
  message: string;
}

export interface DirectMessageSendFrame {
  type: "dm.send";
  data: DirectMessageSendPayload;
  clientMsgId: string;
}

export interface DirectMessageReadFrame {
  type: "dm.read";
  data: DirectMessageReadPayload;
  clientMsgId: null;
}

export interface DirectMessagePingFrame {
  type: "ping";
  data: Record<string, never>;
  clientMsgId: null;
}

export interface DirectMessagePushFrame {
  type: "dm.message";
  id: number;
  data: DirectMessageData;
  clientMsgId: string | null;
  timeStamp: string;
}

export interface DirectMessageReadPushFrame {
  type: "dm.read";
  id: null;
  data: DirectMessageReadData;
  clientMsgId: null;
  timeStamp: string;
}

export interface DirectMessagePongFrame {
  type: "pong";
  id: null;
  data: Record<string, never>;
  clientMsgId: null;
  timeStamp: string;
}

export interface DirectMessageSystemEventFrame {
  type: "system.event";
  id: null;
  data: {
    event: string;
  };
  clientMsgId: null;
  timeStamp: string;
}

export interface DirectMessageErrorFrame {
  type: "system.error";
  id: null;
  data: DirectMessageErrorData;
  clientMsgId: string | null;
  timeStamp: string;
}

export type DirectMessageClientFrame =
  | DirectMessageSendFrame
  | DirectMessageReadFrame
  | DirectMessagePingFrame;

export type DirectMessageServerFrame =
  | DirectMessagePushFrame
  | DirectMessageReadPushFrame
  | DirectMessagePongFrame
  | DirectMessageSystemEventFrame
  | DirectMessageErrorFrame;