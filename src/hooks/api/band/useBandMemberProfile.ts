import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateBandMemberProfile,
  createBandMemberProfile,
  deleteBandMemberProfile,
  getActiveBandMemberProfile,
  getBandMemberProfile,
  getBandMemberProfiles,
  updateBandMemberProfile,
} from "@/api/band/bandMemberProfile";
import type {
  CreateBandMemberProfileRequest,
  UpdateBandMemberProfileRequest,
} from "@/types/band/bandMemberProfile";
import { myProfilesKeys } from "@/hooks/api/user/useMyProfiles";

export const bandMemberProfileKeys = {
  all: ["bandMemberProfile"] as const,
  lists: () => [...bandMemberProfileKeys.all, "list"] as const,
  active: () => [...bandMemberProfileKeys.all, "active"] as const,
  detail: (profileId: number) =>
    [...bandMemberProfileKeys.all, "detail", profileId] as const,
};

export const useBandMemberProfilesQuery = () => {
  return useQuery({
    queryKey: bandMemberProfileKeys.lists(),
    queryFn: getBandMemberProfiles,
    staleTime: 1000 * 30,
  });
};

export const useBandMemberProfileQuery = (profileId: number) => {
  return useQuery({
    queryKey: bandMemberProfileKeys.detail(profileId),
    queryFn: () => getBandMemberProfile(profileId),
    staleTime: 1000 * 30,
  });
};

export const useActiveBandMemberProfileQuery = () => {
  return useQuery({
    queryKey: bandMemberProfileKeys.active(),
    queryFn: getActiveBandMemberProfile,
    staleTime: 1000 * 30,
  });
};

export const useCreateBandMemberProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBandMemberProfileRequest) =>
      createBandMemberProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
    },
  });
};

export const useUpdateBandMemberProfile = (profileId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateBandMemberProfileRequest) =>
      updateBandMemberProfile(profileId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
    },
  });
};

export const useDeleteBandMemberProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: number) => deleteBandMemberProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
    },
  });
};

export const useActivateBandMemberProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: number) => activateBandMemberProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
    },
  });
};
