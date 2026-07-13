import { create } from "zustand";

export interface BandProfile {
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

interface BandProfileState {
  profile: BandProfile;
  setProfile: (profile: Partial<BandProfile>) => void;
}

export const useBandProfileStore = create<BandProfileState>((set) => ({
  profile: {
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
  },
  setProfile: (profile) =>
    set((state) => ({ profile: { ...state.profile, ...profile } })),
}));
