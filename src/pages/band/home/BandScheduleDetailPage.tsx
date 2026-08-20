import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/common/Header/Header";
import HeartIcon from "@/assets/icons/Heart.svg";
import LikedHeartIcon from "@/assets/icons/Union.svg";
import {
  performanceKeys,
  usePerformanceQuery,
} from "@/hooks/api/band/usePerformance";
import {
  useAddPerformanceInterest,
  useDeletePerformanceInterest,
} from "@/hooks/api/fan/useFanHome";
import { isAlreadyInterestedPerformanceError } from "@/api/fan/home";
import {
  BAND_REGION_LABELS,
  PERFORMANCE_AGE_RATING_LABELS,
  PERFORMANCE_GENRE_LABELS,
} from "@/utils/bandLabels";

const ImagePlaceholderIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M6 16L10 12L13 15L15 13L19 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.5" cy="8.5" r="1.5" fill="currentColor" />
  </svg>
);

const Tag = ({ children }: { children: string }) => (
  <span className="rounded-full bg-secondary-100 px-3 py-1 font-body text-caption2 text-secondary-600">
    {children}
  </span>
);

const InfoRows = ({
  rows,
}: {
  rows: ReadonlyArray<{ label: string; value: string }>;
}) => (
  <dl className="m-0 flex flex-col gap-[10px]">
    {rows.map((item) => (
      <div key={item.label} className="grid grid-cols-[88px_1fr] gap-2">
        <dt className="font-body text-caption2 text-neutral-700">
          {item.label}
        </dt>
        <dd className="m-0 text-right font-body text-body2 text-neutral-800">
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
);

const toPerformanceDate = (performanceDate: string, startTime: string) => {
  const date = new Date(`${performanceDate}T${startTime}`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatPerformanceDateTime = (
  performanceDate: string,
  startTime: string,
) => {
  const date = toPerformanceDate(performanceDate, startTime);

  if (!date) return "일정 미정";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day}. (${weekday}) ${hour}:${minute}`;
};

const getDdayLabel = (performanceDate: string, startTime: string) => {
  const date = toPerformanceDate(performanceDate, startTime);
  if (!date) return "D--";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const performanceStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.ceil(
    (performanceStart.getTime() - todayStart.getTime()) / 86_400_000,
  );

  if (diffDays < 0) return "종료";
  if (diffDays === 0) return "D-DAY";
  return `D-${diffDays}`;
};

const BandScheduleDetailPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { performanceId: performanceIdParam } = useParams();
  const performanceId = Number(performanceIdParam);
  const detailQuery = usePerformanceQuery(performanceId);
  const detail = detailQuery.data;
  const addPerformanceInterestMutation = useAddPerformanceInterest();
  const deletePerformanceInterestMutation = useDeletePerformanceInterest();
  const [likeOverride, setLikeOverride] = useState<{
    isLiked: boolean;
    interestCount: number;
  } | null>(null);

  if (detailQuery.isLoading) {
    return (
      <main className="min-h-dvh bg-neutral-0">
        <Header title="" onBack={() => navigate(-1)} />
        <div className="animate-pulse">
          <div className="h-[492px] w-full bg-neutral-300" />
          <div className="px-6 pt-6">
            <div className="h-[24px] w-[220px] rounded bg-neutral-300" />
            <div className="mt-3 h-[80px] w-full rounded-[12px] bg-neutral-300" />
          </div>
        </div>
      </main>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <main className="min-h-dvh bg-neutral-0">
        <Header title="" onBack={() => navigate(-1)} />
        <section className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
          <h1 className="m-0 font-body text-label1 text-neutral-900">
            일정을 불러오지 못했어요
          </h1>
          <p className="m-0 mt-2 font-body text-caption2 text-neutral-600">
            잠시 후 다시 시도해주세요
          </p>
          <button
            type="button"
            onClick={() => void detailQuery.refetch()}
            className="mt-5 flex h-[38px] items-center justify-center rounded-[8px] bg-secondary-400 px-5 font-body text-body1 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      </main>
    );
  }

  const meta = [
    PERFORMANCE_GENRE_LABELS[detail.genre] ?? detail.genre,
    BAND_REGION_LABELS[detail.region] ?? detail.region,
  ]
    .filter(Boolean)
    .join(" · ");
  const dateTime = formatPerformanceDateTime(
    detail.performanceDate,
    detail.startTime,
  );
  const ddayLabel = getDdayLabel(detail.performanceDate, detail.startTime);
  const ticketPrice = detail.ticketPrice || "가격 미정";
  const ageRating =
    PERFORMANCE_AGE_RATING_LABELS[detail.ageRating] ?? detail.ageRating;
  const infoRows = [
    { label: "공연 일시", value: dateTime },
    { label: "공연 장소", value: detail.venue },
    { label: "티켓 가격", value: ticketPrice },
    { label: "관람 연령", value: ageRating },
  ];
  const isLiked = likeOverride?.isLiked ?? detail.isInterested ?? false;
  const interestCount =
    likeOverride?.interestCount ?? detail.interestCount ?? 0;
  const isLikePending =
    addPerformanceInterestMutation.isPending ||
    deletePerformanceInterestMutation.isPending;

  const handleLikeClick = async () => {
    if (isLikePending) return;

    const previousOverride = likeOverride;

    if (isLiked) {
      setLikeOverride({
        isLiked: false,
        interestCount: Math.max(0, interestCount - 1),
      });

      try {
        await deletePerformanceInterestMutation.mutateAsync(performanceId);
        queryClient.invalidateQueries({
          queryKey: performanceKeys.detail(performanceId),
        });
      } catch {
        setLikeOverride(previousOverride);
      }
      return;
    }

    setLikeOverride({ isLiked: true, interestCount: interestCount + 1 });

    try {
      await addPerformanceInterestMutation.mutateAsync(performanceId);
      queryClient.invalidateQueries({
        queryKey: performanceKeys.detail(performanceId),
      });
    } catch (error) {
      if (isAlreadyInterestedPerformanceError(error)) {
        queryClient.invalidateQueries({
          queryKey: performanceKeys.detail(performanceId),
        });
        return;
      }
      setLikeOverride(previousOverride);
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-0">
      <Header title="" onBack={() => navigate(-1)} />

      <section className="relative flex h-[492px] w-full items-center justify-center bg-neutral-400 text-neutral-700">
        {detail.posterImageUrl ? (
          <img
            src={detail.posterImageUrl}
            alt={detail.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholderIcon />
        )}
      </section>

      <section className="px-6 pb-6 pt-[24px]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex h-5 items-center rounded-[5px] bg-secondary-100 px-[15px] font-body text-caption3 text-secondary-600">
              {ddayLabel}
            </span>
            <h1 className="m-0 mt-1 font-body text-[24px] font-bold leading-[38px] tracking-[0.72px] text-neutral-900">
              {detail.title}
            </h1>
            <p className="m-0 font-body text-caption2 text-neutral-600">
              {meta}
            </p>
          </div>

          <button
            type="button"
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            aria-pressed={isLiked}
            disabled={isLikePending}
            onClick={() => void handleLikeClick()}
            className="mt-[38px] flex shrink-0 items-center gap-1 font-body text-caption3 text-neutral-700"
          >
            <img
              src={isLiked ? LikedHeartIcon : HeartIcon}
              alt=""
              className="size-6"
            />
            <span className="inline-block min-w-[3ch] tabular-nums">
              {interestCount}
            </span>
          </button>
        </div>

        <section className="mt-4 rounded-[12px] bg-neutral-0 px-4 pb-3 pt-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <InfoRows rows={infoRows} />
        </section>
      </section>

      <div className="h-4 bg-secondary-0" />

      <section className="px-6 pb-25 pt-4">
        <h2 className="m-0 font-body text-body1 text-neutral-900">공연 소개</h2>
        <p className="m-0 mt-[20px] whitespace-pre-line font-body text-caption2 text-neutral-900">
          {detail.description || "공연 소개가 준비 중이에요."}
        </p>

        {detail.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-1">
            {detail.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default BandScheduleDetailPage;
