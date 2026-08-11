import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUserMode, toggleUserMode } from "@/api/user/mode";
import type { ChangeUserModeRequest } from "@/types/user/mode";
import { myProfilesKeys } from "@/hooks/api/user/useMyProfiles";
import { bandMemberProfileKeys } from "@/hooks/api/band/useBandMemberProfile";
import { fanMyPageKeys } from "@/hooks/api/user/useFanMyPage";
import { bandMyPageKeys } from "@/hooks/api/user/useBandMyPage";
import { onboardingStatusKeys } from "@/hooks/api/onboarding/useOnboarding";

export const useChangeUserMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChangeUserModeRequest) => changeUserMode(body),
    onSuccess: async () => {
      // ModeGuard reads onboarding status to decide whether the destination
      // route is allowed, so it must be refetched before navigation happens
      // (see the mutate-level onSuccess in ModeSwitchSheet) or it redirects
      // back using the stale mode.
      await queryClient.invalidateQueries({ queryKey: onboardingStatusKeys.all });
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: fanMyPageKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMyPageKeys.all });
    },
  });
};

export const useToggleUserMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleUserMode(),
    onSuccess: async () => {
      // See useChangeUserMode: ModeGuard needs fresh onboarding status
      // before the caller navigates, or it bounces back to the old mode.
      await queryClient.invalidateQueries({ queryKey: onboardingStatusKeys.all });
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: fanMyPageKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMyPageKeys.all });
    },
  });
};
