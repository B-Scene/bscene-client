import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSessionProfile,
  updateSessionProfile,
} from "@/api/session/sessionProfile";
import type { UpdateSessionProfileRequest } from "@/types/session/sessionProfile";

export const sessionProfileKeys = {
  all: ["sessionProfile"] as const,
  detail: () => [...sessionProfileKeys.all, "detail"] as const,
};

export const useSessionProfileQuery = () => {
  return useQuery({
    queryKey: sessionProfileKeys.detail(),
    queryFn: getSessionProfile,
    staleTime: 1000 * 30,
  });
};

export const useUpdateSessionProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateSessionProfileRequest) => updateSessionProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionProfileKeys.detail(),
      });
    },
  });
};