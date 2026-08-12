import { useEffect, useMemo, useState, type UIEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowIcon from "@/assets/Arrow.svg";
import SpeakerIcon from "@/assets/speaker.svg";
import SwapIcon from "@/assets/icons/swap.svg";
import BandProfileImage from "@/assets/icons/band/band-default-profile.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import Modal from "@/components/Modal/Modal";
import NewsCard from "@/components/common/Card/NewsCard";
import { HomeHeader } from "@/components/common/Header/HomeHeader";
import { NotificationBellIcon } from "@/components/common/Header/NotificationBellIcon";
import { ModeSwitchSheet } from "@/components/band/home/ModeSwitchSheet";
import {
  useCompletePerformanceParticipation,
  useDeletePerformanceParticipation,
  useFanHomeQuery,
  usePendingPerformanceParticipationQuery,
  useUpcomingPerformancesInfiniteQuery,
} from "@/hooks/api/fan/useFanHome";
import {
  useFollowExploreBand,
  useUnfollowExploreBand,
} from "@/hooks/api/fan/useFanExplore";
import { useNotificationsInfiniteQuery } from "@/hooks/api/useNotifications";
import type {
  FanHomeConcert,
  FanHomeNewsItem,
  FanHomeRecommendedBand,
  FanHomeResponse,
  PendingPerformanceParticipationItem,
} from "@/types/fan/home";
import {
  isNotificationForMode,
  isNotificationWithinRetention,
} from "@/utils/notificationDeepLink";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M19 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V12H20V19ZM20 10H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V10Z"
      fill="currentColor"
    />
  </svg>
);

type HomeVariant = "new" | "recommended" | "main";

const VARIANTS = new Set<HomeVariant>(["new", "recommended", "main"]);
const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

type HomeNewsCardItem = {
  id: string;
  detailId: number | null;
  profileImageSrc: string;
  contentImageSrc?: string;
  bandName: string;
  meta: string;
  title: string;
  tags: string[];
  createdAt?: string | null;
};

type HomeBandItem = {
  id: string;
  bandId: number | null;
  name: string;
  meta: string;
  genre?: string | null;
  region?: string | null;
  description?: string | null;
  followerCount?: number;
  profileImageSrc: string;
  isFollowing: boolean;
};

type HomeConcertItem = {
  id: string;
  date: Date | null;
  month: string;
  day: string;
  title: string;
  location: string;
  dateTime: string;
  status: string;
  thumbnailSrc?: string;
  showThumbnail: boolean;
};

const getVariant = (value: string | null): HomeVariant => {
  if (value && VARIANTS.has(value as HomeVariant)) {
    return value as HomeVariant;
  }

  return "main";
};

const firstList = <T,>(...lists: Array<T[] | undefined>) => {
  return lists.find((list) => Array.isArray(list) && list.length > 0) ?? [];
};

const compactMeta = (parts: Array<string | null | undefined>) => {
  return parts.filter(Boolean).join(" · ");
};

const firstImageUrl = (...values: Array<string | null | undefined>) => {
  return values.find((value): value is string => Boolean(value));
};

const firstMediaUrl = (
  ...values: Array<string[] | string | null | undefined>
) => {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value[0];
    if (typeof value === "string" && value) return value;
  }

  return undefined;
};

const getBandProfileImageUrl = (
  item: FanHomeNewsItem | FanHomeRecommendedBand,
) => {
  return firstImageUrl(
    item.bandProfileImageUrl,
    item.bandImageUrl,
    item.bandProfileUrl,
    item.bandLogoUrl,
    item.profileImageUrl,
    item.avatarUrl,
    item.logoUrl,
    item.imageUrl,
    item.thumbnailUrl,
  );
};

const toNumericId = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
};

const getRecommendedBandInfo = (item: FanHomeRecommendedBand) =>
  item.band ?? item;

