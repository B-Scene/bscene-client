import { axiosInstance } from "@/api/axiosInstance";
import type {
  CheckFanNicknameResponse,
  CodeName,
  GenresResponse,
  OnboardingApiResponse,
  OnboardingStatusResponse,
  SaveOnboardingRequest,
  SaveOnboardingResponse,
} from "@/types/onboarding/onboarding";

export const getOnboardingStatus = async () => {
  const { data } = await axiosInstance.get<
    OnboardingApiResponse<OnboardingStatusResponse>
  >("/users/me/onboarding/status");

  return data.result;
};

export const checkFanNickname = async (nickname: string) => {
  const { data } = await axiosInstance.get<
    OnboardingApiResponse<CheckFanNicknameResponse>
  >("/onboarding/fan-nickname/check", {
    params: { nickname },
  });

  return data.result;
};

export const saveOnboarding = async (body: SaveOnboardingRequest) => {
  const { data } = await axiosInstance.patch<
    OnboardingApiResponse<SaveOnboardingResponse>
  >("/onboarding", body);

  return data.result;
};

export const getGenres = async () => {
  const { data } =
    await axiosInstance.get<OnboardingApiResponse<GenresResponse>>("/genres");

  return data.result;
};

export const getRegions = async () => {
  const { data } =
    await axiosInstance.get<OnboardingApiResponse<CodeName[]>>("/regions");

  return data.result;
};