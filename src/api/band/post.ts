import { axiosInstance } from "@/api/axiosInstance";
import type {
  BandApiResponse,
  CreatePostRequest,
  CreatePostResponse,
  GetPostsParams,
  PostDetailResponse,
  PostListResponse,
  UpdatePostRequest,
  UpdatePostResponse,
} from "@/types/band/post";

export const createPost = async (bandId: number, body: CreatePostRequest) => {
  const { data } = await axiosInstance.post<
    BandApiResponse<CreatePostResponse>
  >(`/bands/${bandId}/posts`, body);

  return data.result;
};

export const getPosts = async (
  bandId: number,
  params: GetPostsParams = {},
) => {
  const { data } = await axiosInstance.get<BandApiResponse<PostListResponse>>(
    `/bands/${bandId}/posts`,
    { params },
  );

  return data.result;
};

export const getPost = async (postId: number) => {
  const { data } = await axiosInstance.get<BandApiResponse<PostDetailResponse>>(
    `/posts/${postId}`,
  );

  return data.result;
};

export const updatePost = async (postId: number, body: UpdatePostRequest) => {
  const { data } = await axiosInstance.put<BandApiResponse<UpdatePostResponse>>(
    `/posts/${postId}`,
    body,
  );

  return data.result;
};

export const deletePost = async (postId: number) => {
  const { data } = await axiosInstance.delete<BandApiResponse<null>>(
    `/posts/${postId}`,
  );

  return data.result;
};
