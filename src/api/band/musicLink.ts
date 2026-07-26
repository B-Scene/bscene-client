import { axiosInstance } from "@/api/axiosInstance";
import type {
  BandApiResponse,
  MusicLinksResponse,
  SaveMusicLinksRequest,
  SaveMusicLinksResponse,
} from "@/types/band/musicLink";

export const getMusicLinks = async (bandId: number) => {
  const { data } = await axiosInstance.get<BandApiResponse<MusicLinksResponse>>(
    `/bands/${bandId}/music-links`,
  );

  return data.result;
};

export const saveMusicLinks = async (
  bandId: number,
  body: SaveMusicLinksRequest,
) => {
  const { data } = await axiosInstance.put<
    BandApiResponse<SaveMusicLinksResponse>
  >(`/bands/${bandId}/music-links`, body);

  return data.result;
};
