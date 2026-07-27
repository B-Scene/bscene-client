import { axiosInstance } from "@/api/axiosInstance";

export type MediaUploadCategory =
  | "POST"
  | "POST_THUMBNAIL"
  | "STREAM_THUMBNAIL"
  | "BAND_PROFILE"
  | "PERFORMANCE_POSTER"
  | "USER_PROFILE"
  | "SESSION_PROFILE"
  | "SESSION_PORTFOLIO"
  | "ETC";

interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timestamp?: string;
  timeStamp?: string;
}

interface CreatePresignedUrlRequest {
  category: MediaUploadCategory;
  fileName: string;
  contentType: string;
}

interface CreatePresignedUrlResponse {
  presignedUrl: string;
  fileUrl: string;
}

interface UploadMediaFileParams {
  category: MediaUploadCategory;
  file: File;
}

const getSafeContentType = (file: File) => {
  return file.type || "application/octet-stream";
};

export const createPresignedUrl = async (
  request: CreatePresignedUrlRequest,
): Promise<CreatePresignedUrlResponse> => {
  const response = await axiosInstance.post<
    ApiResponse<CreatePresignedUrlResponse>
  >("/media/presigned-url", request);

  return response.data.result;
};

export const uploadFileToPresignedUrl = async ({
  presignedUrl,
  file,
  contentType,
}: {
  presignedUrl: string;
  file: File;
  contentType: string;
}): Promise<void> => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 파일 업로드에 실패했어요. (${response.status})`);
  }
};

export const uploadMediaFile = async ({
  category,
  file,
}: UploadMediaFileParams): Promise<string> => {
  const contentType = getSafeContentType(file);

  const { presignedUrl, fileUrl } = await createPresignedUrl({
    category,
    fileName: file.name,
    contentType,
  });

  await uploadFileToPresignedUrl({
    presignedUrl,
    file,
    contentType,
  });

  return fileUrl;
};