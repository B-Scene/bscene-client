import { axiosInstance } from "@/api/axiosInstance";
import type {
  ChatRoomDetailParams,
  ChatRoomDetailResponse,
  ChatRoomsParams,
  ChatRoomsResponse,
  ChatWebSocketTicketResponse,
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

const normalizeToken = (value: string) => {
  return value
    .replace(/^Bearer\s+/i, "")
    .replace(/^"|"$/g, "")
    .trim();
};

const decodeJwtExp = (token: string) => {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return 0;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    const decodedPayload = JSON.parse(atob(paddedBase64)) as {
      exp?: number;
    };

    return decodedPayload.exp ?? 0;
  } catch {
    return 0;
  }
};

const isJwtToken = (value: string) => {
  return normalizeToken(value).split(".").length === 3;
};

const getAxiosDefaultAuthorization = () => {
  const commonHeaders = axiosInstance.defaults.headers.common as
    | Record<string, unknown>
    | undefined;

  const authorization =
    commonHeaders?.Authorization ?? commonHeaders?.authorization ?? "";

  return typeof authorization === "string" ? authorization : "";
};

const getAccessToken = () => {
  const tokenCandidates = [
    localStorage.getItem("accessToken"),
    sessionStorage.getItem("accessToken"),
    localStorage.getItem("access_token"),
    sessionStorage.getItem("access_token"),
    localStorage.getItem("ACCESS_TOKEN"),
    sessionStorage.getItem("ACCESS_TOKEN"),
    getAxiosDefaultAuthorization(),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeToken)
    .filter(Boolean);

  const uniqueCandidates = Array.from(new Set(tokenCandidates));
  const jwtCandidates = uniqueCandidates.filter(isJwtToken);

  if (jwtCandidates.length === 0) {
    return "";
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  const validCandidates = jwtCandidates.filter((token) => {
    const exp = decodeJwtExp(token);

    if (!exp) {
      return true;
    }

    return exp > nowSeconds + 10;
  });

  if (validCandidates.length === 0) {
    return "";
  }

  return validCandidates.sort((leftToken, rightToken) => {
    return decodeJwtExp(rightToken) - decodeJwtExp(leftToken);
  })[0];
};

const getAuthHeaders = () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

const getApiBaseUrl = () => {
  const baseURL =
    axiosInstance.defaults.baseURL ?? import.meta.env.VITE_API_BASE_URL ?? "/api";

  return String(baseURL).replace(/\/$/, "");
};

export const getChatWebSocketUrl = (ticket: string) => {
  const encodedTicket = encodeURIComponent(ticket);
  const baseURL = getApiBaseUrl();

  if (/^https?:\/\//i.test(baseURL)) {
    const url = new URL(baseURL);

    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    const normalizedPath = url.pathname.replace(/\/$/, "");

    if (normalizedPath.endsWith("/api")) {
      url.pathname = `${normalizedPath}/ws/chat`;
    } else {
      url.pathname = `${normalizedPath}/api/ws/chat`;
    }

    url.search = `ticket=${encodedTicket}`;

    return url.toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  return `${protocol}//${window.location.host}/api/ws/chat?ticket=${encodedTicket}`;
};

export const createChatRoom = async (
  body: CreateChatRoomRequest,
): Promise<CreateChatRoomResponse> => {
  const { data } = await axiosInstance.post<
    SessionChatApiResponse<CreateChatRoomResponse>
  >("/chat/rooms", body, {
    headers: getAuthHeaders(),
  });

  return data.result;
};

export const getChatRooms = async (
  params: ChatRoomsParams = {},
): Promise<ChatRoomsResponse> => {
  const { data } = await axiosInstance.get<
    SessionChatApiResponse<ChatRoomsResponse>
  >("/chat/rooms", {
    params: removeEmptyParams(params),
    headers: getAuthHeaders(),
  });

  return data.result;
};

export const getChatRoomDetail = async (
  chatRoomId: number,
  params: ChatRoomDetailParams = {},
): Promise<ChatRoomDetailResponse> => {
  const { data } = await axiosInstance.get<
    SessionChatApiResponse<ChatRoomDetailResponse>
  >(`/chat/rooms/${chatRoomId}`, {
    params: removeEmptyParams(params),
    headers: getAuthHeaders(),
  });

  return data.result;
};

export const issueChatWebSocketTicket =
  async (): Promise<ChatWebSocketTicketResponse> => {
    const { data } = await axiosInstance.post<
      SessionChatApiResponse<ChatWebSocketTicketResponse>
    >(
      "/chat/ws-ticket",
      undefined,
      {
        headers: getAuthHeaders(),
      },
    );

    return data.result;
  };