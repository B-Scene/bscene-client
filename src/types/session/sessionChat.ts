export interface SessionChatApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type SessionChatContextType = "RECRUITMENT" | "SESSION_SEARCH";

export type SessionChatRoomFilter = "ALL" | "UNREAD";

export interface CreateSessionChatRoomRequest {
  contextType: SessionChatContextType;
  sessionRecruitmentId?: number;
  sessionApplicationId?: number;
  applicationSubmissionId?: number;
}

export interface CreateSessionChatRoomResponse {
  chatRoomId: number;
  contextType: SessionChatContextType;
  contextId: number;
  title: string;
  genre: string;
  part: string;
  recipientUserId: number;
  recipientName: string;
  created: boolean;
}

export interface SessionChatRoomListParams {
  filter?: SessionChatRoomFilter;
  cursorId?: number;
  size?: number;
}

export interface SessionChatRoomListItem {
  chatRoomId: number;
  contextType: SessionChatContextType;
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

export interface SessionChatRoomListResponse {
  content: SessionChatRoomListItem[];
  size: number;
  nextCursor: number | null;
  hasNext: boolean;
}