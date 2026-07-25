import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkBandName,
  createBand,
  getBand,
  updateBand,
} from "@/api/band/band";
import type { CreateBandRequest, UpdateBandRequest } from "@/types/band/band";
import { bandMemberProfileKeys } from "@/hooks/api/band/useBandMemberProfile";
import { myProfilesKeys } from "@/hooks/api/user/useMyProfiles";

export const bandKeys = {
  all: ["band"] as const,
  detail: (bandId: number) => [...bandKeys.all, "detail", bandId] as const,
};

export const useBandQuery = (bandId: number) => {
  return useQuery({
    queryKey: bandKeys.detail(bandId),
    queryFn: () => getBand(bandId),
    staleTime: 1000 * 30,
    enabled: Number.isFinite(bandId),
  });
};

export const useCreateBand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBandRequest) => createBand(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
    },
  });
};

export const useCheckBandName = () => {
  return useMutation({
    mutationFn: (name: string) => checkBandName(name),
  });
};

export const useUpdateBand = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateBandRequest) => updateBand(bandId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandKeys.detail(bandId) });
    },
  });
};
