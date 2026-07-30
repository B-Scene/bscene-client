import { axiosInstance } from "@/api/axiosInstance";
import type {
  AcceptApplicationSubmissionRequest,
  ApiResponse,
  GetReceivedApplicationsParams,
  ReceivedApplicationsResponse,
} from "@/types/user/receivedApplications";

export const getReceivedApplications = async (
  params: GetReceivedApplicationsParams = {},
) => {
  const { data } = await axiosInstance.get<
    ApiResponse<ReceivedApplicationsResponse>
  >("/users/me/recruitments/receives", { params });

  return data.result;
};

export const acceptApplicationSubmission = async (
  applySubmissionId: number,
  body: AcceptApplicationSubmissionRequest,
) => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    `/users/me/${applySubmissionId}/acceptance`,
    body,
  );

  return data.result;
};
