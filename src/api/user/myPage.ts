import { axiosInstance } from "@/api/axiosInstance";
import type { ApiResponse, FanMyPageResponse } from "@/types/user/myPage";

export const getFanMyPage = async () => {
  const { data } =
    await axiosInstance.get<ApiResponse<FanMyPageResponse>>("/users/me");

  return data.result;
};
