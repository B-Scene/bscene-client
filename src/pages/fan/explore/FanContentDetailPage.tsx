import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CommentIcon from "@/assets/icons/Comment.svg";
import HeartIcon from "@/assets/icons/Heart.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import BandImage from "@/assets/icons/band/band-default-profile.svg";
import OfficialIcon from "@/assets/icons/band/official-icon.svg";
import DefaultUserAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/common/Header/Header";
import {
  useCreateFanExplorePostComment,
  useDeleteFanExplorePostComment,
  useFanExplorePostDetailQuery,
  useFanExplorePostCommentsQuery,
  useLikeFanExplorePost,
  useUnlikeFanExplorePost,
  useUpdateFanExplorePostComment,
} from "@/hooks/api/fan/useFanExplore";
import { useBandMembersQuery } from "@/hooks/api/band/useBandMember";
import { getStoredAuthUser } from "@/utils/authUser";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type { NormalizedFanExplorePostComment } from "@/types/fan/explore";
import type { FanExplorePostMediaType } from "@/types/fan/explore";
import { PhotoLightbox } from "./components/PhotoLightbox";

const TAGS = ["합주", "인디밴드", "홍대", "공연준비"];
const BASE_LIKE_COUNT = 412;
const COMMENT_PAGE_SIZE = 10;
const DEFAULT_CONTENT_CREATED_AT = new Date(
  Date.now() - 3 * 60 * 60 * 1000,
).toISOString();
const MOCK_CONTENT_IMAGES = [
  { id: "image-1", className: "bg-neutral-300" },
  { id: "image-2", className: "bg-primary-50" },
  { id: "image-3", className: "bg-neutral-200" },
];

const ImagePlaceholderIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="5"
      width="16"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 16L10.5 12.5L13 15L14.5 13.5L18 17"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const formatRelativeTime = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const createdTime = createdDate.getTime();

  if (Number.isNaN(createdTime)) return "";

  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdTime) / 1000),
  );
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return createdDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getImageUrls = (
  imageUrlsValue: string | null,
  imageUrl: string | null,
) => {
  if (imageUrlsValue) {
    try {
      const parsedValue = JSON.parse(imageUrlsValue) as unknown;

      if (Array.isArray(parsedValue)) {
        return parsedValue.filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        );
      }
    } catch {
      return imageUrl ? [imageUrl] : [];
    }
  }

  return imageUrl ? [imageUrl] : [];
};

const getPostMediaType = (type?: string | null): FanExplorePostMediaType => {
  if (type === "VIDEO") return "VIDEO";
  if (type === "TEXT") return "TEXT";
  return "PHOTO";
};

const toNumericId = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
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

const ContentDetailHeader = ({ onBack }: { onBack: () => void }) => {
  return <Header title="" onBack={onBack} />;
};

