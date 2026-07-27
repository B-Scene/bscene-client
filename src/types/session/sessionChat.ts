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