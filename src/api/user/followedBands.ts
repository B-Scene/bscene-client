import { axiosInstance } from "@/api/axiosInstance";
import type {
  ApiResponse,
  FollowedBandsResponse,
  GetFollowedBandsParams,
} from "@/types/user/followedBands";

export const getFollowedBands = async (
  params: GetFollowedBandsParams = {},
) => {
  const { data } = await axiosInstance.get<ApiResponse<FollowedBandsResponse>>(
    "/users/me/follows",
    { params },
  );

  return data.result;
};
