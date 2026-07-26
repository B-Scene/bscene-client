import { axiosInstance } from "@/api/axiosInstance";
import type {
  ApiResponse,
  GetMyProfilesParams,
  MyProfilesResponse,
} from "@/types/user/myProfiles";

export const getMyProfiles = async (params: GetMyProfilesParams = {}) => {
  const { data } = await axiosInstance.get<ApiResponse<MyProfilesResponse>>(
    "/users/me/profiles",
    { params },
  );

  return data.result;
};