const getRecommendedBandId = (item: FanHomeRecommendedBand) => {
  const bandInfo = getRecommendedBandInfo(item);

  return (
    toNumericId(bandInfo.bandId) ??
    toNumericId(item.bandId) ??
    toNumericId(bandInfo.targetBandId) ??
    toNumericId(item.targetBandId) ??
    toNumericId(bandInfo.followingBandId) ??
    toNumericId(item.followingBandId) ??
    toNumericId(bandInfo.followedBandId) ??
    toNumericId(item.followedBandId) ??
    toNumericId(bandInfo.recommendedBandId) ??
    toNumericId(item.recommendedBandId) ??
    toNumericId(bandInfo.id) ??
    toNumericId(item.id)
  );
};

const getNewsContentImageUrl = (item: FanHomeNewsItem) => {
  return (
    firstImageUrl(
      item.imageUrl,
      item.contentImageUrl,
      item.mainImageUrl,
      item.thumbnailUrl,
      item.thumbnailImageUrl,
    ) ?? firstMediaUrl(item.mediaUrl, item.mediaUrls, item.imageUrls, item.images)
  );
};

const getConcertThumbnailUrl = (item: FanHomeConcert) => {
  return (
    firstImageUrl(
      item.posterImageUrl,
      item.posterUrl,
      item.posterImage,
      item.performancePosterUrl,
      item.performanceImageUrl,
      item.imageUrl,
      item.mainImageUrl,
      item.thumbnailUrl,
      item.thumbnailImageUrl,
    ) ?? firstMediaUrl(item.imageUrls)
  );
};

const toDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getConcertDate = (concert: FanHomeConcert) => {
  const dateValue =
    concert.startAt ??
    concert.startedAt ??
    concert.startDateTime ??
    concert.performanceDate ??
    concert.startDate;
  const timeValue = concert.performanceTime ?? concert.startTime ?? concert.time;

  if (dateValue && timeValue && !dateValue.includes("T")) {
    return toDate(`${dateValue}T${timeValue}`);
  }

  return toDate(dateValue);
};

