import type { AxiosError } from "axios";
import { axiosInstance } from "@/api/axiosInstance";
import type {
  BandMemberProfile,
  BandMemberProfilesResponse,
  FanApiResponse,
  FanHomeConcert,
  FanHomeResponse,
  FanPerformanceDetailResponse,
  FollowingPostsParams,
  FollowingPostsResponse,
  NormalizedBandMemberProfilesResponse,
  NormalizedPerformancesByDateResponse,
  NormalizedPerformanceCalendarResponse,
  PendingPerformanceParticipationResponse,
  PerformanceCalendarDateItem,
  PerformanceCalendarParams,
  PerformanceCalendarResponse,
  PerformancesByDateParams,
  PerformancesByDateResponse,
  UpcomingPerformancesParams,
  UpcomingPerformancesResponse,
} from "@/types/fan/home";

export const getFanHome = async () => {
  const { data } =
    await axiosInstance.get<FanApiResponse<FanHomeResponse>>("/home");

  return data.result;
};

export const getFanPerformanceDetail = async (performanceId: number) => {
  const { data } = await axiosInstance.get<
    FanApiResponse<FanPerformanceDetailResponse>
  >(`/performances/${performanceId}/detail`);

  return data.result;
};

export const getBandMemberProfiles = async (
  bandId: number,
): Promise<NormalizedBandMemberProfilesResponse> => {
  const { data } = await axiosInstance.get<
    FanApiResponse<BandMemberProfilesResponse | BandMemberProfile[]>
  >(`/bands/${bandId}/members/profiles`);
  const result = data.result;

  if (Array.isArray(result)) {
    return {
      items: result,
    };
  }

  return {
    items:
      result.items ??
      result.members ??
      result.profiles ??
      result.data ??
      result.list ??
      [],
  };
};

export const getFollowingPosts = async ({
  cursor,
  size = 10,
}: FollowingPostsParams = {}) => {
  const { data } = await axiosInstance.get<
    FanApiResponse<FollowingPostsResponse>
  >("/posts/following", {
    params: {
      cursor,
      size,
    },
  });

  return data.result;
};

export const getUpcomingPerformances = async ({
  sort = "IMMINENT",
  page = 0,
  size = 10,
}: UpcomingPerformancesParams = {}) => {
  const { data } = await axiosInstance.get<
    FanApiResponse<UpcomingPerformancesResponse | FanHomeConcert[]>
  >("/performances/upcoming", {
    params: {
      sort,
      page,
      size,
    },
  });
  const result = data.result;

  if (Array.isArray(result)) {
    return {
      items: result,
      hasNext: false,
      nextPage: null,
      page,
    };
  }

  return {
    ...result,
    items:
      result.items ??
      result.content ??
      result.performances ??
      result.upcomingPerformances ??
      result.data ??
      result.list ??
      [],
    hasNext: result.hasNext ?? false,
  };
};

export const getPerformanceCalendar = async ({
  year,
  month,
}: PerformanceCalendarParams = {}): Promise<NormalizedPerformanceCalendarResponse> => {
  const hasYearAndMonth = typeof year === "number" && typeof month === "number";
  const { data } = await axiosInstance.get<
    FanApiResponse<PerformanceCalendarResponse | PerformanceCalendarDateItem[]>
  >("/performances/calendar", {
    params: hasYearAndMonth
      ? {
          year,
          month,
        }
      : undefined,
  });
  const result = data.result;

  if (Array.isArray(result)) {
    return {
      items: result,
    };
  }

  return {
    items:
      result.items ??
      result.dates ??
      result.performanceDates ??
      result.calendarDates ??
      result.days ??
      [],
  };
};

export const getPerformancesByDate = async ({
  date,
  page = 0,
  size = 10,
}: PerformancesByDateParams = {}): Promise<NormalizedPerformancesByDateResponse> => {
  const { data } = await axiosInstance.get<
    FanApiResponse<PerformancesByDateResponse | FanHomeConcert[]>
  >("/performances/by-date", {
    params: {
      date,
      page,
      size,
    },
  });
  const result = data.result;

  if (Array.isArray(result)) {
    return {
      items: result,
      hasNext: false,
      nextPage: null,
      page,
    };
  }

  return {
    ...result,
    items:
      result.items ??
      result.content ??
      result.performances ??
      result.data ??
      result.list ??
      [],
    hasNext: result.hasNext ?? false,
  };
};

export const getPendingPerformanceParticipation = async () => {
  const { data } =
    await axiosInstance.get<
      FanApiResponse<PendingPerformanceParticipationResponse>
    >("/performances/participation/pending");

  return data.result;
};

export const completePerformanceParticipation = async (
  performanceId: number,
) => {
  const { data } = await axiosInstance.patch<FanApiResponse<null>>(
    `/performances/${performanceId}/participation/complete`,
  );

  return data.result;
};

export const deletePerformanceParticipation = async (performanceId: number) => {
  const { data } = await axiosInstance.delete<FanApiResponse<null>>(
    `/performances/${performanceId}/participation`,
  );

  return data.result;
};

export const setPerformanceAlarm = async (performanceId: number) => {
  const { data } = await axiosInstance.post<FanApiResponse<null>>(
    `/performances/${performanceId}/alarm`,
  );

  return data.result;
};

export const deletePerformanceAlarm = async (performanceId: number) => {
  const { data } = await axiosInstance.delete<FanApiResponse<null>>(
    `/performances/${performanceId}/alarm`,
  );

  return data.result;
};

export const addPerformanceInterest = async (performanceId: number) => {
  const { data } = await axiosInstance.post<FanApiResponse<null>>(
    `/performances/${performanceId}/interest`,
  );

  return data.result;
};

export const deletePerformanceInterest = async (performanceId: number) => {
  const { data } = await axiosInstance.delete<FanApiResponse<null>>(
    `/performances/${performanceId}/interest`,
  );

  return data.result;
};

export const isAlreadyInterestedPerformanceError = (error: unknown) => {
  const axiosError = error as AxiosError<FanApiResponse<unknown>>;

  return (
    axiosError.response?.status === 409 &&
    axiosError.response.data?.code === "SHOW409_2"
  );
};
