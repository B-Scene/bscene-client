import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createSessionChatRoom,
  getSessionChatRooms,
} from "@/api/session/sessionChat";
import type {
  CreateSessionChatRoomRequest,
  SessionChatRoomListParams,
} from "@/types/session/sessionChat";

export const sessionChatKeys = {
  all: ["sessionChats"] as const,
  rooms: () => [...sessionChatKeys.all, "rooms"] as const,
  roomList: (params: SessionChatRoomListParams) =>
    [...sessionChatKeys.rooms(), params] as const,
};

export const useCreateSessionChatRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSessionChatRoomRequest) =>
      createSessionChatRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionChatKeys.rooms(),
      });
    },
  });
};

export const useSessionChatRoomsQuery = (
  params: SessionChatRoomListParams = {},
) => {
  return useQuery({
    queryKey: sessionChatKeys.roomList(params),
    queryFn: () => getSessionChatRooms(params),
    staleTime: 1000 * 20,
  });
};