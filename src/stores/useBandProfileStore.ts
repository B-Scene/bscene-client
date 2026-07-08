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
    name: "WAVY",
    avatarUrl: "",
    verified: true,
    genre: "인디",
    regions: ["서울"],
    memberCount: 5,
    bio: "",
    stats: {
      followers: 128,
      concerts: 5,
      videos: 23,
    },
  },
  setProfile: (profile) =>
    set((state) => ({ profile: { ...state.profile, ...profile } })),
}));
