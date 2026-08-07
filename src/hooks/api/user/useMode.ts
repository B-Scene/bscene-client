import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUserMode, toggleUserMode } from "@/api/user/mode";
import type { ChangeUserModeRequest } from "@/types/user/mode";
import { myProfilesKeys } from "@/hooks/api/user/useMyProfiles";
import { bandMemberProfileKeys } from "@/hooks/api/band/useBandMemberProfile";
import { fanMyPageKeys } from "@/hooks/api/user/useFanMyPage";
import { bandMyPageKeys } from "@/hooks/api/user/useBandMyPage";

export const useChangeUserMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChangeUserModeRequest) => changeUserMode(body),
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: fanMyPageKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMyPageKeys.all });
    },
  });
};
