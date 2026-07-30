import { axiosInstance } from "@/api/axiosInstance";
import type {
  ApiResponse,
  FanInformationResponse,
  UpdateFanInformationRequest,
  UpdateFanInformationResponse,
} from "@/types/user/fanInformation";

export const getFanInformation = async () => {
  const { data } = await axiosInstance.get<ApiResponse<FanInformationResponse>>(
    "/users/me/information",
  );

  return data.result;
};

export const updateFanInformation = async (
  body: UpdateFanInformationRequest,
) => {
  const { data } = await axiosInstance.patch<
    ApiResponse<UpdateFanInformationResponse>
  >("/users/me/information", body);

  return data.result;
};
