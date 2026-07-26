import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFanInformation, updateFanInformation } from "@/api/user/fanInformation";
import type { UpdateFanInformationRequest } from "@/types/user/fanInformation";
import { fanMyPageKeys } from "@/hooks/api/user/useFanMyPage";

export const fanInformationKeys = {
  all: ["fanInformation"] as const,
};

export const useFanInformationQuery = () => {
  return useQuery({
    queryKey: fanInformationKeys.all,
    queryFn: getFanInformation,
  });
};

export const useUpdateFanInformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateFanInformationRequest) =>
      updateFanInformation(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fanInformationKeys.all });
      queryClient.invalidateQueries({ queryKey: fanMyPageKeys.all });
    },
  });
};
