import { axiosInstance } from "@/api/axiosInstance";
import type {
  ApplicationSubmissionDetailResponse,
  ApplicationSubmissionsParams,
  ApplicationSubmissionsResponse,
  ApplySessionRecruitmentRequest,
  ApplySessionRecruitmentResponse,
  CancelSessionApplicationSubmissionResponse,
  CreateSessionApplicationRequest,
  CreateSessionApplicationResponse,
  DeleteSessionApplicationResponse,
  FinalizeApplicationSubmissionRequest,
  MySessionApplicationDetailResponse,
  SessionApiResponse,
  SessionApplicationDetailResponse,
  SessionApplicationSearchParams,
  SessionApplicationSearchResponse,
  SessionApplicationSummaryResponse,
  UpdateSessionApplicationRequest,
  UpdateSessionApplicationResponse,
  UpdateSessionApplicationVisibilityRequest,
  UpdateSessionApplicationVisibilityResponse,
} from "@/types/session/sessionApplication";

const removeEmptyParams = <T extends object>(params: T) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== "";
    }),
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

export const getMySessionApplicationDetail = async (
  sessionApplicationId: number,
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<MySessionApplicationDetailResponse>
  >(`/sessions/applications/my/${sessionApplicationId}`);

  return data.result;
};

export const getMySessionApplicationSummary = async () => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionApplicationSummaryResponse>
  >("/sessions/applications/summary");

  return data.result;
};

export const createSessionApplication = async (
  body: CreateSessionApplicationRequest,
) => {
  const { data } = await axiosInstance.post<
    SessionApiResponse<CreateSessionApplicationResponse>
  >("/sessions/applications", body);

  return data.result;
};

export const updateSessionApplication = async (
  sessionApplicationId: number,
  body: UpdateSessionApplicationRequest,
) => {
  const { data } = await axiosInstance.patch<
    SessionApiResponse<UpdateSessionApplicationResponse>
  >(`/sessions/applications/${sessionApplicationId}`, body);

  return data.result;
};

export const deleteSessionApplication = async (
  sessionApplicationId: number,
) => {
  const { data } = await axiosInstance.delete<
    SessionApiResponse<DeleteSessionApplicationResponse>
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

export const applySessionRecruitment = async (
  sessionRecruitmentId: number,
  body: ApplySessionRecruitmentRequest,
) => {
  const { data } = await axiosInstance.post<
    SessionApiResponse<ApplySessionRecruitmentResponse>
  >(`/sessions/recruitments/${sessionRecruitmentId}/applications`, body);

  return data.result;
};

export const getApplicationSubmissions = async (
  params: ApplicationSubmissionsParams = {},
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<ApplicationSubmissionsResponse>
  >("/sessions/applications/submissions", {
    params: removeEmptyParams(params),
  });

  return data.result;
};

export const getApplicationSubmissionDetail = async (
  applicationSubmissionId: number,
) => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<ApplicationSubmissionDetailResponse>
  >(`/sessions/recruitments/submissions/${applicationSubmissionId}`);

  return data.result;
};

export const cancelSessionApplicationSubmission = async (
  applicationSubmissionId: number,
) => {
  const { data } = await axiosInstance.delete<
    SessionApiResponse<CancelSessionApplicationSubmissionResponse>
  >(`/sessions/applications/submissions/${applicationSubmissionId}`);

  return data.result;
};

export const finalizeApplicationSubmission = async (
  applySubmissionId: number,
  body: FinalizeApplicationSubmissionRequest,
) => {
  const { data } = await axiosInstance.post<SessionApiResponse<null>>(
    `/users/me/${applySubmissionId}/final`,
    body,
  );

  return data.result;
};