import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMusicLinks, saveMusicLinks } from "@/api/band/musicLink";
import type { SaveMusicLinksRequest } from "@/types/band/musicLink";

export const musicLinkKeys = {
  all: ["musicLink"] as const,
  detail: (bandId: number) => [...musicLinkKeys.all, bandId] as const,
};

export const useMusicLinksQuery = (bandId: number) => {
  return useQuery({
    queryKey: musicLinkKeys.detail(bandId),
    queryFn: () => getMusicLinks(bandId),
    staleTime: 1000 * 30,
    enabled: Number.isFinite(bandId),
  });
};

export const useSaveMusicLinks = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveMusicLinksRequest) => saveMusicLinks(bandId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: musicLinkKeys.detail(bandId),
      });
    },
  });
};
