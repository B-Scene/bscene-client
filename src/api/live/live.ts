import { axiosInstance } from "@/api/axiosInstance";
import type {
  AcceptCoHostUpgradeResponse,
  BlockLiveUserRequest,
  CloseLiveResponse,
  CreateLiveRequest,
  CreateLiveResponse,
  EnterLiveResponse,
  GetLiveNowListParams,
  GetReplayListParams,
  GetScheduledLiveListParams,
  LiveApiResponse,
  LiveHomeResponse,
  LiveMembersResponse,
  LiveNowListResponse,
  LiveReservationResponse,
  LiveSummaryResponse,
  ReportLiveUserRequest,
  ReportLiveUserResponse,
  ReplayListResponse,
  ReplayPlaybackResponse,
  RequestCoHostUpgradeResponse,
  RespondCoHostInvitationRequest,
  RespondCoHostInvitationResponse,
  ScheduledLiveListResponse,
  ToggleLiveAlarmResponse,
  UpdateLiveReservationRequest,
  UpdateLiveReservationResponse,
} from "@/types/live/live";

interface SubscribeViewerCountParams {
  liveId: number;
  watchOnly?: boolean;
  onViewerCount: (viewerCount: number) => void;
  onCoPublisherJoined?: (publisher: {
    userId: number;
    whepUrl: string;
  }) => void;
  onCoHostUpgradeRequested?: () => void;
  onCoHostUpgradeAccepted?: () => void;
  signal?: AbortSignal;
}

type MaybePaginatedResponse<T> =
  | {
      items?: T[];
      content?: T[];
      data?: T[];
      list?: T[];
      liveNow?: T[];
      scheduled?: T[];
      replays?: T[];
      pageInfo?: {
        nextCursor?: number | null;
        hasNext?: boolean;
      };
      nextCursor?: number | null;
      hasNext?: boolean;
    }
  | T[]
  | null
  | undefined;

type LiveThumbnailFieldAliases = {
  thumbnailImageUrl?: string | null;
  thumbnailUrl?: string | null;
  liveThumbnailImageUrl?: string | null;
  liveThumbnailUrl?: string | null;
  imageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  profileImageUrl?: string | null;
  bandImageUrl?: string | null;
  bandProfileUrl?: string | null;
  bandLogoUrl?: string | null;
  band?: {
    bandProfileImageUrl?: string | null;
    profileImageUrl?: string | null;
    bandImageUrl?: string | null;
    bandProfileUrl?: string | null;
    imageUrl?: string | null;
  } | null;
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
    axiosInstance.defaults.baseURL ??
    import.meta.env.VITE_API_BASE_URL ??
    "/api";

  return String(baseURL).replace(/\/$/, "");
};

const getMediaBaseUrl = () => {
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

const getRtcBaseUrl = getMediaBaseUrl;

export const resolveLiveApiUrl = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  if (
    normalizedPath.startsWith("/hls/") ||
    normalizedPath.startsWith("/rtc/")
  ) {
    const mediaBaseUrl = getMediaBaseUrl();

    if (!mediaBaseUrl) return normalizedPath;

    return `${mediaBaseUrl}${normalizedPath}`;
  }

  const baseURL = getApiBaseUrl();

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

const normalizeReplayLiveId = <
  T extends { liveId?: number; replayId?: number },
>(
  replay: T,
) => {
  const liveId = replay.liveId ?? replay.replayId;

  if (!liveId) {
    throw new Error("다시보기의 liveId가 응답에 없습니다.");
  }

  return {
    ...replay,
    liveId,
  };
};

const getPaginatedItems = <T>(result: MaybePaginatedResponse<T>) => {
  if (!result) return [];

  if (Array.isArray(result)) {
    return result;
  }

  return (
    result.items ??
    result.content ??
    result.data ??
    result.list ??
    result.liveNow ??
    result.scheduled ??
    result.replays ??
    []
  );
};

const getPageInfo = <T>(result: MaybePaginatedResponse<T>) => {
  if (!result || Array.isArray(result)) {
    return {
      nextCursor: null,
      hasNext: false,
    };
  }

  return {
    nextCursor: result.pageInfo?.nextCursor ?? result.nextCursor ?? null,
    hasNext: result.pageInfo?.hasNext ?? result.hasNext ?? false,
  };
};

const normalizeScheduledAt = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return trimmedValue;

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue}:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue.replace(" ", "T")}:00`;
  }

  const matched = trimmedValue.match(
    /(\d{4})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2}).*?(\d{1,2}):(\d{2})/,
  );

  if (!matched) {
    return trimmedValue;
  }

  const [, year, month, day, hour, minute] = matched;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0",
  )}T${hour.padStart(2, "0")}:${minute}:00`;
};

