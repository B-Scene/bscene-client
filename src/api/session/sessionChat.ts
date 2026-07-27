import { axiosInstance } from "@/api/axiosInstance";
import type {
  CreateSessionChatRoomRequest,
  CreateSessionChatRoomResponse,
  SessionChatApiResponse,
  SessionChatRoomListParams,
  SessionChatRoomListResponse,
} from "@/types/session/sessionChat";

const removeEmptyParams = (
  params: SessionChatRoomListParams,
) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "",
    ),
  );
};

export const createSessionChatRoom = async (
  body: CreateSessionChatRoomRequest,
) => {
  const { data } = await axiosInstance.post<
    SessionChatApiResponse<CreateSessionChatRoomResponse>
  >("/chat/rooms", body);

  return data.result;
};

export const getSessionChatRooms = async (
  params: SessionChatRoomListParams = {},
) => {
  const { data } = await axiosInstance.get<
    SessionChatApiResponse<SessionChatRoomListResponse>
  >("/chat/rooms", {
    params: removeEmptyParams(params),
  });

  return data.result;
};