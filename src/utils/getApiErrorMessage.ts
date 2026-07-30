import axios from "axios";

interface ApiErrorResponse {
  message?: string;
}

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallbackMessage;
  }

  return fallbackMessage;
};