const formatDateTime = (date: Date | null) => {
  if (!date) return "일정 미정";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day}. ${hour}:${minute}`;
};

const formatDday = (concert: FanHomeConcert, date: Date | null) => {
  if (typeof concert.dDay === "number") {
    if (concert.dDay < 0) return "종료";
    if (concert.dDay === 0) return "D-DAY";
    return `D-${concert.dDay}`;
  }

  if (!date) return concert.status ?? "준비중";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.ceil(
    (dateStart.getTime() - todayStart.getTime()) / 86_400_000,
  );

  if (diffDays < 0) return "종료";
  if (diffDays === 0) return "D-DAY";
  return `D-${diffDays}`;
};

const formatPostedAgo = (item: FanHomeNewsItem) => {
  if (typeof item.postedAgo === "number") {
    return `${item.postedAgo}시간 전`;
  }

  const createdAt = toDate(item.createdAt);
  if (!createdAt) return undefined;

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / 60_000),
  );

  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return `${Math.floor(diffHours / 24)}일 전`;
};

const mapNewsItem = (
  item: FanHomeNewsItem,
  index: number,
): HomeNewsCardItem => {
  const postedAgo = formatPostedAgo(item);
  const detailId =
    toNumericId(item.postId) ??
    toNumericId(item.contentId) ??
    toNumericId(item.id) ??
    toNumericId(item.newsId);

  return {
    id: String(
      item.newsId ??
        item.postId ??
        item.contentId ??
        item.id ??
        `news-${index}`,
    ),
    detailId,
    profileImageSrc: getBandProfileImageUrl(item) ?? BandProfileImage,
    contentImageSrc: getNewsContentImageUrl(item),
    bandName: item.bandName ?? "밴드명",
    meta:
      compactMeta([item.genre, item.region, postedAgo]) ||
      "장르 · 지역",
    title: item.content ?? item.title ?? "새로운 소식이 도착했어요",
    tags: item.tags ?? [],
    createdAt: item.createdAt,
  };
};

const mapBandItem = (
  item: FanHomeRecommendedBand,
  index: number,
): HomeBandItem => {
  const bandInfo = getRecommendedBandInfo(item);
  const bandId = getRecommendedBandId(item);
  const genre = bandInfo.genre ?? item.genre;
  const region = bandInfo.region ?? item.region;
  const name = bandInfo.bandName ?? bandInfo.name ?? item.bandName ?? item.name ?? "밴드명";
  const description =
    bandInfo.description ??
    bandInfo.bandDescription ??
    bandInfo.introduction ??
    bandInfo.introduce ??
    item.description ??
    item.bandDescription ??
    item.introduction ??
    item.introduce;
  const followerCount =
    bandInfo.followerCount ??
    bandInfo.followersCount ??
    bandInfo.followerCnt ??
    bandInfo.followCount ??
    bandInfo.followers ??
    item.followerCount ??
    item.followersCount ??
    item.followerCnt ??
    item.followCount ??
    item.followers;

  return {
    id: String(bandId ?? bandInfo.id ?? item.id ?? `band-${index}`),
    bandId,
    name,
    meta: compactMeta([genre, region]) || "장르 · 지역",
    genre,
    region,
    description,
    followerCount,
    profileImageSrc:
      getBandProfileImageUrl(bandInfo) ?? getBandProfileImageUrl(item) ?? BandProfileImage,
    isFollowing:
      bandInfo.isFollowing ??
      bandInfo.following ??
      bandInfo.followed ??
      item.isFollowing ??
      item.following ??
      item.followed ??
      false,
  };
};

const mapConcertItem = (
  item: FanHomeConcert,
  index: number,
): HomeConcertItem => {
  const date = getConcertDate(item);
  const thumbnailSrc = getConcertThumbnailUrl(item);

  return {
    id: String(
      item.performanceId ?? item.concertId ?? item.id ?? `concert-${index}`,
    ),
    date,
    month: date ? MONTH_LABELS[date.getMonth()] : "TBD",
    day: date ? String(date.getDate()).padStart(2, "0") : "--",
    title:
      item.performanceTitle ??
      item.performanceName ??
      item.concertTitle ??
      item.concertName ??
      item.showTitle ??
      item.showName ??
      item.name ??
      item.title ??
      "공연명",
    location: item.location ?? item.venue ?? item.place ?? "공연 장소 미정",
    dateTime: formatDateTime(date),
    status: item.status ?? formatDday(item, date),
    thumbnailSrc,
    showThumbnail: Boolean(thumbnailSrc),
  };
};

const getPendingPerformanceTitle = (
  performance?: PendingPerformanceParticipationItem,
) => {
  if (!performance) return null;

  return (
    performance.performanceTitle ??
    performance.performanceName ??
    performance.concertName ??
    performance.showTitle ??
    performance.showName ??
    performance.name ??
    performance.title ??
    null
  );
};

const isUpcomingConcert = (concert: HomeConcertItem) => {
  if (["종료", "COMPLETED", "ENDED", "FINISHED"].includes(concert.status)) {
    return false;
  }

  if (!concert.date) return true;

  return concert.date.getTime() >= Date.now();
};

const mapHomeResponse = (data?: FanHomeResponse) => {
  const news = firstList(
    data?.followingBandNews,
    data?.followedBandNews,
    data?.followedNews,
    data?.news,
  ).map(mapNewsItem);
  const recommendedBands = firstList(
    data?.recommendedBands,
    data?.recommendBands,
  ).map(mapBandItem);
  const performances = firstList(
    data?.performances,
    data?.upcomingConcerts,
    data?.followedConcerts,
    data?.recommendedConcerts,
    data?.recommendConcerts,
    data?.popularConcerts,
  ).map(mapConcertItem).filter(isUpcomingConcert);

  return {
    hasFollowingBands: data?.hasFollowingBands === true,
    performanceType: data?.performanceType,
    news,
    recommendedBands,
    performances,
  };
};

const SectionHeader = ({
  title,
  description,
  showMore = true,
  onMoreClick,
}: {
  title: string;
  description?: string;
  showMore?: boolean;
  onMoreClick?: () => void;
}) => {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="m-0 font-body text-label1 text-neutral-900">{title}</h2>
        {description ? (
          <p className="m-0 mt-1 font-body text-caption2 text-neutral-600">
            {description}
          </p>
        ) : null}
      </div>

      {showMore && onMoreClick ? (
        <button
          type="button"
          onClick={onMoreClick}
          className="flex shrink-0 items-center gap-0.5 pt-0.5 font-body text-body1 text-neutral-400"
        >
          더보기
          <img src={ArrowIcon} alt="" className="size-6 opacity-35" />
        </button>
      ) : null}
    </div>
  );
};

const EmptyFollowCard = ({ onExploreClick }: { onExploreClick: () => void }) => {
  return (
    <section className="flex items-center justify-center rounded-[12px] bg-primary-0 px-[19px] pb-[24px] pt-[25px] shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
      <div className="flex w-full items-center justify-between gap-[18px]">
        <div>
          <h2 className="m-0 font-body text-label1 text-neutral-900">
            아직 팔로우한 밴드가 없어요
          </h2>
          <p className="mt-[5px] font-body text-caption2 text-neutral-700">
            탐색 탭에서 마음에 드는 밴드를
            <br />
            팔로우하면 소식을 볼 수 있어요
          </p>
          <button
            type="button"
            onClick={onExploreClick}
            className="mt-[12px] flex items-center justify-center rounded-[8px] bg-primary-400 px-[17px] py-[7px] font-body text-caption3 text-neutral-0"
          >
            밴드 탐색하기
          </button>
        </div>


        <div
          aria-hidden="true"
          className="flex h-[90px] w-[87px] shrink-0 items-center justify-center"
        >
          <img
            src={SpeakerIcon}
            alt=""
            className="h-[90px] w-[87px] aspect-[29/30]"
          />
        </div>
      </div>
    </section>
  );
};

const BandRecommendationStrip = ({ bands }: { bands: HomeBandItem[] }) => {
  const navigate = useNavigate();
  const followBandMutation = useFollowExploreBand();
  const unfollowBandMutation = useUnfollowExploreBand();
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
  const [pendingBandId, setPendingBandId] = useState<number | null>(null);
  const [unfollowTargetId, setUnfollowTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unfollowTarget = bands.find((band) => band.id === unfollowTargetId);
  const isFollowPending =
    followBandMutation.isPending || unfollowBandMutation.isPending;

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => setToastMessage(null), 2000);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  const confirmUnfollow = async () => {
    if (!unfollowTarget?.bandId || isFollowPending) return;

    const previousIsFollowing =
      followOverrides[unfollowTarget.id] ?? unfollowTarget.isFollowing;

    setUnfollowTargetId(null);
    setPendingBandId(unfollowTarget.bandId);
    setFollowOverrides((currentOverrides) => ({
      ...currentOverrides,
      [unfollowTarget.id]: false,
    }));

    try {
      await unfollowBandMutation.mutateAsync(unfollowTarget.bandId);
      setToastMessage(`${unfollowTarget.name} 팔로우를 취소했어요`);
    } catch {
      setFollowOverrides((currentOverrides) => ({
        ...currentOverrides,
        [unfollowTarget.id]: previousIsFollowing,
      }));
      setToastMessage("팔로우 취소에 실패했어요");
    } finally {
      setPendingBandId(null);
    }
  };

  if (bands.length === 0) return null;

  return (
    <>
      <div className="-mx-5 flex w-[calc(100%+40px)] snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {bands.map((band) => {
          const isFollowing = followOverrides[band.id] ?? band.isFollowing;
          const isBandPending = isFollowPending && pendingBandId === band.bandId;

          return (
            <article
              key={band.id}
              className="flex w-[calc((100%-36px)/4)] shrink-0 snap-start flex-col items-center text-center"
            >
              <button
                type="button"
                disabled={band.bandId == null}
                onClick={() => {
                  if (band.bandId != null) {
                    navigate(`/fan/bands/${band.bandId}`, {
                      state: {
                        bandPreview: {
                          bandId: band.bandId,
                          name: band.name,
                          bandName: band.name,
                          genre: band.genre,
                          region: band.region,
                          profileImageUrl: band.profileImageSrc,
                          description: band.description,
                          introduction: band.description,
                          followerCount: band.followerCount,
                          isFollowing,
                        },
                      },
                    });
                  }
                }}
                className="flex w-full flex-col items-center text-center disabled:cursor-default"
              >
                <img
                  src={band.profileImageSrc}
                  alt=""
                  className="size-[52px] rounded-full object-cover"
                />
                <strong className="mt-2 max-w-full truncate font-body text-body1 text-neutral-900">
                  {band.name}
                </strong>
                <span className="max-w-full truncate font-body text-caption2 text-neutral-600">
                  {band.meta}
                </span>
              </button>
              <button
                type="button"
                disabled={band.bandId == null || isBandPending}
                onClick={() => {
                  if (band.bandId == null || isBandPending) return;

                  if (isFollowing) {
                    setUnfollowTargetId(band.id);
                    return;
                  }

                  setPendingBandId(band.bandId);
                  setFollowOverrides((currentOverrides) => ({
                    ...currentOverrides,
                    [band.id]: true,
                  }));
                  setToastMessage(`${band.name}를 팔로우했어요`);

                  followBandMutation.mutate(band.bandId, {
                    onError: () => {
                      setFollowOverrides((currentOverrides) => ({
                        ...currentOverrides,
                        [band.id]: false,
                      }));
                      setToastMessage("밴드 팔로우에 실패했어요");
                    },
                    onSettled: () => setPendingBandId(null),
                  });
                }}
                className="mt-2 flex self-stretch items-center justify-center gap-2 rounded-full border-[1px] border-primary-400 px-[15px] py-1 font-body text-caption3 text-primary-400 disabled:opacity-60"
              >
                {isFollowing ? "팔로잉" : "팔로우"}
              </button>
            </article>
          );
        })}
      </div>

      <ModalOverlay
        open={unfollowTargetId !== null}
        onClose={() => setUnfollowTargetId(null)}
      >
        <Modal
          title="팔로우를 취소할까요?"
          description={
            <>
              이 밴드의 소식이
              <br />
              홈피드에서 사라져요
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setUnfollowTargetId(null)}
          onConfirm={() => void confirmUnfollow()}
        />
      </ModalOverlay>

      <Toast
        open={toastMessage !== null}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        tone={toastMessage?.includes("실패") ? "error" : "success"}
      />
    </>
  );
};

const NewsCarousel = ({ items }: { items: HomeNewsCardItem[] }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return <EmptySectionMessage>새로운 밴드 소식이 없어요</EmptySectionMessage>;
  }

  const displayedActiveIndex = Math.min(activeIndex, items.length - 1);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollContainer = event.currentTarget;
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;

    if (maxScrollLeft <= 0) {
      setActiveIndex(0);
      return;
    }

    const scrollProgress = scrollContainer.scrollLeft / maxScrollLeft;
    const nextIndex = Math.min(
      items.length - 1,
      Math.max(0, Math.round(scrollProgress * (items.length - 1))),
    );

    setActiveIndex(nextIndex);
  };

  return (
    <section>
      <div
        className="-mx-5 flex w-[calc(100%+40px)] snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {items.map((item) => (
          <div key={item.id} className="shrink-0 snap-start">
            <NewsCard
              profileImageSrc={item.profileImageSrc}
              contentImageSrc={item.contentImageSrc}
              bandName={item.bandName}
              meta={item.meta}
              title={item.title}
              tags={item.tags}
              onClick={
                item.detailId == null
                  ? undefined
                  : () =>
                      navigate(
                        `/fan/explore/contents/${item.detailId}${
                          item.createdAt
                            ? `?createdAt=${encodeURIComponent(item.createdAt)}`
                            : ""
                        }`,
                      )
              }
              ariaLabel={`${item.title} 상세보기`}
            />
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="flex justify-center gap-1">
          {items.map((item, index) => (
            <span
              key={item.id}
              className={
                index === displayedActiveIndex
                  ? "size-1 rounded-full bg-primary-300"
                  : "size-1 rounded-full bg-neutral-400"
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

const EmptySectionMessage = ({ children }: { children: string }) => {
  return (
    <div className="rounded-[12px] bg-neutral-50 px-4 py-6 text-center font-body text-body3 text-neutral-600">
      {children}
    </div>
  );
};

const LoadingBlock = () => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[86px] w-full max-w-[348px] animate-pulse rounded-xl bg-neutral-100"
        />
      ))}
    </div>
  );
};

const ErrorBlock = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="rounded-[12px] bg-neutral-50 px-4 py-6 text-center">
      <p className="m-0 font-body text-body3 text-neutral-700">
        홈 정보를 불러오지 못했어요
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-[8px] bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
      >
        다시 시도
      </button>
    </div>
  );
};

const ConcertList = ({
  concerts,
  count = 4,
}: {
  concerts: HomeConcertItem[];
  count?: number;
}) => {
  const navigate = useNavigate();

  if (concerts.length === 0) {
    return <EmptySectionMessage>표시할 공연이 없어요</EmptySectionMessage>;
  }

  return (
    <div className="flex flex-col gap-3">
      {concerts.slice(0, count).map((concert) => (
        <ConcertCard
          key={concert.id}
          month={concert.month}
          day={concert.day}
          title={concert.title}
          location={concert.location}
          dateTime={concert.dateTime}
          status={<span className="text-primary-500">{concert.status}</span>}
          dateBadgeClassName="bg-primary-300"
          isPending={concert.status === "준비중"}
          thumbnailSrc={concert.thumbnailSrc}
          showThumbnail={concert.showThumbnail}
          onClick={() => navigate(`/fan/home/concerts/${concert.id}`)}
          ariaLabel={`${concert.title} 상세보기`}
        />
      ))}
    </div>
  );
};

const FanHomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);
  const [answeredPendingPerformanceIds, setAnsweredPendingPerformanceIds] =
    useState<Set<number>>(() => new Set());
  const [isParticipationModalDismissed, setIsParticipationModalDismissed] =
    useState(false);
  const [participationErrorMessage, setParticipationErrorMessage] = useState<
    string | null
  >(null);
  const pendingParticipationQuery = usePendingPerformanceParticipationQuery();
  const completeParticipationMutation = useCompletePerformanceParticipation();
  const deleteParticipationMutation = useDeletePerformanceParticipation();
  const { data: fanHome, isError, isLoading, refetch } = useFanHomeQuery();
  const { data: notificationsData } = useNotificationsInfiniteQuery();
  const {
    data: upcomingPerformancesData,
    isError: isUpcomingPerformancesError,
    isLoading: isUpcomingPerformancesLoading,
    refetch: refetchUpcomingPerformances,
  } = useUpcomingPerformancesInfiniteQuery("IMMINENT", 4);
  const variant = getVariant(searchParams.get("variant"));
  const homeData = useMemo(() => mapHomeResponse(fanHome), [fanHome]);
  const upcomingApiConcerts = useMemo(() => {
    return (
      upcomingPerformancesData?.pages
        .flatMap((page) => page.items ?? [])
        .map(mapConcertItem)
        .filter(isUpcomingConcert) ?? []
    );
  }, [upcomingPerformancesData]);
  const hasNoFollowedBandPerformances =
    homeData.hasFollowingBands &&
    !isUpcomingPerformancesLoading &&
    !isUpcomingPerformancesError &&
    Boolean(upcomingPerformancesData) &&
    upcomingApiConcerts.length === 0;
  const shouldUseRecommendedPerformances =
    variant === "recommended" ||
    homeData.performanceType === "RECOMMENDED" ||
    !homeData.hasFollowingBands ||
    hasNoFollowedBandPerformances;
  const upcomingConcerts = shouldUseRecommendedPerformances
    ? homeData.performances
    : upcomingApiConcerts;
  const pendingPerformances = useMemo(() => {
    return (pendingParticipationQuery.data?.items ?? []).filter(
      (item) => !answeredPendingPerformanceIds.has(item.performanceId),
    );
  }, [answeredPendingPerformanceIds, pendingParticipationQuery.data]);
  const currentPendingPerformance = pendingPerformances[0];
  const currentPendingPerformanceTitle = getPendingPerformanceTitle(
    currentPendingPerformance,
  );
  const isParticipationResponding =
    completeParticipationMutation.isPending ||
    deleteParticipationMutation.isPending;
  const notificationItems = notificationsData?.pages.flatMap(
    (page) => page.items,
  );
  const hasUnreadNotification = notificationItems
    ? notificationItems.some(
        (notification) =>
          !notification.isRead &&
          isNotificationWithinRetention(notification) &&
          isNotificationForMode(notification, "FAN"),
      )
    : (fanHome?.hasUnreadNotification ??
      fanHome?.hasUnreadNotifications ??
      false);

  const removeCurrentPendingPerformance = () => {
    if (!currentPendingPerformance) return;

    setAnsweredPendingPerformanceIds((ids) => {
      const nextIds = new Set(ids);
      nextIds.add(currentPendingPerformance.performanceId);
      return nextIds;
    });
    setParticipationErrorMessage(null);
  };

  const handleParticipationComplete = async () => {
    if (!currentPendingPerformance || isParticipationResponding) return;

    try {
      await completeParticipationMutation.mutateAsync(
        currentPendingPerformance.performanceId,
      );
      removeCurrentPendingPerformance();
    } catch {
      setParticipationErrorMessage("참여 여부를 저장하지 못했어요");
    }
  };

  const handleParticipationDelete = async () => {
    if (!currentPendingPerformance || isParticipationResponding) return;

    try {
      await deleteParticipationMutation.mutateAsync(
        currentPendingPerformance.performanceId,
      );
      removeCurrentPendingPerformance();
    } catch {
      setParticipationErrorMessage("참여 여부를 저장하지 못했어요");
    }
  };

  const content = useMemo(() => {
    if (isLoading) {
      return <LoadingBlock />;
    }

    if (isError) {
      return <ErrorBlock onRetry={() => void refetch()} />;
    }

    const isNewHome = variant === "new" || !homeData.hasFollowingBands;
    const hasUpcomingConcerts = upcomingConcerts.length > 0;
    const recommendedBandSection =
      homeData.recommendedBands.length > 0 ? (
        <section className="mt-8">
          <SectionHeader
            title="이런 밴드는 어때요?"
            description="관심사 장르 · 지역 기반 추천"
            onMoreClick={() => navigate("/fan/explore")}
          />
          <BandRecommendationStrip bands={homeData.recommendedBands} />
        </section>
      ) : null;

    if (isNewHome) {
      return (
        <>
          <section>
            <SectionHeader title="팔로우한 밴드 소식" showMore={false} />
            <EmptyFollowCard onExploreClick={() => navigate("/fan/explore")} />
          </section>

          {recommendedBandSection}

          <section className="mt-8">
            <SectionHeader
              title="이런 공연은 어때요?"
              onMoreClick={() => navigate("/fan/home/concerts?type=recommended")}
              description={
                hasUpcomingConcerts
                  ? "지금 인기 있는 공연을 추천해드릴게요!"
                  : undefined
              }
            />
            <ConcertList concerts={upcomingConcerts} />
          </section>
        </>
      );
    }

    if (shouldUseRecommendedPerformances) {
      return (
        <>
          <section>
            <SectionHeader
              title="팔로우한 밴드 소식"
              onMoreClick={() => navigate("/fan/home/news")}
            />
            <NewsCarousel items={homeData.news} />
          </section>

          {recommendedBandSection}

          <section className="mt-8">
            <SectionHeader
              title={
                hasUpcomingConcerts
                  ? "이런 공연은 어때요?"
                  : "추천 공연이 없어요"
              }
              onMoreClick={() => navigate("/fan/home/concerts?type=recommended")}
              description={
                hasUpcomingConcerts
                  ? "지금 인기 있는 공연을 추천해드릴게요!"
                  : undefined
              }
            />
            <ConcertList concerts={upcomingConcerts} />
          </section>
        </>
      );
    }

    return (
      <>
        <section>
          <SectionHeader
            title="팔로우한 밴드 소식"
            onMoreClick={() => navigate("/fan/home/news")}
          />
          <NewsCarousel items={homeData.news} />
        </section>

        {recommendedBandSection}

        <section className="mt-8">
          <SectionHeader
            title="다가오는 공연"
            onMoreClick={() => navigate("/fan/home/concerts")}
          />
          {isUpcomingPerformancesLoading ? (
            <LoadingBlock />
          ) : isUpcomingPerformancesError ? (
            <ErrorBlock
              onRetry={() => void refetchUpcomingPerformances()}
            />
          ) : (
            <ConcertList concerts={upcomingConcerts} />
          )}
        </section>
      </>
    );
  }, [
    homeData,
    isError,
    isLoading,
    navigate,
    refetch,
    shouldUseRecommendedPerformances,
    upcomingConcerts,
    isUpcomingPerformancesError,
    isUpcomingPerformancesLoading,
    refetchUpcomingPerformances,
    variant,
  ]);

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <HomeHeader
        leftAction={
          <button
            type="button"
            aria-label="모드 전환"
            onClick={() => setIsModeSwitchOpen(true)}
          >
            <img src={SwapIcon} alt="" className="size-6" />
          </button>
        }
        rightAction={
          <>
            <button
              type="button"
              aria-label="공연 캘린더"
              onClick={() => navigate("/fan/home/concerts/calendar")}
              className="flex size-6 items-center justify-center text-neutral-900"
            >
              <CalendarIcon />
            </button>

            <button
              type="button"
              aria-label="알림"
              onClick={() =>
                navigate(
                  `/fan/home/notifications?status=${
                    hasUnreadNotification ? "has" : "empty"
                  }`,
                )
              }
              className="flex size-6 items-center justify-center text-neutral-900"
            >
              <NotificationBellIcon hasUnread={hasUnreadNotification} />
            </button>
          </>
        }
      />

      <div className="mt-8">{content}</div>

      <ModeSwitchSheet
        open={isModeSwitchOpen}
        onClose={() => setIsModeSwitchOpen(false)}
      />

      <ModalOverlay
        open={
          Boolean(currentPendingPerformance) && !isParticipationModalDismissed
        }
        onClose={() => setIsParticipationModalDismissed(true)}
      >
        <Modal
          title="공연은 재미있게 보셨나요?"
          description={
            <>
              {currentPendingPerformanceTitle
                ? `${currentPendingPerformanceTitle}에 참여했다면`
                : "참여했다면"}
              <br />
              &apos;참여했어요&apos;를 눌러주세요
              {participationErrorMessage ? (
                <>
                  <br />
                  {participationErrorMessage}
                </>
              ) : null}
            </>
          }
          cancelLabel={
            deleteParticipationMutation.isPending ? "처리 중" : "불참했어요"
          }
          confirmLabel={
            completeParticipationMutation.isPending ? "처리 중" : "참여했어요"
          }
          onCancel={() => void handleParticipationDelete()}
          onConfirm={() => void handleParticipationComplete()}
        />
      </ModalOverlay>
    </main>
  );
};

export default FanHomePage;
