import { create } from "zustand";
import type { MusicEtcPlatform } from "@/types/band/musicLink";

interface BandMusicLinksState {
  spotifyUrl: string;
  youtubeUrl: string;
  soundcloudUrl: string;
  etcPlatform: MusicEtcPlatform | null;
  etcUrl: string;
  otherUrl: string;
  setMusicLinks: (links: {
    spotifyUrl: string;
    youtubeUrl: string;
    soundcloudUrl: string;
    etcPlatform: MusicEtcPlatform | null;
    etcUrl: string;
    otherUrl: string;
  }) => void;
}

export const useBandMusicLinksStore = create<BandMusicLinksState>((set) => ({
  spotifyUrl: "",
  youtubeUrl: "",
  soundcloudUrl: "",
  etcPlatform: null,
  etcUrl: "",
  otherUrl: "",
  setMusicLinks: (links) => set(links),
}));
