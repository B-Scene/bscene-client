export type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export type CheckLoginIdResponse = {
  available: boolean;
};

export type SignupRequest = {
  loginId: string;
  password: string;
  passwordConfirm: string;
  name: string;
  birthDatePrefix: string;
  genderCode: string;
  phone: string;
  termAgreements: {
    termId: number;
    agreed: boolean;
  }[];
};

export type SignupResponse = {
  userId: number;
  onboardingCompleted: boolean;
};

export type PhoneVerificationPurpose =
  | "SIGNUP"
  | "PASSWORD_RESET"
  | "FIND_LOGIN_ID";

export type SendPhoneVerificationRequest = {
  phone: string;
  purpose: PhoneVerificationPurpose;
};

export type SendPhoneVerificationResponse = {
  expiresInSeconds: number;
};

export type VerifyPhoneRequest = {
  phone: string;
  code: string;
  purpose: PhoneVerificationPurpose;
};

export type LoginRequest = {
  loginId: string;
  password: string;
};

export type LoginResponse = {
  grantType: "Bearer";
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  user: {
    userId: number;
    name: string;
    currentMode: string | null;
    onboardingCompleted: boolean;
  };
};

export type ReissueRequest = {
  refreshToken: string;
};

export type ReissueResponse = {
  grantType: "Bearer";
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
};

export type OAuthSignupRequest = {
  signupToken: string;
  name: string;
  birthDatePrefix: string;
  genderCode: string;
  phone: string;
  terms: {
    termId: number;
    agreed: boolean;
  }[];
};

export interface OAuthExchangeRequest {
  code: string;
}

export type OAuthExchangeResponse = {
  isNewUser: boolean;
  signupToken: string | null;
  email: string | null;
  token: LoginResponse | null;
};