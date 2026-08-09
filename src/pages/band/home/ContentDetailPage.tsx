import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import CommentIcon from "@/assets/icons/Comment.svg";
import HeartIcon from "@/assets/icons/Heart.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import DefaultBandAvatar from "@/assets/icons/band/band-default-profile.svg";
import OfficialIcon from "@/assets/icons/band/official-icon.svg";
import DefaultUserAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/common/Header/Header";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { useBandQuery } from "@/hooks/api/band/useBand";
import { useBandMembersQuery } from "@/hooks/api/band/useBandMember";
import {
  useBandPostCommentsQuery,
  useBandPostDetailQuery,
  useCreateBandPostComment,
  useDeleteBandPostComment,
  useLikeBandPost,
  useUnlikeBandPost,
  useUpdateBandPostComment,
} from "@/hooks/api/band/usePostDetail";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import { getStoredAuthUser } from "@/utils/authUser";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import type {
  FanExplorePostMediaType,
  NormalizedFanExplorePostComment,
} from "@/types/fan/explore";
import { PhotoLightbox } from "@/pages/fan/explore/components/PhotoLightbox";

const COMMENT_PAGE_SIZE = 10;

const getPostMediaType = (type?: string | null): FanExplorePostMediaType => {
  if (type === "VIDEO") return "VIDEO";
  if (type === "TEXT") return "TEXT";
  return "PHOTO";
};

const getCommentMutationErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) {
      return "본인이 작성한 댓글만 수정하거나 삭제할 수 있어요.";
    }

    if (error.response?.status === 404) {
      return "댓글을 찾을 수 없어요.";
    }
  }

  return getApiErrorMessage(error, fallbackMessage);
};

const getCommentKey = (
  prefix: string,
  comment: NormalizedFanExplorePostComment,
  index: number,
) => `${prefix}-${comment.commentId ?? `missing-${index}`}`;

interface CommentItemProps {
  comment: NormalizedFanExplorePostComment;
  isEditable: boolean;
  isEditing: boolean;
  editValue: string;
  isPending: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onSubmitEdit: () => void;
  onDelete: () => void;
}

