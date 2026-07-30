import { axiosInstance } from "@/api/axiosInstance";
import type {
  ApiResponse,
  GetPerformanceHistoryParams,
  PerformanceHistoryResponse,
} from "@/types/user/performanceHistory";

export const getPerformanceHistory = async (
  params: GetPerformanceHistoryParams = {},
) => {
  const { data } = await axiosInstance.get<
    ApiResponse<PerformanceHistoryResponse>
  >("/users/me/performance/history", { params });

  return data.result;
};
