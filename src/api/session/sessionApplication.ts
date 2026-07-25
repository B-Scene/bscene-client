import { axiosInstance } from "@/api/axiosInstance";
import type {
  SessionApiResponse,
  SessionApplicationDetailResponse,
  SessionApplicationSearchParams,
  SessionApplicationSearchResponse,
  SessionApplicationSummaryResponse,
  UpdateSessionApplicationVisibilityRequest,
  UpdateSessionApplicationVisibilityResponse,
} from "@/types/session/sessionApplication";

const removeEmptyParams = (params: SessionApplicationSearchParams) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
};

export const getSessionApplicationsSearch = async (
  params: SessionApplicationSearchParams = {},
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionApplicationSearchResponse>
  >("/sessions/applications/search", {
    params: removeEmptyParams(params),
  });

  return data.result;
};

export const getSessionApplicationDetail = async (
  sessionApplicationId: number,
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionApplicationDetailResponse>
  >(`/sessions/applications/${sessionApplicationId}`);

  return data.result;
};

export const updateSessionApplicationVisibility = async (
  sessionApplicationId: number,
  body: UpdateSessionApplicationVisibilityRequest,
) => {
  const { data } = await axiosInstance.patch<
    SessionApiResponse<UpdateSessionApplicationVisibilityResponse>
  >(`/sessions/applications/${sessionApplicationId}/visibility`, body);

  return data.result;
};

export const getMySessionApplicationSummary = async () => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionApplicationSummaryResponse>
  >("/sessions/applications/summary");

  return data.result;
};