const CommentItem = ({
  comment,
  isEditable,
  isEditing,
  editValue,
  isPending,
  onStartEdit,
  onCancelEdit,
  onEditValueChange,
  onSubmitEdit,
  onDelete,
}: CommentItemProps) => {
  const isBandMember =
    comment.writerMode === "BAND" || comment.hasUnresolvedNickname;

  return (
    <article className="flex w-full gap-[16px]">
      <img
        src={comment.profileImageUrl ?? DefaultUserAvatar}
        alt=""
        className="size-[35px] shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[6px]">
          <strong className="font-body text-caption3 text-neutral-900">
            {comment.authorName}
          </strong>
          {isBandMember ? (
            <img src={OfficialIcon} alt="밴드 멤버" className="size-4 shrink-0" />
          ) : null}
          {comment.createdAt ? (
            <span className="font-body text-caption4 text-neutral-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-[6px] flex flex-col gap-[8px]">
            <textarea
              value={editValue}
              onChange={(event) => onEditValueChange(event.target.value)}
              maxLength={500}
              className="min-h-[48px] w-full resize-none rounded-[8px] border border-neutral-300 bg-neutral-0 px-[10px] py-[8px] font-body text-caption2 text-neutral-900 outline-none focus:border-secondary-500"
            />
            <div className="flex justify-end gap-[8px]">
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={isPending}
                className="font-body text-caption3 text-neutral-600 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onSubmitEdit}
                disabled={isPending || !editValue.trim()}
                className="font-body text-caption3 text-secondary-500 disabled:text-neutral-500"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <p className="m-0 font-body text-caption2 text-neutral-700">
            {comment.content}
          </p>
        )}

        {!isEditing && isEditable ? (
          <div className="mt-[6px] flex gap-[10px]">
            <button
              type="button"
              onClick={onStartEdit}
              className="font-body text-caption4 text-neutral-600"
            >
              수정
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isPending}
              className="font-body text-caption4 text-neutral-600 disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
};

const ContentDetailLoading = ({ onBack }: { onBack: () => void }) => {
  return (
    <main className="min-h-dvh bg-neutral-0">
      <Header title="" onBack={onBack} />
      <article className="animate-pulse px-[25px] pt-[24px]">
        <div className="flex items-center gap-[16px]">
          <div className="size-[42px] rounded-full bg-neutral-300" />
          <div className="min-w-0 flex-1">
            <div className="h-[18px] w-[120px] rounded bg-neutral-300" />
            <div className="mt-[8px] h-[12px] w-[72px] rounded bg-neutral-300" />
          </div>
        </div>
        <div className="mt-[24px] h-[422px] w-full bg-neutral-300" />
        <div className="mt-[24px] flex gap-[24px]">
          <div className="h-[20px] w-[48px] rounded bg-neutral-300" />
          <div className="h-[20px] w-[48px] rounded bg-neutral-300" />
        </div>
        <div className="mt-[16px] h-[20px] w-[220px] rounded bg-neutral-300" />
        <div className="mt-[12px] h-[56px] w-full rounded bg-neutral-300" />
      </article>
    </main>
  );
};

const ContentDetailPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const activeBandId = useActiveBandId();
  const { data: band } = useBandQuery(activeBandId ?? NaN);

  const numericPostId = Number(postId);
  const validPostId = Number.isFinite(numericPostId)
    ? numericPostId
    : undefined;

  const bandMembersQuery = useBandMembersQuery(activeBandId ?? NaN);
  const currentUser = getStoredAuthUser();
  const myBandMemberNickname = bandMembersQuery.data?.find(
    (member) => member.userId === currentUser?.userId,
  )?.profileNickname;

  const postDetailQuery = useBandPostDetailQuery(validPostId);
  const commentsQuery = useBandPostCommentsQuery(validPostId, {
    size: COMMENT_PAGE_SIZE,
  });
  const likePostMutation = useLikeBandPost();
  const unlikePostMutation = useUnlikeBandPost();
  const createCommentMutation = useCreateBandPostComment();
  const updateCommentMutation = useUpdateBandPostComment();
  const deleteCommentMutation = useDeleteBandPostComment();
  const postDetail = postDetailQuery.data;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [likeOverride, setLikeOverride] = useState<{
    isLiked: boolean;
    likeCount: number;
  } | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");
  const [commentErrorMessage, setCommentErrorMessage] = useState("");
  const commentSentinelRef = useInfiniteScrollObserver({
    enabled:
      Boolean(commentsQuery.hasNextPage) && !commentsQuery.isFetchingNextPage,
    onIntersect: commentsQuery.fetchNextPage,
  });

  if (postDetailQuery.isLoading) {
    return <ContentDetailLoading onBack={() => navigate(-1)} />;
  }

  if (postDetailQuery.isError || !postDetail) {
    return (
      <main className="min-h-dvh bg-neutral-0">
        <Header title="" onBack={() => navigate(-1)} />
        <section className="flex min-h-[420px] flex-col items-center justify-center px-[25px] text-center">
          <h1 className="m-0 font-body text-label1 text-neutral-900">
            콘텐츠를 불러오지 못했어요
          </h1>
          <p className="m-0 mt-[8px] font-body text-caption2 text-neutral-600">
            잠시 후 다시 시도해주세요
          </p>
          <button
            type="button"
            onClick={() => void postDetailQuery.refetch()}
            className="mt-[20px] flex h-[38px] items-center justify-center rounded-[8px] bg-secondary-500 px-[20px] font-body text-body1 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      </main>
    );
  }

  const bandName = band?.name ?? postDetail.bandName ?? "";
  const profileImageUrl = band?.profileImageUrl ?? postDetail.profileImageUrl;
  const createdAt = postDetail.createdAt ?? "";
  const timeAgo = createdAt ? formatRelativeTime(createdAt) : "";
  const mediaType = getPostMediaType(
    postDetail.type ?? postDetail.mediaType ?? postDetail.contentType,
  );
  const imageUrls = Array.isArray(postDetail.mediaUrls)
    ? postDetail.mediaUrls
    : [];
  const hasContentImages = imageUrls.length > 0;
  const shouldRenderMedia = mediaType !== "TEXT" && hasContentImages;
  const imageCount = hasContentImages ? imageUrls.length : 0;
  const isLiked = likeOverride?.isLiked ?? postDetail.isLiked ?? false;
  const baseLikeCount = postDetail.likeCount ?? 0;
  const likeCount = likeOverride?.likeCount ?? baseLikeCount;
  const isLikePending =
    likePostMutation.isPending || unlikePostMutation.isPending;
  const comments =
    commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const commentIds = new Set(
    comments
      .map((comment) => comment.commentId)
      .filter((commentId): commentId is number => commentId !== null),
  );
  const applyMyNicknameFallback = (
    comment: NormalizedFanExplorePostComment,
  ): NormalizedFanExplorePostComment =>
    comment.hasUnresolvedNickname && myBandMemberNickname
      ? { ...comment, authorName: myBandMemberNickname }
      : comment;
  const rawMyComments = commentsQuery.data?.pages[0]?.myComments ?? [];
  const myCommentIds = new Set(
    rawMyComments
      .map((comment) => comment.commentId)
      .filter((commentId): commentId is number => commentId !== null),
  );
  const myComments = rawMyComments
    .filter(
      (comment) =>
        comment.commentId === null || !commentIds.has(comment.commentId),
    )
    .map(applyMyNicknameFallback);
  const commentCount =
    postDetail.commentCount ?? myComments.length + comments.length;
  const isCommentMutationPending =
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending;
  const title = postDetail.title ?? "";
  const content =
    postDetail.contentText ??
    (typeof postDetail.content === "string" ? postDetail.content : null) ??
    postDetail.body ??
    postDetail.text ??
    "";
  const hasContent = content.trim().length > 0;
  const tags = Array.isArray(postDetail.tags) ? postDetail.tags : [];

  const handleImageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const nextIndex = Math.round(container.scrollLeft / container.clientWidth);

    setActiveImageIndex(Math.min(imageCount - 1, Math.max(0, nextIndex)));
  };

  const handleLikeClick = () => {
    if (!validPostId || isLikePending) return;

    const previousLikeOverride = likeOverride;

    if (isLiked) {
      setLikeOverride({
        isLiked: false,
        likeCount: Math.max(0, likeCount - 1),
      });

      unlikePostMutation.mutate(validPostId, {
        onSuccess: () => setLikeOverride(null),
        onError: () => setLikeOverride(previousLikeOverride),
      });
      return;
    }

    setLikeOverride({
      isLiked: true,
      likeCount: likeCount + 1,
    });

    likePostMutation.mutate(validPostId, {
      onSuccess: () => setLikeOverride(null),
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          setLikeOverride({ isLiked: true, likeCount });
          return;
        }

        setLikeOverride(previousLikeOverride);
      },
    });
  };

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const contentValue = commentDraft.trim();

    if (!validPostId || !contentValue || createCommentMutation.isPending) {
      return;
    }

    setCommentErrorMessage("");

    try {
      await createCommentMutation.mutateAsync({
        postId: validPostId,
        body: { content: contentValue },
      });
      setCommentDraft("");
    } catch (error) {
      setCommentErrorMessage(
        getApiErrorMessage(
          error,
          "댓글을 등록하지 못했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    }
  };

  const handleStartEditComment = (comment: NormalizedFanExplorePostComment) => {
    if (comment.commentId === null) return;

    setCommentErrorMessage("");
    setEditingCommentId(comment.commentId);
    setEditingCommentDraft(comment.content);
  };

  const handleSubmitEditComment = async () => {
    const contentValue = editingCommentDraft.trim();

    if (
      !validPostId ||
      editingCommentId == null ||
      !contentValue ||
      updateCommentMutation.isPending
    ) {
      return;
    }

    setCommentErrorMessage("");

    try {
      await updateCommentMutation.mutateAsync({
        postId: validPostId,
        commentId: editingCommentId,
        body: { content: contentValue },
      });
      setEditingCommentId(null);
      setEditingCommentDraft("");
    } catch (error) {
      setCommentErrorMessage(
        getCommentMutationErrorMessage(
          error,
          "댓글을 수정하지 못했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    }
  };

  const handleDeleteComment = async (commentId: number | null) => {
    if (!validPostId || commentId === null || deleteCommentMutation.isPending)
      return;
    if (!window.confirm("댓글을 삭제할까요?")) return;

    setCommentErrorMessage("");

    try {
      await deleteCommentMutation.mutateAsync({
        postId: validPostId,
        commentId,
      });
    } catch (error) {
      setCommentErrorMessage(
        getCommentMutationErrorMessage(
          error,
          "댓글을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    }
  };

  return (
    <main className="min-h-dvh bg-secondary-0 pb-[calc(var(--bottom-nav-height)+12px)]">
      <Header title="" onBack={() => navigate(-1)} />

      <article className="bg-neutral-0 px-[25px] p-[24px]">
        <header className="flex items-center gap-[16px]">
          <div className="flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-neutral-600">
            <img
              src={profileImageUrl ?? DefaultBandAvatar}
              alt={`${bandName} 프로필`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="m-0 truncate font-body text-label1 text-neutral-900">
              {bandName}
            </h1>
            <p className="m-0 mt-[4px] font-body text-caption3 text-neutral-600">
              {timeAgo}
            </p>
          </div>
        </header>

        {shouldRenderMedia ? (
          <div
            className="mt-[24px] flex h-[422px] w-full snap-x snap-mandatory overflow-x-auto bg-neutral-300 text-neutral-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={handleImageScroll}
          >
            {mediaType === "VIDEO" ? (
              <video
                src={imageUrls[0]}
                poster={postDetail.thumbnailUrl ?? undefined}
                controls
                className="h-full w-full shrink-0 snap-center object-cover"
              />
            ) : (
              imageUrls.map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`콘텐츠 이미지 ${index + 1}`}
                  onClick={() => setLightboxIndex(index)}
                  className="h-full w-full shrink-0 snap-center cursor-zoom-in object-cover"
                />
              ))
            )}
          </div>
        ) : null}

        {shouldRenderMedia && imageCount > 1 ? (
          <div className="mt-[8px] flex justify-center gap-[4px]">
            {Array.from({ length: imageCount }).map((_, index) => (
              <span
                key={`content-image-dot-${index}`}
                className={
                  index === activeImageIndex
                    ? "size-[4px] rounded-full bg-secondary-500"
                    : "size-[4px] rounded-full bg-neutral-400"
                }
              />
            ))}
          </div>
        ) : null}

        <div className="mt-[24px] flex items-center gap-[24px]">
          <button
            type="button"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            aria-pressed={isLiked}
            onClick={handleLikeClick}
            disabled={isLikePending}
            className="flex items-center gap-[4px] font-body text-caption3 text-neutral-900"
          >
            <span className="flex size-[24px] shrink-0 items-center justify-center">
              <img
                src={isLiked ? LikedHeartIcon : HeartIcon}
                alt=""
                className="size-[25px]"
              />
            </span>
            {likeCount}
          </button>
          <span className="flex items-center gap-[4px] font-body text-caption3 text-neutral-900">
            <img src={CommentIcon} alt="" className="size-[20px]" />
            {commentCount}
          </span>
        </div>

        <section className="mt-[16px]">
          <h2 className="m-0 font-body text-body1 text-neutral-900">{title}</h2>
          {hasContent ? (
            <p className="m-0 mt-[8px] whitespace-pre-line font-caption2 text-caption2 text-neutral-900">
              {content}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="mt-[16px] flex flex-wrap gap-[8px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex h-[26px] min-w-[51px] items-center justify-center rounded-full bg-secondary-100 px-[15px] font-body text-caption3 text-secondary-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </article>

      <section className="inline-flex w-full flex-col items-start gap-[16px] bg-secondary-0 pl-[25px] pr-[26px] pt-[16px]">
        <h2 className="m-0 font-body text-caption3 text-neutral-900">
          댓글 {commentCount}
        </h2>

        <form
          onSubmit={handleSubmitComment}
          className="flex w-full flex-col gap-[8px]"
        >
          <textarea
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
              if (
                event.nativeEvent.isComposing ||
                event.key !== "Enter" ||
                event.shiftKey
              )
                return;

              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }}
            maxLength={500}
            placeholder="댓글을 입력해주세요"
            className="min-h-[48px] w-full resize-none rounded-[8px] border border-neutral-300 bg-neutral-0 px-[12px] py-[8px] font-body text-caption2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-secondary-500"
          />
          <div className="flex items-center justify-between">
            <span className="font-body text-caption4 text-neutral-500">
              {commentDraft.length}/500
            </span>
            <button
              type="submit"
              disabled={!commentDraft.trim() || createCommentMutation.isPending}
              className="flex h-[32px] min-w-[68px] items-center justify-center rounded-[8px] bg-secondary-500 px-[14px] font-body text-caption3 text-neutral-0 disabled:bg-neutral-400"
            >
              등록
            </button>
          </div>
        </form>

        {commentErrorMessage ? (
          <p className="m-0 font-body text-caption3 text-secondary-500">
            {commentErrorMessage}
          </p>
        ) : null}

        {commentsQuery.isLoading ? (
          <p className="m-0 font-body text-caption2 text-neutral-600">
            댓글을 불러오고 있어요
          </p>
        ) : commentsQuery.isError ? (
          <div className="flex w-full items-center justify-between gap-[12px]">
            <p className="m-0 font-body text-caption2 text-neutral-600">
              댓글을 불러오지 못했어요
            </p>
            <button
              type="button"
              onClick={() => void commentsQuery.refetch()}
              className="font-body text-caption3 text-secondary-500"
            >
              다시 시도
            </button>
          </div>
        ) : myComments.length > 0 || comments.length > 0 ? (
          <>
            {myComments.length > 0 ? (
              <div className="flex w-full flex-col gap-[12px]">
                <h3 className="m-0 font-body text-caption3 text-neutral-700">
                  내 댓글
                </h3>
                {myComments.map((comment, index) => (
                  <CommentItem
                    key={getCommentKey("my-comment", comment, index)}
                    comment={comment}
                    isEditable={comment.commentId !== null}
                    isEditing={
                      comment.commentId !== null &&
                      editingCommentId === comment.commentId
                    }
                    editValue={editingCommentDraft}
                    isPending={isCommentMutationPending}
                    onStartEdit={() => handleStartEditComment(comment)}
                    onCancelEdit={() => {
                      setEditingCommentId(null);
                      setEditingCommentDraft("");
                    }}
                    onEditValueChange={setEditingCommentDraft}
                    onSubmitEdit={() => void handleSubmitEditComment()}
                    onDelete={() => void handleDeleteComment(comment.commentId)}
                  />
                ))}
              </div>
            ) : null}

            {comments.length > 0 ? (
              <div className="flex w-full flex-col gap-[12px]">
                {myComments.length > 0 ? (
                  <h3 className="m-0 font-body text-caption3 text-neutral-700">
                    전체 댓글
                  </h3>
                ) : null}
                {comments.map((comment, index) => {
                  const isEditable =
                    comment.commentId !== null &&
                    (comment.isMine ||
                      myCommentIds.has(comment.commentId) ||
                      (currentUser?.userId != null &&
                        comment.authorId === currentUser.userId));
                  const displayComment = isEditable
                    ? applyMyNicknameFallback(comment)
                    : comment;

                  return (
                    <CommentItem
                      key={getCommentKey("comment", comment, index)}
                      comment={displayComment}
                      isEditable={isEditable}
                      isEditing={
                        comment.commentId !== null &&
                        editingCommentId === comment.commentId
                      }
                      editValue={editingCommentDraft}
                      isPending={isCommentMutationPending}
                      onStartEdit={() => handleStartEditComment(comment)}
                      onCancelEdit={() => {
                        setEditingCommentId(null);
                        setEditingCommentDraft("");
                      }}
                      onEditValueChange={setEditingCommentDraft}
                      onSubmitEdit={() => void handleSubmitEditComment()}
                      onDelete={() =>
                        void handleDeleteComment(comment.commentId)
                      }
                    />
                  );
                })}
              </div>
            ) : null}

            <div ref={commentSentinelRef} className="h-[1px] w-full" />
            {commentsQuery.isFetchingNextPage ? (
              <p className="m-0 font-body text-caption2 text-neutral-600">
                댓글을 더 불러오고 있어요
              </p>
            ) : null}
          </>
        ) : (
          <p className="m-0 font-body text-caption2 text-neutral-600">
            아직 댓글이 없어요
          </p>
        )}
      </section>

      {lightboxIndex !== null && mediaType !== "VIDEO" ? (
        <PhotoLightbox
          images={imageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </main>
  );
};

export default ContentDetailPage;
