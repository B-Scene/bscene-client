import { axiosInstance } from "@/api/axiosInstance";
import type {
  ApiResponse,
  ChangeUserModeRequest,
  ChangeUserModeResponse,
} from "@/types/user/mode";

const persistModeTokens = (result: ChangeUserModeResponse | null) => {
  const accessToken = result?.accessToken ?? result?.token?.accessToken;
  const refreshToken = result?.refreshToken ?? result?.token?.refreshToken;

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const changeUserMode = async (body: ChangeUserModeRequest) => {
  const { data } = await axiosInstance.patch<ApiResponse<ChangeUserModeResponse | null>>(
    "/users/me/mode",
    body,
  );

  if (!data.isSuccess) {
    throw new Error(data.message || "모드 전환에 실패했어요.");
  }

  persistModeTokens(data.result);

  return data.result;
};