const getLiveCoHosts = (
  request: CreateLiveRequest | UpdateLiveReservationRequest,
) => {
  if (Array.isArray(request.coHost)) {
    return request.coHost;
  }

  if (Array.isArray(request.cohosts)) {
    return request.cohosts;
  }

  if (Array.isArray(request.coHostIds)) {
    return request.coHostIds;
  }

  if (Array.isArray(request.cohostIds)) {
    return request.cohostIds;
  }

  return [];
};

const getFirstNonEmptyString = (
  ...values: Array<string | null | undefined>
) => {
  return (
    values.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) ?? null
  );
};

const getThumbnailImageUrl = (value: LiveThumbnailFieldAliases) => {
  return getFirstNonEmptyString(
    value.thumbnailImageUrl,
    value.thumbnailUrl,
    value.liveThumbnailImageUrl,
    value.liveThumbnailUrl,
    value.imageUrl,
  );
};

const getBandProfileImageUrl = (value: LiveThumbnailFieldAliases) => {
  return getFirstNonEmptyString(
    value.bandProfileImageUrl,
    value.profileImageUrl,
    value.bandImageUrl,
    value.bandProfileUrl,
    value.bandLogoUrl,
    value.band?.bandProfileImageUrl,
    value.band?.profileImageUrl,
    value.band?.bandImageUrl,
    value.band?.bandProfileUrl,
    value.band?.imageUrl,
  );
};

const normalizeLiveThumbnailFields = <T extends LiveThumbnailFieldAliases>(
  value: T,
): T => {
  const thumbnailImageUrl = getThumbnailImageUrl(value);
  const bandProfileImageUrl = getBandProfileImageUrl(value);

  return {
    ...value,
    thumbnailImageUrl: thumbnailImageUrl ?? value.thumbnailImageUrl ?? null,
    bandProfileImageUrl:
      bandProfileImageUrl ?? value.bandProfileImageUrl ?? null,
  };
};

const normalizeCreateLiveRequest = (request: CreateLiveRequest) => {
  const thumbnailImageUrl = getFirstNonEmptyString(
    request.thumbnailImageUrl,
    request.thumbnailUrl,
  );

  const normalizedRequest: {
    title: string;
    description?: string;
    thumbnailImageUrl?: string;
    thumbnailUrl?: string;
    scheduledAt?: string;
    coHost: number[];
  } = {
    title: request.title.trim(),
    coHost: getLiveCoHosts(request),
  };

  const description = request.description?.trim();

  if (description) {
    normalizedRequest.description = description;
  }

  if (thumbnailImageUrl) {
    normalizedRequest.thumbnailImageUrl = thumbnailImageUrl;
    normalizedRequest.thumbnailUrl = thumbnailImageUrl;
  }

  if (request.scheduledAt) {
    normalizedRequest.scheduledAt = normalizeScheduledAt(request.scheduledAt);
  }

  return normalizedRequest;
};

