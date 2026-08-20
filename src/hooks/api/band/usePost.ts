import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "@/api/band/post";
import { bandPostDetailKeys } from "@/hooks/api/band/usePostDetail";
import type {
  CreatePostRequest,
  GetPostsParams,
  UpdatePostRequest,
} from "@/types/band/post";

export const postKeys = {
  all: ["post"] as const,
  listsRoot: (bandId: number) => [...postKeys.all, "list", bandId] as const,
  lists: (bandId: number, params: GetPostsParams = {}) =>
    [...postKeys.listsRoot(bandId), params] as const,
  detail: (postId: number) => [...postKeys.all, "detail", postId] as const,
};

export const usePostsQuery = (bandId: number, params: GetPostsParams = {}) => {
  return useQuery({
    queryKey: postKeys.lists(bandId, params),
    queryFn: () => getPosts(bandId, params),
    staleTime: 1000 * 30,
    enabled: Number.isFinite(bandId),
  });
};

export const usePostQuery = (postId: number) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPost(postId),
    staleTime: 1000 * 30,
    enabled: Number.isFinite(postId),
  });
};

export const useCreatePost = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePostRequest) => createPost(bandId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.listsRoot(bandId) });
    },
  });
};

export const useUpdatePost = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePostRequest) => updatePost(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({
        queryKey: bandPostDetailKeys.detail(postId),
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
};
