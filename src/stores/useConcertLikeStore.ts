import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_LIKED_CONCERT_IDS = {
  "calendar-20260619-1": true,
  "interest-concert-1": true,
  "interest-concert-2": true,
  "interest-concert-3": true,
  "interest-concert-4": true,
  "interest-concert-5": true,
  "interest-concert-6": true,
  "interest-concert-7": true,
};

type ConcertLikeState = {
  likedConcertIds: Record<string, boolean>;
  setConcertLiked: (concertId: string, isLiked: boolean) => void;
  toggleConcertLike: (concertId: string) => boolean;
};

export const useConcertLikeStore = create<ConcertLikeState>()(
  persist(
    (set, get) => ({
      likedConcertIds: DEFAULT_LIKED_CONCERT_IDS,
      setConcertLiked: (concertId, isLiked) =>
        set((state) => ({
          likedConcertIds: {
            ...state.likedConcertIds,
            [concertId]: isLiked,
          },
        })),
      toggleConcertLike: (concertId) => {
        const nextLiked = !(get().likedConcertIds[concertId] ?? false);

        set((state) => ({
          likedConcertIds: {
            ...state.likedConcertIds,
            [concertId]: nextLiked,
          },
        }));

        return nextLiked;
      },
    }),
    {
      name: "bscene-concert-likes",
    },
  ),
);