const ContentDetailLoading = ({ onBack }: { onBack: () => void }) => {
  return (
    <main className="min-h-dvh bg-neutral-0">
      <ContentDetailHeader onBack={onBack} />
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
        <div className="flex items-center gap-1">
          <strong className="font-body text-caption3 text-neutral-900">
            {comment.authorName}
          </strong>
          {isBandMember ? (
            <img
              src={OfficialIcon}
              alt="밴드 멤버"
              className="size-3.5 shrink-0"
            />
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
              className="min-h-[48px] w-full resize-none rounded-[8px] border border-neutral-300 bg-neutral-0 px-[10px] py-[8px] font-body text-caption2 text-neutral-900 outline-none focus:border-primary-400"
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
                className="font-body text-caption3 text-primary-400 disabled:text-neutral-500"
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

const getCommentKey = (
  prefix: string,
  comment: NormalizedFanExplorePostComment,
  index: number,
) => `${prefix}-${comment.commentId ?? `missing-${index}`}`;

const FanContentDetailPage = () => {
  const navigate = useNavigate();
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const postId = Number(contentId);
  const validPostId = Number.isFinite(postId) ? postId : undefined;
  const postDetailQuery = useFanExplorePostDetailQuery(validPostId);
  const commentsQuery = useFanExplorePostCommentsQuery(validPostId, {
    size: COMMENT_PAGE_SIZE,
  });
  const likePostMutation = useLikeFanExplorePost();
  const unlikePostMutation = useUnlikeFanExplorePost();
  const createCommentMutation = useCreateFanExplorePostComment();
  const updateCommentMutation = useUpdateFanExplorePostComment();
  const deleteCommentMutation = useDeleteFanExplorePostComment();
  const postDetail = postDetailQuery.data;
  const bandId =
    toNumericId(postDetail?.band?.bandId) ??
    toNumericId(postDetail?.band?.id) ??
    toNumericId(postDetail?.bandId);
  const bandMembersQuery = useBandMembersQuery(bandId ?? NaN);
  const currentUser = getStoredAuthUser();
  const myBandMemberNickname = bandMembersQuery.data?.find(
    (member) => member.userId === currentUser?.userId,
  )?.profileNickname;
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
        <ContentDetailHeader onBack={() => navigate(-1)} />
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
            className="mt-[20px] flex h-[38px] items-center justify-center rounded-[8px] bg-primary-400 px-[20px] font-body text-body1 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      </main>
    );
  }

  const bandName =
    postDetail?.band?.bandName ??
    postDetail?.band?.name ??
    postDetail?.bandName ??
    searchParams.get("q") ??
    "WAVY";
  const createdAt =
    postDetail?.createdAt ??
    searchParams.get("createdAt") ??
    DEFAULT_CONTENT_CREATED_AT;
  const imageUrl = searchParams.get("imageUrl");
  const imageUrlsValue = searchParams.get("imageUrls");
  const profileImageUrl =
    postDetail?.band?.profileImageUrl ??
    postDetail?.band?.bandProfileImageUrl ??
    postDetail?.profileImageUrl ??
    postDetail?.bandProfileImageUrl ??
    searchParams.get("profileImageUrl");
  const mediaType = getPostMediaType(
    postDetail?.type ?? postDetail?.mediaType ?? postDetail?.contentType,
  );
  const detailMediaUrls = Array.isArray(postDetail?.mediaUrls)
    ? postDetail.mediaUrls
    : [];
  const timeAgo = formatRelativeTime(createdAt);
  const imageUrls =
    detailMediaUrls.length > 0
      ? detailMediaUrls
      : getImageUrls(imageUrlsValue, imageUrl);
  const hasContentImages = imageUrls.length > 0;
  const shouldRenderMedia = postDetail
    ? mediaType !== "TEXT" && hasContentImages
    : true;
  const imageCount = hasContentImages
    ? imageUrls.length
    : postDetail
      ? 0
      : MOCK_CONTENT_IMAGES.length;
  const isLiked = likeOverride?.isLiked ?? postDetail?.isLiked ?? false;
  const baseLikeCount = postDetail?.likeCount ?? BASE_LIKE_COUNT;
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
    postDetail?.commentCount ?? myComments.length + comments.length;
  const isCommentMutationPending =
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending;
  const title = postDetail?.title ?? "2025 봄 정기공연 합주 기록";
  const content = postDetail
    ? (postDetail.contentText ??
      (typeof postDetail.content === "string" ? postDetail.content : null) ??
      postDetail.body ??
      postDetail.text ??
      "")
    : "다음 공연을 앞두고 멤버들과 합주를 진행했어요.\n새롭게 편곡한 곡과 라이브 셋리스트를 맞춰보며\n무대에서 더 좋은 사운드를 들려드릴 준비를 하고 있습니다.";
  const hasContent = content.trim().length > 0;
  const tags = Array.isArray(postDetail?.tags) ? postDetail.tags : TAGS;

  const handleImageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const nextIndex = Math.round(container.scrollLeft / container.clientWidth);

    setActiveImageIndex(Math.min(imageCount - 1, Math.max(0, nextIndex)));
  };

  const handleLikeClick = () => {
    if (!Number.isFinite(postId) || isLikePending) {
      return;
    }

    const previousLikeOverride = likeOverride;

    if (isLiked) {
      const optimisticLikeCount = Math.max(0, likeCount - 1);

      setLikeOverride({
        isLiked: false,
        likeCount: optimisticLikeCount,
      });

      unlikePostMutation.mutate(postId, {
        onSuccess: () => setLikeOverride(null),
        onError: () => setLikeOverride(previousLikeOverride),
      });
      return;
    }

    const optimisticLikeCount = likeCount + 1;

    setLikeOverride({
      isLiked: true,
      likeCount: optimisticLikeCount,
    });

    likePostMutation.mutate(postId, {
      onSuccess: () => setLikeOverride(null),
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          setLikeOverride({
            isLiked: true,
            likeCount,
          });
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
    <main className="min-h-dvh bg-primary-0">
      <ContentDetailHeader onBack={() => navigate(-1)} />

      <article className="bg-neutral-0 px-[25px] p-[24px]">
        <header className="flex items-center gap-[16px]">
          <div className="flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-neutral-600">
            <img
              src={profileImageUrl ?? BandImage}
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
            {hasContentImages ? (
              mediaType === "VIDEO" ? (
                <video
                  src={imageUrls[0]}
                  poster={postDetail?.thumbnailUrl ?? undefined}
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
                    className="h-full w-full shrink-0 snap-center cursor-zoom-in object-cover [dynamic-range-limit:standard]"
                  />
                ))
              )
            ) : (
              MOCK_CONTENT_IMAGES.map((image) => (
                <div
                  key={image.id}
                  className={`flex h-full w-full shrink-0 snap-center items-center justify-center text-neutral-700 ${image.className}`}
                >
                  <ImagePlaceholderIcon />
                </div>
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
                    ? "size-[4px] rounded-full bg-primary-400"
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
                  className="flex h-[26px] min-w-[51px] items-center justify-center rounded-full bg-primary-50 px-[15px] font-body text-caption3 text-primary-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </article>

      <section className="inline-flex w-full flex-col items-start gap-[16px] bg-primary-0 pb-[24px] pl-[25px] pr-[26px] pt-[16px]">
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
            className="min-h-[48px] w-full resize-none rounded-[8px] border border-neutral-300 bg-neutral-0 px-[12px] py-[8px] font-body text-caption2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-400"
          />
          <div className="flex items-center justify-between">
            <span className="font-body text-caption4 text-neutral-500">
              {commentDraft.length}/500
            </span>
            <button
              type="submit"
              disabled={!commentDraft.trim() || createCommentMutation.isPending}
              className="flex h-[32px] min-w-[68px] items-center justify-center rounded-[8px] bg-primary-400 px-[14px] font-body text-caption3 text-neutral-0 disabled:bg-neutral-400"
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
              className="font-body text-caption3 text-primary-400"
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

      <div aria-hidden="true" className="h-[86px] bg-primary-0" />

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[86px] w-full max-w-[393px] items-center justify-between bg-neutral-0 px-[25px] py-[12px] shadow-[0_-5px_20px_0_rgba(0,0,0,0.03)]">
        <button
          type="button"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          aria-pressed={isLiked}
          onClick={handleLikeClick}
          disabled={isLikePending}
          className="flex size-[44px] shrink-0 items-center justify-center rounded-full"
        >
          <img
            src={isLiked ? LikedHeartIcon : HeartIcon}
            alt=""
            className="size-[36px] shrink-0"
          />
        </button>

        <button
          type="button"
          disabled={bandId == null}
          onClick={() => {
            if (bandId != null) {
              navigate(`/fan/bands/${bandId}`, {
                state: {
                  bandPreview: {
                    bandId,
                    name: bandName,
                    bandName,
                    genre: postDetail?.band?.genre ?? postDetail?.genre,
                    region: postDetail?.band?.region ?? postDetail?.region,
                    profileImageUrl,
                  },
                },
              });
            }
          }}
          className="flex h-[38px] w-[270px] items-center justify-center rounded-[8px] bg-primary-400 px-[20px] font-body text-body1 text-neutral-0 disabled:opacity-60"
        >
          밴드 프로필 보기
        </button>
      </div>

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

export default FanContentDetailPage;
