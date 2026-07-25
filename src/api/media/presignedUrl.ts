import { axiosInstance } from "@/api/axiosInstance";
import type {
  GetPresignedUrlRequest,
  MediaApiResponse,
  PresignedUrlResponse,
} from "@/types/media/presignedUrl";

export const getPresignedUrl = async (body: GetPresignedUrlRequest) => {
  const { data } = await axiosInstance.post<
    MediaApiResponse<PresignedUrlResponse>
  >("/media/presigned-url", body);

  return data.result;
};