const normalizeUpdateLiveReservationRequest = (
  request: UpdateLiveReservationRequest,
) => {
  const thumbnailImageUrl = getFirstNonEmptyString(
    request.thumbnailImageUrl,
    request.thumbnailUrl,
  );

  const normalizedRequest: {
    title: string;
    description?: string;
    thumbnailImageUrl?: string;
    thumbnailUrl?: string;
    scheduledAt: string;
    coHost: number[];
  } = {
    title: request.title.trim(),
    scheduledAt: normalizeScheduledAt(request.scheduledAt),
    coHost: getLiveCoHosts(request),
  };

  const description = request.description?.trim();

  if (description) {
    normalizedRequest.description = description;
  }

  if (thumbnailImageUrl) {
    normalizedRequest.thumbnailImageUrl = thumbnailImageUrl;
    normalizedRequest.thumbnailUrl = thumbnailImageUrl;
  }

  return normalizedRequest;
};

export const getLiveBearerAuthorization = () => {
  return `Bearer ${getAccessToken()}`;
};

const getWhipAuthorization = () => {
  return `Basic ${btoa(`bscene:${getAccessToken()}`)}`;
};

export const getLivePlaybackAuthorization = () => {
  return getWhipAuthorization();
};

export const getLiveReplayAuthorization = () => {
  return getLiveBearerAuthorization();
};

const setupAuthenticatedHlsXhr = (
  xhr: XMLHttpRequest,
  requestUrl: string,
  getAuthorization: () => string,
) => {
  xhr.withCredentials = false;

  const url = new URL(requestUrl, window.location.href);
  const hasUrlAuthorization =
    url.searchParams.has("access_token") ||
    url.searchParams.has("X-Amz-Signature") ||
    url.searchParams.has("X-Amz-Credential") ||
    url.searchParams.has("X-Amz-Algorithm");

  if (!hasUrlAuthorization) {
    xhr.setRequestHeader("Authorization", getAuthorization());
  }
};

export const setupLivePlaybackXhr = (
  xhr: XMLHttpRequest,
  requestUrl: string,
) => {
  setupAuthenticatedHlsXhr(xhr, requestUrl, getLivePlaybackAuthorization);
};

export const setupLiveReplayXhr = (
  xhr: XMLHttpRequest,
  requestUrl: string,
) => {
  setupAuthenticatedHlsXhr(xhr, requestUrl, getLiveReplayAuthorization);
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
    await axiosInstance.get<LiveApiResponse<Partial<LiveHomeResponse>>>(
      "/lives/home",
    );

  const result = unwrapResult(response.data) ?? {};

  return {
    liveNow: (result.liveNow ?? []).map(normalizeLiveThumbnailFields),
    replays: (result.replays ?? [])
      .map(normalizeReplayLiveId)
      .map(normalizeLiveThumbnailFields),
    scheduled: (result.scheduled ?? []).map(normalizeLiveThumbnailFields),
    myNickname: result.myNickname ?? result.nickname ?? null,
    nickname: result.nickname ?? result.myNickname ?? null,
    myProfileImageUrl:
      result.myProfileImageUrl ?? result.profileImageUrl ?? null,
    profileImageUrl:
      result.profileImageUrl ?? result.myProfileImageUrl ?? null,
    coHosts: result.coHosts ?? result.coHostList ?? [],
    coHostList: result.coHostList ?? result.coHosts ?? [],
  };
};

export const getLiveNowList = async ({
  filter,
  cursor,
  size = 10,
}: GetLiveNowListParams): Promise<LiveNowListResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<MaybePaginatedResponse<LiveNowListResponse["items"][number]>>
  >(`/lives/live-now/${filter}`, {
    params: {
      cursor,
      size,
    },
  });

  const result = unwrapResult(response.data);

  return {
    items: getPaginatedItems(result).map(normalizeLiveThumbnailFields),
    pageInfo: getPageInfo(result),
  };
};

