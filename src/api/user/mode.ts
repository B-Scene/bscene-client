import { axiosInstance } from "@/api/axiosInstance";
import type { ApiResponse, ChangeUserModeRequest } from "@/types/user/mode";

export const changeUserMode = async (body: ChangeUserModeRequest) => {
  const { data } = await axiosInstance.patch<ApiResponse<unknown>>(
    "/users/me/mode",
    body,
  );

  return data.result;
};
