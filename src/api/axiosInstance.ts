import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { ApiResponse, ReissueResponse } from "@/types/auth/auth";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let reissueRequest: Promise<ReissueResponse> | null = null;

const clearAuthAndRedirectToLogin = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};

export const reissueAccessToken = async (): Promise<ReissueResponse> => {
  if (reissueRequest) return reissueRequest;

  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    clearAuthAndRedirectToLogin();
    throw new Error("refreshToken이 없습니다.");
  }

  const request = axios
    .post<ApiResponse<ReissueResponse>>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/reissue`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then(({ data }) => {
      localStorage.setItem("accessToken", data.result.accessToken);
      localStorage.setItem("refreshToken", data.result.refreshToken);

      return data.result;
    })
    .catch((error: unknown) => {
      clearAuthAndRedirectToLogin();
      throw error;
    });

  reissueRequest = request.finally(() => {
    reissueRequest = null;
  });

  return reissueRequest;
};

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _tokenRetry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const authorization =
      originalRequest.headers.Authorization ??
      originalRequest.headers.get?.("Authorization");
    const requestAccessToken =
      typeof authorization === "string"
        ? authorization.replace(/^Bearer\s+/i, "").trim()
        : "";
    const currentAccessToken = localStorage.getItem("accessToken");

    if (
      currentAccessToken &&
      requestAccessToken &&
      currentAccessToken !== requestAccessToken &&
      !originalRequest._tokenRetry
    ) {
      originalRequest._tokenRetry = true;
      originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`;
      return axiosInstance(originalRequest);
    }

    originalRequest._retry = true;

    try {
      const { accessToken } = await reissueAccessToken();

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);
    } catch (reissueError) {
      return Promise.reject(reissueError);
    }
  },
);
