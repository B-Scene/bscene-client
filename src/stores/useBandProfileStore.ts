import { create } from "zustand";

export interface BandProfile {
  id: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
  genre: string;
  regions: string[];
  memberCount: number;
  bio: string;
  stats: {
    followers: number;
    concerts: number;
    videos: number;
  };
}

const createEmptyBandProfile = (id: string): BandProfile => ({
  id,
  name: "",
  avatarUrl: "",
  verified: false,
  genre: "",
  regions: [],
  memberCount: 0,
  bio: "",
  stats: {
    followers: 0,
    concerts: 0,
    videos: 0,
  },
});

interface BandProfileState {
  bands: BandProfile[];
  activeBandId: string;
  profile: BandProfile;
  setProfile: (profile: Partial<BandProfile>) => void;
  addBand: (profile: Partial<BandProfile>) => void;
  setActiveBandId: (id: string) => void;
}

const INITIAL_BAND = createEmptyBandProfile("band-1");

export const useBandProfileStore = create<BandProfileState>((set) => ({
  bands: [INITIAL_BAND],
  activeBandId: INITIAL_BAND.id,
  profile: INITIAL_BAND,
  setProfile: (profile) =>
    set((state) => {
      const bands = state.bands.map((band) =>
        band.id === state.activeBandId ? { ...band, ...profile } : band,
      );
      return {
        bands,
        profile: bands.find((band) => band.id === state.activeBandId)!,
      };
    }),
  addBand: (profile) =>
    set((state) => {
      const newBand = {
        ...createEmptyBandProfile(`band-${Date.now()}`),
        ...profile,
      };
      return {
        bands: [...state.bands, newBand],
        activeBandId: newBand.id,
        profile: newBand,
      };
    }),
  setActiveBandId: (id) =>
    set((state) => {
      const band = state.bands.find((item) => item.id === id);
      if (!band) return state;
      return { activeBandId: id, profile: band };
    }),
}));
