import { create } from "zustand";

export type BandPostType = "사진" | "글" | "영상";

export interface BandPost {
  id: string;
  contentType: BandPostType;
  title: string;
  description: string;
  imageUrls: string[];
  videoUrl: string | null;
  tags: string[];
  createdAt: string;
}

interface BandPostsState {
  posts: BandPost[];
  addPost: (post: BandPost) => void;
  removePost: (id: string) => void;
}

export const useBandPostsStore = create<BandPostsState>((set) => ({
  posts: [],
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  removePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
    })),
}));
