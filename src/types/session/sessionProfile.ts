export interface SessionApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type SessionProfileGender = "MALE" | "FEMALE";

export interface SessionProfileResponse {
  userId: number;
  name: string;
  phone: string;
  email: string | null;
  gender: SessionProfileGender;
  birthDate: string;
  profileImageUrl: string | null;
}

export interface UpdateSessionProfileRequest {
  email?: string;
  gender?: SessionProfileGender;
  profileImageUrl?: string;
}

export type UpdateSessionProfileResponse = SessionProfileResponse;