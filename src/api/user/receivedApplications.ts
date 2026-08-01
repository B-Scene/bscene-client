import { axiosInstance } from "@/api/axiosInstance";
import type {
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

export const decideSessionApply = async (
  applySubmissionId: number,
  isApproved: boolean,
) => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    `/users/me/${applySubmissionId}/acceptance`,
    { isApproved },
  );

  return data.result;
};
