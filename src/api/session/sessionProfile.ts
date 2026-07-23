import { axiosInstance } from "@/api/axiosInstance";
import type {
  SessionApiResponse,
  SessionProfileResponse,
  UpdateSessionProfileRequest,
  UpdateSessionProfileResponse,
} from "@/types/session/sessionProfile";

export const getSessionProfile = async () => {
  const { data } = await axiosInstance.get<
    SessionApiResponse<SessionProfileResponse>
  >("/sessions/profile");

  return data.result;
};

export const updateSessionProfile = async (
  body: UpdateSessionProfileRequest,
) => {
  const { data } = await axiosInstance.patch<
    SessionApiResponse<UpdateSessionProfileResponse>
  >("/sessions/profile", body);

  return data.result;
};