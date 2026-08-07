import { axiosInstance } from "@/api/axiosInstance";
import type { BandApiResponse } from "@/types/band/post";
import type {
  BandFollowersResponse,
  GetBandFollowersParams,
} from "@/types/band/follower";

export const getBandFollowers = async (
  params: GetBandFollowersParams = {},
) => {
  const { data } = await axiosInstance.get<
    BandApiResponse<BandFollowersResponse>
  >("/bands/follower", { params });

  return data.result;
};
