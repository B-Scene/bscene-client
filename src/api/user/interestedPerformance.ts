import { axiosInstance } from "@/api/axiosInstance";
import type {
  ApiResponse,
  GetInterestedPerformancesParams,
  InterestedPerformanceResponse,
} from "@/types/user/interestedPerformance";

export const getInterestedPerformances = async (
  params: GetInterestedPerformancesParams = {},
) => {
  const { data } = await axiosInstance.get<
    ApiResponse<InterestedPerformanceResponse>
  >("/users/me/performance/interest", { params });

  return data.result;
};
