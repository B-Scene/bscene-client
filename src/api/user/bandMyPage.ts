import { axiosInstance } from "@/api/axiosInstance";
import type { ApiResponse, BandMyPageResponse } from "@/types/user/bandMyPage";

export const getBandMyPage = async () => {
  const { data } =
    await axiosInstance.get<ApiResponse<BandMyPageResponse>>("/users/me");

  return data.result;
};