export const getScheduledLiveList = async ({
  following,
  cursor,
  size = 10,
}: GetScheduledLiveListParams): Promise<ScheduledLiveListResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<
      MaybePaginatedResponse<ScheduledLiveListResponse["items"][number]>
    >
  >("/lives/scheduled", {
    params: {
      following,
      cursor,
      size,
    },
  });

  const result = unwrapResult(response.data);

  return {
    items: getPaginatedItems(result).map(normalizeLiveThumbnailFields),
    pageInfo: getPageInfo(result),
  };
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
    LiveApiResponse<MaybePaginatedResponse<ReplayListResponse["items"][number]>>
  >(`/lives/replays/${filter}`, {
    params: {
      sort,
      cursor,
      size,
    },
  });

  const result = unwrapResult(response.data);

  return {
    items: getPaginatedItems(result)
      .map(normalizeReplayLiveId)
      .map(normalizeLiveThumbnailFields),
    pageInfo: getPageInfo(result),
  };
};

export const getReplayPlayback = async (
  liveId: number,
): Promise<ReplayPlaybackResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<ReplayPlaybackResponse>
  >(`/lives/${liveId}/replay`, {
    withCredentials: true,
  });

  return normalizeLiveThumbnailFields(unwrapResult(response.data));
};

export const createLive = async (
  request: CreateLiveRequest,
): Promise<CreateLiveResponse> => {
  const response = await axiosInstance.post<LiveApiResponse<CreateLiveResponse>>(
    "/lives",
    normalizeCreateLiveRequest(request),
  );

  return unwrapResult(response.data);
};

export const enterLive = async (
  liveId: number,
): Promise<EnterLiveResponse> => {
  const response = await axiosInstance.post<LiveApiResponse<EnterLiveResponse>>(
    `/lives/${liveId}`,
  );

  return normalizeLiveThumbnailFields(unwrapResult(response.data));
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
  const response = await axiosInstance.post<LiveApiResponse<CloseLiveResponse>>(
    `/lives/${liveId}/close`,
  );

  return unwrapResult(response.data);
};

export const requestLiveReplay = async (liveId: number): Promise<void> => {
  await axiosInstance.post(`/lives/${liveId}/replay`);
};

export const getLiveSummary = async (
  liveId: number,
): Promise<LiveSummaryResponse> => {
  const response = await axiosInstance.get<LiveApiResponse<LiveSummaryResponse>>(
    `/lives/${liveId}/summary`,
  );

  return unwrapResult(response.data);
};

export const getLiveMembers = async (
  liveId: number,
): Promise<LiveMembersResponse> => {
  const response = await axiosInstance.get<LiveApiResponse<LiveMembersResponse>>(
    `/lives/${liveId}/members`,
  );

  return unwrapResult(response.data);
};

export const getLiveReservation = async (
  liveId: number,
): Promise<LiveReservationResponse> => {
  const response = await axiosInstance.get<
    LiveApiResponse<LiveReservationResponse>
  >(`/lives/${liveId}/reservation`);

  return normalizeLiveThumbnailFields(unwrapResult(response.data));
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
  >(
    `/lives/${liveId}/reservation`,
    normalizeUpdateLiveReservationRequest(request),
  );

  return unwrapResult(response.data);
};

export const cancelLiveReservation = async (
  liveId: number,
): Promise<void> => {
  await axiosInstance.delete(`/lives/${liveId}/reservation`);
};

export const respondCoHostInvitation = async ({
  liveId,
  request,
}: {
  liveId: number;
  request: RespondCoHostInvitationRequest;
}): Promise<RespondCoHostInvitationResponse> => {
  const response = await axiosInstance.patch<
    LiveApiResponse<RespondCoHostInvitationResponse>
  >(`/lives/${liveId}/co-host-invitation`, request);

  return unwrapResult(response.data);
};

export const requestCoHostUpgrade = async (
  liveId: number,
): Promise<RequestCoHostUpgradeResponse> => {
  const response = await axiosInstance.post<
    LiveApiResponse<RequestCoHostUpgradeResponse>
  >(`/lives/${liveId}/co-host`);

  return unwrapResult(response.data);
};

