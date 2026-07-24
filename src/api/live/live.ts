import { axiosInstance } from "@/api/axiosInstance";
import type {
  CreateLiveRequest,
  CreateLiveResponse,
  EnterLiveResponse,
  LiveApiResponse,
  LiveHomeResponse,
} from "@/types/live/live";

export const getLiveHome = async (): Promise<LiveHomeResponse> => {
  const { data } = await axiosInstance.get<LiveApiResponse<LiveHomeResponse>>(
    "/lives/home",
  );

  return data.result;
};

export const createLive = async (
  body: CreateLiveRequest,
): Promise<CreateLiveResponse> => {
  const { data } = await axiosInstance.post<LiveApiResponse<CreateLiveResponse>>(
    "/lives",
    body,
  );

  return data.result;
};

export const enterLive = async (
  liveId: number,
): Promise<EnterLiveResponse> => {
  const { data } = await axiosInstance.post<LiveApiResponse<EnterLiveResponse>>(
    `/lives/${liveId}`,
  );

  return data.result;
};

export const createWhipSession = async ({
  path,
  sdpOffer,
}: {
  path: string;
  sdpOffer: string;
}): Promise<{ sdpAnswer: string; sessionUrl: string }> => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("accessToken이 없습니다.");
  }

  const response = await axiosInstance.post<string>(
    `/rtc/${path}/whip`,
    sdpOffer,
    {
      headers: {
        Authorization: `Basic ${btoa(`bscene:${accessToken}`)}`,
        "Content-Type": "application/sdp",
      },
      transformRequest: [(data) => data],
    },
  );

  const sessionUrl = response.headers.location;

  if (!sessionUrl) {
    throw new Error("WHIP 세션 Location 헤더가 없습니다.");
  }

  return {
    sdpAnswer: response.data,
    sessionUrl,
  };
};

export const deleteWhipSession = async (sessionUrl: string): Promise<void> => {
  await axiosInstance.delete(sessionUrl);
};

export const subscribeViewerCount = async ({
  liveId,
  watchOnly,
  onViewerCount,
  signal,
}: {
  liveId: number;
  watchOnly: boolean;
  onViewerCount: (viewerCount: number) => void;
  signal: AbortSignal;
}) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("accessToken이 없습니다.");
  }

  const baseURL = axiosInstance.defaults.baseURL ?? "";
  const url = `${baseURL}/lives/${liveId}/viewers?watchOnly=${watchOnly}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "text/event-stream",
    },
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`시청자 수 구독 실패: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const eventText of events) {
      const lines = eventText.split("\n");
      const dataLine = lines.find((line) => line.startsWith("data:"));

      if (!dataLine) continue;

      const value = Number(dataLine.replace("data:", "").trim());

      if (Number.isFinite(value)) {
        onViewerCount(value);
      }
    }
  }
};