import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptBandInvite,
  getBandMembers,
  inviteBandMember,
  rejectBandInvite,
  removeBandMember,
  searchBandMemberCandidates,
} from "@/api/band/bandMember";
import type {
  AcceptBandInviteRequest,
  InviteBandMemberRequest,
} from "@/types/band/bandMember";
import { bandMemberProfileKeys } from "@/hooks/api/band/useBandMemberProfile";

export const bandMemberKeys = {
  all: ["bandMember"] as const,
  lists: (bandId: number) =>
    [...bandMemberKeys.all, "list", bandId] as const,
  search: (bandId: number, keyword: string) =>
    [...bandMemberKeys.all, "search", bandId, keyword] as const,
};

export const useBandMembersQuery = (bandId: number) => {
  return useQuery({
    queryKey: bandMemberKeys.lists(bandId),
    queryFn: () => getBandMembers(bandId),
    staleTime: 1000 * 30,
    enabled: Number.isFinite(bandId),
  });
};

export const useBandMemberCandidatesQuery = (
  bandId: number,
  keyword: string,
) => {
  return useQuery({
    queryKey: bandMemberKeys.search(bandId, keyword),
    queryFn: () => searchBandMemberCandidates(bandId, keyword),
    enabled: Number.isFinite(bandId) && keyword.trim().length > 0,
    staleTime: 1000 * 30,
  });
};

export const useInviteBandMember = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InviteBandMemberRequest) =>
      inviteBandMember(bandId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberKeys.lists(bandId) });
    },
  });
};

export const useAcceptBandInvite = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AcceptBandInviteRequest) =>
      acceptBandInvite(bandId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberKeys.lists(bandId) });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
    },
  });
};

export const useRejectBandInvite = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rejectBandInvite(bandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberKeys.lists(bandId) });
    },
  });
};

export const useRemoveBandMember = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => removeBandMember(bandId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bandMemberKeys.lists(bandId) });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
    },
  });
};
