import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkFanNickname,
  getGenres,
  getOnboardingStatus,
  getRegions,
  saveOnboarding,
} from "@/api/onboarding/onboarding";
import type { SaveOnboardingRequest } from "@/types/onboarding/onboarding";
import { myProfilesKeys } from "@/hooks/api/user/useMyProfiles";
import { bandMemberProfileKeys } from "@/hooks/api/band/useBandMemberProfile";
import { fanMyPageKeys } from "@/hooks/api/user/useFanMyPage";
import { bandMyPageKeys } from "@/hooks/api/user/useBandMyPage";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveOnboardingRequest) => saveOnboarding(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: fanMyPageKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMyPageKeys.all });
    },
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