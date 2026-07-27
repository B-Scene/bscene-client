import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChatRoom,
  getChatRoomDetail,
  getChatRooms,
} from "@/api/session/sessionChat";
import type {
  ChatRoomDetailParams,
  ChatRoomsParams,
  CreateChatRoomRequest,
} from "@/types/session/sessionChat";

export const sessionChatKeys = {
  all: ["sessionChat"] as const,

  rooms: () => [...sessionChatKeys.all, "rooms"] as const,

  roomList: (params: ChatRoomsParams) =>
    [...sessionChatKeys.rooms(), params] as const,

  detail: (chatRoomId: number, params: ChatRoomDetailParams) =>
    [...sessionChatKeys.all, "detail", chatRoomId, params] as const,
};

export const useCreateChatRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateChatRoomRequest) => createChatRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionChatKeys.rooms(),
      });
    },
  });
};

export const useCreateSessionChatRoomMutation =
  useCreateChatRoomMutation;

export const useChatRoomsQuery = (params: ChatRoomsParams = {}) => {
  return useQuery({
    queryKey: sessionChatKeys.roomList(params),
    queryFn: () => getChatRooms(params),
    staleTime: 1000 * 30,
  });
};

export const useSessionChatRoomsQuery = useChatRoomsQuery;

export const useChatRoomDetailQuery = (
  chatRoomId: number,
  params: ChatRoomDetailParams = {},
) => {
  return useQuery({
    queryKey: sessionChatKeys.detail(chatRoomId, params),
    queryFn: () => getChatRoomDetail(chatRoomId, params),
    enabled: chatRoomId > 0,
    staleTime: 1000 * 10,
  });
};

export const useSessionChatRoomDetailQuery = useChatRoomDetailQuery;