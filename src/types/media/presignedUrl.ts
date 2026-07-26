export interface MediaApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type MediaCategory =
  | "POST"
  | "POST_THUMBNAIL"
  | "STREAM_THUMBNAIL"
  | "BAND_PROFILE"
  | "PERFORMANCE_POSTER"
  | "USER_PROFILE"
  | "SESSION_PROFILE"
  | "SESSION_PORTFOLIO"
  | "ETC";

export interface GetPresignedUrlRequest {
  category: MediaCategory;
  fileName: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  fileUrl: string;
}
