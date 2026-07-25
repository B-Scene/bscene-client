import { create } from "zustand";

export interface BandMusicOtherLink {
  id: string;
  label: string;
  url: string;
}

interface BandMusicLinksState {
  spotifyUrl: string;
  youtubeUrl: string;
  soundcloudUrl: string;
  otherLinks: BandMusicOtherLink[];
  setMusicLinks: (links: {
    spotifyUrl: string;
    youtubeUrl: string;
    soundcloudUrl: string;
    otherLinks: BandMusicOtherLink[];
  }) => void;
}

export const useBandMusicLinksStore = create<BandMusicLinksState>((set) => ({
  spotifyUrl: "",
  youtubeUrl: "",
  soundcloudUrl: "",
  otherLinks: [],
  setMusicLinks: (links) => set(links),
}));
