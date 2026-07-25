import { useState, type UIEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CommentIcon from "@/assets/icons/Comment.svg";
import HeartIcon from "@/assets/icons/Heart.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import BandImage from "@/assets/Img_Band.png";

const TAGS = ["합주", "인디밴드", "홍대", "공연준비"];
const BASE_LIKE_COUNT = 412;
const DEFAULT_CONTENT_CREATED_AT = new Date(
  Date.now() - 3 * 60 * 60 * 1000,
).toISOString();
const MOCK_CONTENT_IMAGES = [
  { id: "image-1", className: "bg-neutral-300" },
  { id: "image-2", className: "bg-primary-50" },
  { id: "image-3", className: "bg-neutral-200" },
];

const COMMENTS = [
  {
    id: "comment-1",
    author: "정하람",
    time: "1시간 전",
    content: "이번 편곡 진짜 기대돼요! 공연도 꼭 보러 갈게요.",
  },
  {
    id: "comment-2",
    author: "정유하",
    time: "42분 전",
    content: "합주 분위기가 너무 좋아 보여요. 새 곡도 기다릴게요.",
  },
  {
    id: "comment-3",
    author: "나영우",
    time: "42분 전",
    content: "앨범 발매 언제하나요?",
  },
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

const getImageUrls = (imageUrlsValue: string | null, imageUrl: string | null) => {
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

const FanContentDetailPage = () => {
  const navigate = useNavigate();
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const bandName = searchParams.get("q") || "WAVY";
  const createdAt =
    searchParams.get("createdAt") ?? DEFAULT_CONTENT_CREATED_AT;
  const imageUrl = searchParams.get("imageUrl");
  const imageUrlsValue = searchParams.get("imageUrls");
  const profileImageUrl = searchParams.get("profileImageUrl");
  const timeAgo = formatRelativeTime(createdAt);
  const imageUrls = getImageUrls(imageUrlsValue, imageUrl);
  const hasContentImages = imageUrls.length > 0;
  const imageCount = hasContentImages
    ? imageUrls.length
    : MOCK_CONTENT_IMAGES.length;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const likeCount = isLiked ? BASE_LIKE_COUNT + 1 : BASE_LIKE_COUNT;

  const handleImageScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const nextIndex = Math.round(container.scrollLeft / container.clientWidth);

    setActiveImageIndex(Math.min(imageCount - 1, Math.max(0, nextIndex)));
  };

  const handleLikeClick = () => {
    setIsLiked((currentValue) => !currentValue);
  };

  return (
    <main className="min-h-dvh bg-neutral-0">
      <header className="flex h-[48px] items-center px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
      </header>

      <article className="px-[25px] pt-[24px]">
        <header className="flex items-center gap-[16px]">
          <div className="flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-neutral-600">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={`${bandName} 프로필`}
                className="h-full w-full object-cover"
              />
            ) : null}
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

        <div
          className="mt-[24px] flex h-[422px] w-[338px] max-w-full snap-x snap-mandatory overflow-x-auto bg-neutral-300 text-neutral-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={handleImageScroll}
        >
          {hasContentImages ? (
            imageUrls.map((url, index) => (
              <img
                key={`${url}-${index}`}
                src={url}
                alt={`콘텐츠 이미지 ${index + 1}`}
                className="h-full w-full shrink-0 snap-center object-cover"
              />
            ))
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

        {imageCount > 1 ? (
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
            className="flex items-center gap-[4px] font-body text-caption3 text-neutral-900"
          >
            <img
              src={isLiked ? LikedHeartIcon : HeartIcon}
              alt=""
              className={isLiked ? "h-[17px] w-[20px]" : "size-[20px]"}
            />
            {likeCount}
          </button>
          <span className="flex items-center gap-[4px] font-body text-caption3 text-neutral-900">
            <img src={CommentIcon} alt="" className="size-[20px]" />
            12
          </span>
        </div>

        <section className="mt-[16px]">
          <h2 className="m-0 font-body text-body1 text-neutral-900">
            2025 봄 정기공연 합주 기록
          </h2>
          <p className="m-0 mt-[8px] font-caption2 text-caption2 text-neutral-900">
            다음 공연을 앞두고 멤버들과 합주를 진행했어요.
            <br />
            새롭게 편곡한 곡과 라이브 셋리스트를 맞춰보며
            <br />
            무대에서 더 좋은 사운드를 들려드릴 준비를 하고 있습니다.
          </p>

          <div className="mt-[16px] flex flex-wrap gap-[8px]">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="flex h-[26px] min-w-[51px] items-center justify-center rounded-full bg-primary-50 px-[15px] font-body text-caption3 text-primary-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </article>

      <section className="mt-[24px] inline-flex w-full flex-col items-start gap-[16px] bg-primary-0 pb-[24px] pl-[25px] pr-[26px] pt-[16px]">
        <h2 className="m-0 font-body text-caption3 text-neutral-900">댓글 12</h2>

        {COMMENTS.map((comment) => (
          <article key={comment.id} className="flex w-full gap-[16px]">
            <img
              src={BandImage}
              alt=""
              className="size-[35px] shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-[6px]">
                <strong className="font-body text-caption3 text-neutral-900">
                  {comment.author}
                </strong>
                <span className="font-body text-caption4 text-neutral-500">
                  {comment.time}
                </span>
              </div>
              <p className="m-0 font-body text-caption2 text-neutral-700">
                {comment.content}
              </p>
            </div>
          </article>
        ))}
      </section>

      <div aria-hidden="true" className="h-[86px] bg-primary-0" />

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[86px] w-full max-w-[393px] items-center justify-between bg-neutral-0 px-[25px] py-[12px] shadow-[0_-5px_20px_0_rgba(0,0,0,0.03)]">
        <button
          type="button"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          aria-pressed={isLiked}
          onClick={handleLikeClick}
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
          onClick={() => navigate(`/fan/bands/${contentId ?? "band-wavy"}`)}
          className="flex h-[38px] w-[270px] items-center justify-center rounded-[8px] bg-primary-400 px-[20px] font-body text-body1 text-neutral-0"
        >
          밴드 프로필 보기
        </button>
      </div>
    </main>
  );
};

export default FanContentDetailPage;
