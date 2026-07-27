import { axiosInstance } from "@/api/axiosInstance";
import type {
  BlockLiveUserRequest,
  CloseLiveResponse,
  CreateLiveRequest,
  CreateLiveResponse,
  EnterLiveResponse,
  GetLiveNowListParams,
  GetScheduledLiveListParams,
  GetReplayListParams,
  LiveApiResponse,
  LiveHomeResponse,
  LiveMembersResponse,
  LiveNowListResponse,
  LiveReservationResponse,
  ReportLiveUserRequest,
  ReportLiveUserResponse,
  ReplayListResponse,
  ReplayPlaybackResponse,
  ScheduledLiveListResponse,
  LiveSummaryResponse,
  ToggleLiveAlarmResponse,
  UpdateLiveReservationRequest,
  UpdateLiveReservationResponse,
} from "@/types/live/live";

interface SubscribeViewerCountParams {
  liveId: number;
  watchOnly?: boolean;
  onViewerCount: (viewerCount: number) => void;
  signal?: AbortSignal;
}

const normalizeToken = (value: string) => {
  return value
    .replace(/^Bearer\s+/i, "")
    .replace(/^"|"$/g, "")
    .trim();
};

const decodeJwtExp = (token: string) => {
  try {
    const [, payload] = token.split(".");

    if (!payload) return 0;

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
    throw new Error(
      "accessToken이 없거나 형식이 올바르지 않아요. 다시 로그인해주세요.",
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  const validCandidates = jwtCandidates.filter((token) => {
    const exp = decodeJwtExp(token);

    if (!exp) return true;

    return exp > nowSeconds + 10;
  });

  if (validCandidates.length === 0) {
    throw new Error("accessToken이 만료됐어요. 다시 로그인해주세요.");
  }

  return validCandidates.sort((leftToken, rightToken) => {
    return decodeJwtExp(rightToken) - decodeJwtExp(leftToken);
  })[0];
};

const getApiBaseUrl = () => {
  const baseURL =
    axiosInstance.defaults.baseURL ?? import.meta.env.VITE_API_BASE_URL ?? "/api";

  return String(baseURL).replace(/\/$/, "");
};

const getRtcBaseUrl = () => {
  const apiBaseUrl = getApiBaseUrl();

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return apiBaseUrl.replace(/\/api$/, "");
  }

  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (envBaseUrl && /^https?:\/\//i.test(envBaseUrl)) {
    return String(envBaseUrl).replace(/\/$/, "").replace(/\/api$/, "");
  }

  return "";
};

const resolveApiUrl = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const baseURL = getApiBaseUrl();
  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  if (baseURL.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${baseURL}${normalizedPath.slice(4)}`;
  }

  return `${baseURL}${normalizedPath}`;
};

const resolveRtcUrl = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const rtcBaseUrl = getRtcBaseUrl();
  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  if (!rtcBaseUrl) {
    return normalizedPath;
  }

  return `${rtcBaseUrl}${normalizedPath}`;
};

const unwrapResult = <T>(response: LiveApiResponse<T>) => {
  return response.result;
};

const getBearerAuthorization = () => {
  return `Bearer ${getAccessToken()}`;
};

const getWhipAuthorization = () => {
  return `Basic ${btoa(`bscene:${getAccessToken()}`)}`;
};

export const getLivePlaybackAuthorization = () => {
  return getWhipAuthorization();
};

const parseErrorMessage = (responseText: string, fallbackMessage: string) => {
  if (!responseText) return fallbackMessage;

  try {
    const errorBody = JSON.parse(responseText) as {
      message?: string;
      code?: string;
      status?: number;
    };

    return errorBody.message ?? fallbackMessage;
  } catch {
    return responseText;
  }
};

export const getLiveHome = async (): Promise<LiveHomeResponse> => {
  const response =
    await axiosInstance.get<LiveApiResponse<LiveHomeResponse>>("/lives/home");

  return unwrapResult(response.data);
};

export const getLiveNowList = async ({
  filter,
  cursor,
  size = 10,
}: GetLiveNowListParams): Promise<LiveNowListResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<LiveNowListResponse>
  >(`/lives/live-now/${filter}`, {
    params: {
      cursor,
      size,
    },
  });

  return unwrapResult(response.data);
};

export const getScheduledLiveList = async ({
  scope,
  cursor,
  size = 10,
}: GetScheduledLiveListParams): Promise<ScheduledLiveListResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<ScheduledLiveListResponse>
  >("/lives/scheduled", {
    params: {
      scope,
      cursor,
      size,
    },
  });

  return unwrapResult(response.data);
};

export const toggleLiveAlarm = async (
  liveId: number,
): Promise<ToggleLiveAlarmResponse> => {
  const response = await axiosInstance.post<
    LiveApiResponse<ToggleLiveAlarmResponse>
  >(`/lives/${liveId}/alarm`);

  return unwrapResult(response.data);
};

export const getReplayList = async ({
  filter,
  sort,
  cursor,
  size = 10,
}: GetReplayListParams): Promise<ReplayListResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<ReplayListResponse>
  >(`/lives/replays/${filter}`, {
    params: {
      sort,
      cursor,
      size,
    },
  });

  return unwrapResult(response.data);
};

export const getReplayPlayback = async (
  replayId: number,
): Promise<ReplayPlaybackResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<ReplayPlaybackResponse>
  >(`/lives/${replayId}/replay`);

  return unwrapResult(response.data);
};

export const createLive = async (
  request: CreateLiveRequest,
): Promise<CreateLiveResponse> => {
  const response = await axiosInstance.post<
    LiveApiResponse<CreateLiveResponse>
  >("/lives", request);

  return unwrapResult(response.data);
};

export const enterLive = async (
  liveId: number,
): Promise<EnterLiveResponse> => {
  const response = await axiosInstance.post<
    LiveApiResponse<EnterLiveResponse>
  >(`/lives/${liveId}`);

  return unwrapResult(response.data);
};

export const leaveLive = async (liveId: number): Promise<void> => {
  await axiosInstance.post<LiveApiResponse<null>>(`/lives/${liveId}/leave`);
};

export const reportLiveUser = async ({
  liveId,
  request,
}: {
  liveId: number;
  request: ReportLiveUserRequest;
}): Promise<ReportLiveUserResponse> => {
  const response = await axiosInstance.post<
    LiveApiResponse<ReportLiveUserResponse>
  >(`/lives/${liveId}/reports`, request);

  return unwrapResult(response.data);
};

export const blockLiveUser = async (
  request: BlockLiveUserRequest,
): Promise<void> => {
  await axiosInstance.post<LiveApiResponse<null>>("/users/blocks", request);
};

export const unblockLiveUser = async (
  request: BlockLiveUserRequest,
): Promise<void> => {
  await axiosInstance.delete<LiveApiResponse<null>>("/users/blocks", {
    data: request,
  });
};

export const closeLive = async (
  liveId: number,
): Promise<CloseLiveResponse> => {
  const response = await axiosInstance.post<
    LiveApiResponse<CloseLiveResponse>
  >(`/lives/${liveId}/close`);

  return unwrapResult(response.data);
};

export const requestLiveReplay = async (liveId: number): Promise<void> => {
  await axiosInstance.post(`/lives/${liveId}/replay`);
};

export const getLiveSummary = async (
  liveId: number,
): Promise<LiveSummaryResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<LiveSummaryResponse>
  >(`/lives/${liveId}/summary`);

  return unwrapResult(response.data);
};

export const getLiveMembers = async (
  liveId: number,
): Promise<LiveMembersResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<LiveMembersResponse>
  >(`/lives/${liveId}/members`);

  return unwrapResult(response.data);
};

export const getLiveReservation = async (
  liveId: number,
): Promise<LiveReservationResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<LiveReservationResponse>
  >(`/lives/${liveId}/reservation`);

  return unwrapResult(response.data);
};

export const updateLiveReservation = async ({
  liveId,
  request,
}: {
  liveId: number;
  request: UpdateLiveReservationRequest;
}): Promise<UpdateLiveReservationResponse | null> => {
  const response = await axiosInstance.patch<
    LiveApiResponse<UpdateLiveReservationResponse | null>
  >(`/lives/${liveId}/reservation`, request);

  return unwrapResult(response.data);
};

export const cancelLiveReservation = async (
  liveId: number,
): Promise<void> => {
  await axiosInstance.delete(`/lives/${liveId}/reservation`);
};

export const createWhipSession = async ({
  path,
  sdpOffer,
}: {
  path: string;
  sdpOffer: string;
}): Promise<{ sdpAnswer: string; sessionUrl: string }> => {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  const requestUrl = resolveRtcUrl(`/rtc/${normalizedPath}/whip`);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      Authorization: getWhipAuthorization(),
      "Content-Type": "application/sdp",
      Accept: "application/sdp",
    },
    body: sdpOffer,
  });

  const responseText = await response.text();

  if (!response.ok) {
    const errorMessage = parseErrorMessage(
      responseText,
      `WHIP 세션 생성 실패: ${response.status}`,
    );

    if (response.status === 401) {
      throw new Error(errorMessage);
    }

    if (response.status === 403) {
      throw new Error(
        "WHIP 인가 실패: 이 라이브의 송출자가 아니거나 OPEN 스트리밍이 아니에요.",
      );
    }

    if (response.status === 404) {
      throw new Error(
        `WHIP 경로 오류: playbackUrl에서 추출한 path를 확인해주세요. (${normalizedPath})`,
      );
    }

    throw new Error(errorMessage);
  }

  const sessionUrl =
    response.headers.get("Location") ?? response.headers.get("location");

  if (!sessionUrl) {
    throw new Error(
      "WHIP 세션 Location 헤더가 없습니다. 백엔드에서 Access-Control-Expose-Headers: Location 설정이 필요해요.",
    );
  }

  return {
    sdpAnswer: responseText,
    sessionUrl,
  };
};

export const deleteWhipSession = async (
  sessionUrl: string,
): Promise<void> => {
  const response = await fetch(resolveRtcUrl(sessionUrl), {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204 && response.status !== 404) {
    throw new Error(`WHIP 세션 종료 실패: ${response.status}`);
  }
};

export const subscribeViewerCount = async ({
  liveId,
  watchOnly = false,
  onViewerCount,
  signal,
}: SubscribeViewerCountParams): Promise<void> => {
  const requestUrl = resolveApiUrl(
    `/lives/${liveId}/viewers?watchOnly=${watchOnly}`,
  );

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      Authorization: getBearerAuthorization(),
      Accept: "text/event-stream",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`시청자 수 구독 실패: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("시청자 수 스트림을 읽을 수 없습니다.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  const parseViewerCount = (rawData: string) => {
    const trimmedData = rawData.trim();

    if (!trimmedData) return;

    const viewerCount = Number(trimmedData);

    if (Number.isFinite(viewerCount)) {
      onViewerCount(viewerCount);
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      events.forEach((eventText) => {
        const lines = eventText.split("\n");

        const eventName = lines
          .find((line) => line.startsWith("event:"))
          ?.replace(/^event:\s?/, "")
          .trim();

        const dataLines = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.replace(/^data:\s?/, ""));

        if (
          (eventName === "viewerCount" || !eventName) &&
          dataLines.length > 0
        ) {
          parseViewerCount(dataLines.join("\n"));
        }
      });
    }
  } finally {
    reader.releaseLock();
  }
};
