import { axiosInstance } from "@/api/axiosInstance";
import type { LiveApiResponse } from "@/types/live/live";
import type { LiveChatTicketResponse } from "@/types/live/liveChat";

export const getLiveChatTicket = async (
  liveId: number,
): Promise<LiveChatTicketResponse> => {
  const { data } = await axiosInstance.post<
    LiveApiResponse<LiveChatTicketResponse>
  >(`/lives/${liveId}/chat/ws-ticket`);

  return data.result;
};

export const createLiveChatWebSocketUrl = ({
  liveId,
  ticket,
}: {
  liveId: number;
  ticket: string;
}) => {
  const baseURL =
    axiosInstance.defaults.baseURL ?? import.meta.env.VITE_API_BASE_URL ?? "/api";
  const url = new URL(String(baseURL), window.location.origin);
  const basePath = url.pathname.replace(/\/$/, "");

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${basePath}/ws/lives/${liveId}/chat`;
  url.search = new URLSearchParams({ ticket }).toString();

  return url.toString();
};
