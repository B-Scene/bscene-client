import { create } from "zustand";

export type ConcertStatus = "scheduled" | "draft";

export interface Concert {
  id: string;
  title: string;
  genre: string;
  region: string;
  ageRating: string;
  description: string;
  posterUrl: string;
  tags: string[];
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  price: string;
  ticketLinks: string[];
  status: ConcertStatus;
}

interface ConcertsState {
  concerts: Concert[];
  addConcert: (concert: Concert) => void;
  updateConcert: (id: string, concert: Concert) => void;
  removeConcert: (id: string) => void;
}

export const useConcertsStore = create<ConcertsState>((set) => ({
  concerts: [],
  addConcert: (concert) =>
    set((state) => ({ concerts: [concert, ...state.concerts] })),
  updateConcert: (id, concert) =>
    set((state) => ({
      concerts: state.concerts.map((item) => (item.id === id ? concert : item)),
    })),
  removeConcert: (id) =>
    set((state) => ({
      concerts: state.concerts.filter((concert) => concert.id !== id),
    })),
}));
