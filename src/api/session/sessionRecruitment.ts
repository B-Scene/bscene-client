import { axiosInstance } from "@/api/axiosInstance";
import type {
  CreateSessionRecruitmentRequest,
  CreateSessionRecruitmentResponse,
  DeleteSessionRecruitmentResponse,
  DeleteSessionSearchHistoryResponse,
  InterestedSessionRecruitmentsResponse,
  RecentlyViewedSessionRecruitmentsResponse,
  SessionApiResponse,
  SessionRecruitmentDetailResponse,
  SessionRecruitmentEditInfoResponse,
  SessionRecruitmentHistoryParams,
  SessionRecruitmentInterestResponse,
  SessionRecruitmentListParams,
  SessionRecruitmentListResponse,
  SessionSearchHistoryItem,
  UpdateSessionRecruitmentRequest,
  UpdateSessionRecruitmentResponse,
} from "@/types/session/sessionRecruitment";

const removeEmptyParams = <
  T extends Record<string, string | number | boolean | null | undefined>,
>(
  params: T,
) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
};

export const getSessionRecruitments = async (
  params: SessionRecruitmentListParams = {},
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionRecruitmentListResponse>
  >("/sessions/recruitments", {
    params: removeEmptyParams(params as Record<string, string | number | boolean | null | undefined>),
  });

  return data.result;
};

export const getSessionRecruitmentDetail = async (
  sessionRecruitmentId: number,
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionRecruitmentDetailResponse>
  >(`/sessions/recruitments/${sessionRecruitmentId}`);

  return data.result;
};

export const createSessionRecruitment = async (
  body: CreateSessionRecruitmentRequest,
) => {
  const { data } = await axiosInstance.post<
    SessionApiResponse<CreateSessionRecruitmentResponse>
  >("/sessions/recruitments", body);

  return data.result;
};

export const updateSessionRecruitment = async (
  sessionRecruitmentId: number,
  body: UpdateSessionRecruitmentRequest,
) => {
  const { data } = await axiosInstance.patch<
    SessionApiResponse<UpdateSessionRecruitmentResponse>
  >(`/sessions/recruitments/${sessionRecruitmentId}`, body);

  return data.result;
};

export const getSessionRecruitmentEditInfo = async (
  sessionRecruitmentId: number,
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionRecruitmentEditInfoResponse>
  >(`/sessions/recruitments/${sessionRecruitmentId}/edit`);

  return data.result;
};

export const deleteSessionRecruitment = async (
  sessionRecruitmentId: number,
) => {
  const { data } = await axiosInstance.delete<
    SessionApiResponse<DeleteSessionRecruitmentResponse>
  >(`/sessions/recruitments/${sessionRecruitmentId}`);

  return data.result;
};

export const addSessionRecruitmentInterest = async (
  sessionRecruitmentId: number,
) => {
  const { data } = await axiosInstance.post<
    SessionApiResponse<SessionRecruitmentInterestResponse>
  >(`/sessions/recruitments/${sessionRecruitmentId}/interest`);

  return data.result;
};

export const removeSessionRecruitmentInterest = async (
  sessionRecruitmentId: number,
) => {
  const { data } = await axiosInstance.delete<
    SessionApiResponse<SessionRecruitmentInterestResponse>
  >(`/sessions/recruitments/${sessionRecruitmentId}/interest`);

  return data.result;
};

export const getSessionSearchHistory = async () => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionSearchHistoryItem[]>
  >("/sessions/recruitments/search-history");

  return data.result;
};

export const deleteSessionSearchHistory = async (keywordId: number) => {
  const { data } = await axiosInstance.delete<
    SessionApiResponse<DeleteSessionSearchHistoryResponse>
  >(`/sessions/recruitments/search-history/${keywordId}`);

  return data.result;
};

export const getInterestedSessionRecruitments = async (
  params: SessionRecruitmentHistoryParams = {},
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<InterestedSessionRecruitmentsResponse>
  >("/sessions/recruitments/interests", {
    params: removeEmptyParams(params as Record<string, string | number | boolean | null | undefined>),
  });

  return data.result;
};

export const getRecentlyViewedSessionRecruitments = async (
  params: SessionRecruitmentHistoryParams = {},
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<RecentlyViewedSessionRecruitmentsResponse>
  >("/sessions/recruitments/recently-viewed", {
    params: removeEmptyParams(params as Record<string, string | number | boolean | null | undefined>),
  });

  return data.result;
};