export const acceptCoHostUpgrade = async ({
  liveId,
}: {
  liveId: number;
}): Promise<AcceptCoHostUpgradeResponse> => {
  try {
    const response = await axiosInstance.post<
      LiveApiResponse<AcceptCoHostUpgradeResponse>
    >(`/lives/${liveId}/co-host/acceptance`, {});

    return unwrapResult(response.data);
  } catch (error) {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: {
            code?: string;
            message?: string;
          };
        };
      }
    ).response;

    const isBodyFormatError =
      response?.status === 400 && response.data?.code === "COMMON_400_2";

    if (!isBodyFormatError) {
      throw error;
    }

    const retryResponse = await axiosInstance.post<
      LiveApiResponse<AcceptCoHostUpgradeResponse>
    >(`/lives/${liveId}/co-host/acceptance`, {
      isAccepted: true,
    });

    return unwrapResult(retryResponse.data);
  }
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
    headers: {
      Authorization: getWhipAuthorization(),
    },
  });

  if (!response.ok && response.status !== 204 && response.status !== 404) {
    throw new Error(`WHIP 세션 종료 실패: ${response.status}`);
  }
};

export const subscribeViewerCount = async ({
  liveId,
  watchOnly = false,
  onViewerCount,
  onCoPublisherJoined,
  onCoHostUpgradeRequested,
  onCoHostUpgradeAccepted,
  signal,
}: SubscribeViewerCountParams): Promise<void> => {
  const requestUrl = resolveLiveApiUrl(
    `/lives/${liveId}/viewers?watchOnly=${watchOnly}`,
  );

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      Authorization: getLiveBearerAuthorization(),
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

        if (eventName === "coHostUpgradeRequested") {
          onCoHostUpgradeRequested?.();
        }

        if (eventName === "coHostUpgradeAccepted") {
          onCoHostUpgradeAccepted?.();
        }

        if (eventName === "coPublisherJoined" && dataLines.length > 0) {
          try {
            const publisher = JSON.parse(dataLines.join("\n")) as {
              userId?: number;
              whepUrl?: string;
            };

            if (
              Number.isFinite(publisher.userId) &&
              typeof publisher.whepUrl === "string" &&
              publisher.whepUrl.trim()
            ) {
              onCoPublisherJoined?.({
                userId: publisher.userId as number,
                whepUrl: publisher.whepUrl,
              });
            }
          } catch {
            // 잘못된 공동 송출자 이벤트는 시청자 수 구독을 끊지 않습니다.
          }
        }
      });
    }
  } finally {
    reader.releaseLock();
  }
};


export const createWhepSession = async ({
  whepUrl,
  sdpOffer,
  signal,
}: {
  whepUrl: string;
  sdpOffer: string;
  signal?: AbortSignal;
}): Promise<{ sdpAnswer: string; sessionUrl: string }> => {
  const requestUrl = resolveRtcUrl(whepUrl.trim());
  const maxAttempts = 15;
  let response: Response | null = null;
  let responseText = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    signal?.throwIfAborted();

    response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: getWhipAuthorization(),
        "Content-Type": "application/sdp",
        Accept: "application/sdp",
      },
      body: sdpOffer,
      signal,
    });

    responseText = await response.text();

    if (response.status !== 404 || attempt === maxAttempts) {
      break;
    }

    await new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal?.removeEventListener("abort", handleAbort);
        resolve();
      }, 1000);

      const handleAbort = () => {
        window.clearTimeout(timeoutId);
        reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
      };

      signal?.addEventListener("abort", handleAbort, { once: true });
    });
  }

  if (!response) {
    throw new Error("WHEP 세션 요청을 시작하지 못했습니다.");
  }

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(
        responseText,
        `WHEP 세션 생성 실패: ${response.status}`,
      ),
    );
  }

  const sessionUrl =
    response.headers.get("Location") ?? response.headers.get("location");

  if (!sessionUrl) {
    throw new Error("WHEP 세션 Location 헤더가 없습니다.");
  }

  return { sdpAnswer: responseText, sessionUrl };
};
