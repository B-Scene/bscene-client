import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUserMode } from "@/api/user/mode";
import type { ChangeUserModeRequest } from "@/types/user/mode";
import { myProfilesKeys } from "@/hooks/api/user/useMyProfiles";
import { bandMemberProfileKeys } from "@/hooks/api/band/useBandMemberProfile";

export const useChangeUserMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChangeUserModeRequest) => changeUserMode(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
    },
  });
};
