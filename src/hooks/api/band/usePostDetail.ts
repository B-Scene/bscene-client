import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createFanExplorePostComment,
  deleteFanExplorePostComment,
  getFanExplorePostComments,
  getFanExplorePostDetail,
  likeFanExplorePost,
  unlikeFanExplorePost,
  updateFanExplorePostComment,
} from "@/api/fan/explore";
import type {
  FanExplorePostCommentsParams,
  FanExplorePostDetail,
  UpsertFanExplorePostCommentRequest,
} from "@/types/fan/explore";

// 밴드 본인 게시물 상세 화면에서도 팬모드와 동일한 `/posts/{postId}/detail` 계열
// 엔드포인트를 사용한다. 캐시가 팬 탐색 화면과 섞이지 않도록 키 네임스페이스만 분리한다.
export const bandPostDetailKeys = {
  all: ["bandPostDetail"] as const,
  detail: (postId: number) => [...bandPostDetailKeys.all, "detail", postId] as const,
  comments: (
    postId: number,
    params: Omit<FanExplorePostCommentsParams, "cursor">,
  ) => [...bandPostDetailKeys.all, "comments", postId, params] as const,
};

type PostLikeMutationResult = {
  isLiked: boolean;
  likeCount?: number;
};

const updatePostDetailLike = (
  currentData: FanExplorePostDetail | undefined,
  isLiked: boolean,
  likeCount?: number,
) => {
  if (!currentData) return currentData;

  return {
    ...currentData,
    isLiked,
    likeCount: likeCount ?? currentData.likeCount,
  };
};

const useBandPostLikeMutation = (
  mutationFn: (postId: number) => Promise<PostLikeMutationResult>,
  optimisticIsLiked: boolean,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({
        queryKey: bandPostDetailKeys.detail(postId),
      });

      const previousPostDetail = queryClient.getQueryData<FanExplorePostDetail>(
        bandPostDetailKeys.detail(postId),
      );

      queryClient.setQueryData(
        bandPostDetailKeys.detail(postId),
        (currentData: FanExplorePostDetail | undefined) => {
          const nextLikeCount = currentData
            ? Math.max(
                0,
                (currentData.likeCount ?? 0) + (optimisticIsLiked ? 1 : -1),
              )
            : undefined;

          return updatePostDetailLike(currentData, optimisticIsLiked, nextLikeCount);
        },
      );

      return { previousPostDetail };
    },
    onSuccess: (result, postId) => {
      queryClient.setQueryData(
        bandPostDetailKeys.detail(postId),
        (currentData: FanExplorePostDetail | undefined) =>
          updatePostDetailLike(currentData, result.isLiked, result.likeCount),
      );
    },
    onError: (_error, postId, context) => {
      if (!context?.previousPostDetail) return;

      queryClient.setQueryData(
        bandPostDetailKeys.detail(postId),
        context.previousPostDetail,
      );
    },
  });
};

export const useBandPostDetailQuery = (postId?: number) => {
  return useQuery({
    queryKey: bandPostDetailKeys.detail(postId ?? 0),
    queryFn: () => getFanExplorePostDetail(postId as number),
    enabled: typeof postId === "number" && Number.isFinite(postId) && postId > 0,
    staleTime: 1000 * 30,
  });
};

export const useLikeBandPost = () => {
  return useBandPostLikeMutation(likeFanExplorePost, true);
};

export const useUnlikeBandPost = () => {
  return useBandPostLikeMutation(unlikeFanExplorePost, false);
};

export const useBandPostCommentsQuery = (
  postId?: number,
  params: Omit<FanExplorePostCommentsParams, "cursor"> = {},
) => {
  return useInfiniteQuery({
    queryKey: bandPostDetailKeys.comments(postId ?? 0, params),
    queryFn: ({ pageParam }) =>
      getFanExplorePostComments(postId as number, {
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: typeof postId === "number" && Number.isFinite(postId) && postId > 0,
    staleTime: 1000 * 30,
  });
};

const invalidateBandPostCommentQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...bandPostDetailKeys.all, "comments", postId],
    }),
    queryClient.invalidateQueries({
      queryKey: bandPostDetailKeys.detail(postId),
    }),
  ]);
};

export const useCreateBandPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      body,
    }: {
      postId: number;
      body: UpsertFanExplorePostCommentRequest;
    }) => createFanExplorePostComment(postId, body),
    onSuccess: (_result, { postId }) =>
      invalidateBandPostCommentQueries(queryClient, postId),
  });
};

export const useUpdateBandPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFanExplorePostComment,
    onSuccess: (_result, { postId }) =>
      invalidateBandPostCommentQueries(queryClient, postId),
  });
};

export const useDeleteBandPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFanExplorePostComment,
    onSuccess: (_result, { postId }) =>
      invalidateBandPostCommentQueries(queryClient, postId),
  });
};
