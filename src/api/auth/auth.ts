import { axiosInstance } from "../axiosInstance";
import type {
  ApiResponse,
  CheckLoginIdResponse,
  SignupRequest,
  SignupResponse,
  SendPhoneVerificationRequest,
  SendPhoneVerificationResponse,
  VerifyPhoneRequest,
  LoginRequest, 
  LoginResponse,
  ReissueRequest, 
  ReissueResponse,
  OAuthSignupRequest,
  OAuthExchangeResponse,
} from "../../types/auth/auth";

export const checkLoginId = async (loginId: string) => {
  const { data } = await axiosInstance.get<ApiResponse<CheckLoginIdResponse>>(
    "/auth/login-id/check",
    {
      params: { loginId },
    }
  );

  return data.result;
};

export const signup = async (body: SignupRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<SignupResponse>>(
    "/auth/signup",
    body
  );

  return data.result;
};

export const sendPhoneVerification = async (
  body: SendPhoneVerificationRequest,
) => {
  const { data } = await axiosInstance.post<
    ApiResponse<SendPhoneVerificationResponse>
  >("/phone-verifications/send", body);

  return data.result;
};

export const verifyPhone = async (body: VerifyPhoneRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    "/phone-verifications/verify",
    body,
  );

  return data.result;
};

export const login = async (body: LoginRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    body,
  );

  return data.result;
};

export const reissueToken = async (body: ReissueRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<ReissueResponse>>(
    "/auth/reissue",
    body,
  );

  return data.result;
};

export const oauthSignup = async (body: OAuthSignupRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>(
    "/auth/oauth/signup",
    body,
  );

  return data.result;
};

export const exchangeOAuthCode = async (code: string) => {
  const { data } = await axiosInstance.post<
    ApiResponse<OAuthExchangeResponse>
  >("/auth/oauth/exchange", {
    code,
  });

  return data.result;
};