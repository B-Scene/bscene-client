import { axiosInstance } from "@/api/axiosInstance";
import type {
  ChatRoomDetailParams,
  ChatRoomDetailResponse,
  ChatRoomsParams,
  ChatRoomsResponse,
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  SessionChatApiResponse,
} from "@/types/session/sessionChat";

const removeEmptyParams = <T extends object>(params: T) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    }),
  );
};

export const createChatRoom = async (body: CreateChatRoomRequest) => {
  const { data } = await axiosInstance.post<
    SessionChatApiResponse<CreateChatRoomResponse>
  >("/chat/rooms", body);

  return data.result;
};

export const getChatRooms = async (params: ChatRoomsParams = {}) => {
  const { data } = await axiosInstance.get<
    SessionChatApiResponse<ChatRoomsResponse>
  >("/chat/rooms", {
    params: removeEmptyParams(params),
  });

  return data.result;
};

export const getChatRoomDetail = async (
  chatRoomId: number,
  params: ChatRoomDetailParams = {},
) => {
  const { data } = await axiosInstance.get<
    SessionChatApiResponse<ChatRoomDetailResponse>
  >(`/chat/rooms/${chatRoomId}`, {
    params: removeEmptyParams(params),
  });

  return data.result;
};