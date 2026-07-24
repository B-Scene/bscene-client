import type { LoginResponse } from "@/types/auth/auth";

const AUTH_USER_STORAGE_KEY = "bscene:auth-user";
const SIGNUP_EMAIL_STORAGE_KEY = "bscene:signup-email";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type StoredAuthUser = {
  userId: number;
  name: string;
  fanNickname?: string | null;
  email?: string | null;
};

const parseStoredAuthUser = (value: string | null): StoredAuthUser | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as StoredAuthUser;
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token: string | null) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = window.atob(
      normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        "=",
      ),
    );

    return JSON.parse(decodedPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getStringValue = (
  source: Record<string, unknown> | null,
  keys: string[],
) => {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const getEmailValue = (
  source: Record<string, unknown> | null,
  keys: string[],
) => {
  const value = getStringValue(source, keys);

  return EMAIL_PATTERN.test(value) ? value : "";
};

const getStoredSignupEmail = () => {
  const email = window.localStorage.getItem(SIGNUP_EMAIL_STORAGE_KEY) ?? "";

  return EMAIL_PATTERN.test(email) ? email : "";
};

export const getStoredAuthUser = () => {
  return parseStoredAuthUser(window.localStorage.getItem(AUTH_USER_STORAGE_KEY));
};

export const saveSignupEmail = (email: string) => {
  const trimmedEmail = email.trim();

  if (!EMAIL_PATTERN.test(trimmedEmail)) return;

  window.localStorage.setItem(SIGNUP_EMAIL_STORAGE_KEY, trimmedEmail);
};

export const saveAuthenticatedUser = (
  user: LoginResponse["user"] & {
    fanNickname?: string | null;
    email?: string | null;
  },
) => {
  const previousUser = getStoredAuthUser();
  const signupEmail = getStoredSignupEmail();
  const userEmail = user.email?.trim() ?? "";

  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({
      userId: user.userId,
      name: user.name,
      fanNickname: user.fanNickname ?? previousUser?.fanNickname ?? null,
      email: EMAIL_PATTERN.test(userEmail)
        ? userEmail
        : previousUser?.email || signupEmail || null,
    }),
  );
};

export const saveFanNickname = (fanNickname: string) => {
  const previousUser = getStoredAuthUser();

  if (!previousUser) return;

  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({
      ...previousUser,
      fanNickname,
    }),
  );
};

export const getFanAccountDisplay = () => {
  const user = getStoredAuthUser();
  const tokenPayload = decodeJwtPayload(window.localStorage.getItem("accessToken"));
  const sessionNickname = window.sessionStorage.getItem(
    "onboardingFanNickname",
  );
  const tokenNickname = getStringValue(tokenPayload, [
    "fanNickname",
    "nickname",
    "name",
  ]);
  const tokenEmail = getEmailValue(tokenPayload, ["email", "loginId"]);
  const signupEmail = getStoredSignupEmail();
  const storedEmail =
    user?.email && EMAIL_PATTERN.test(user.email) ? user.email : "";
  const nickname =
    user?.fanNickname ||
    sessionNickname ||
    tokenNickname ||
    user?.name ||
    "닉네임";
  const email = storedEmail || signupEmail || tokenEmail;

  return {
    id: user ? `fan-${user.userId}` : "fan-1",
    nickname,
    email,
  };
};
