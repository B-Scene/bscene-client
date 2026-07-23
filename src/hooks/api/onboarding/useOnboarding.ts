import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkFanNickname,
  getGenres,
  getOnboardingStatus,
  getRegions,
  saveOnboarding,
} from "@/api/onboarding/onboarding";
import type { SaveOnboardingRequest } from "@/types/onboarding/onboarding";

export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ["onboarding", "status"],
    queryFn: getOnboardingStatus,
  });
};

export const useCheckFanNickname = () => {
  return useMutation({
    mutationFn: checkFanNickname,
  });
};

export const useSaveOnboarding = () => {
  return useMutation({
    mutationFn: (body: SaveOnboardingRequest) => saveOnboarding(body),
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });
};

export const useRegions = () => {
  return useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });
};