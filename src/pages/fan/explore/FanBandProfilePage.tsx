import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import OfficialIcon from "@/assets/icons/band/official-icon.svg";
import PlusIcon from "@/assets/icons/Plus.svg";
import SoundCloudIcon from "@/assets/icons/soundcloude.svg";
import SpotifyIcon from "@/assets/icons/Spotify.svg";
import YouTubeIcon from "@/assets/icons/youtube.svg";
import BandImage from "@/assets/icons/band/band-default-profile.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { Header } from "@/components/common/Header/Header";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import { FollowedNewsCard } from "@/components/fan/home/FollowedNewsCard";
import Modal from "@/components/Modal/Modal";
import {
  useFanExploreBandDetailQuery,
  useFollowExploreBand,
  useUnfollowExploreBand,
} from "@/hooks/api/fan/useFanExplore";
import { useFollowedBandsQuery } from "@/hooks/api/user/useFollowedBands";
import { useMusicLinksQuery } from "@/hooks/api/band/useMusicLink";
import { usePerformancesQuery } from "@/hooks/api/band/usePerformance";
import { usePostsQuery } from "@/hooks/api/band/usePost";
import { useEnterLiveMutation } from "@/hooks/api/live/useLive";
import type { FanExploreBandDetail } from "@/types/fan/explore";
import type { FollowedBandItem } from "@/types/user/followedBands";
import type { MusicLinksResponse } from "@/types/band/musicLink";
import type { PerformanceListItem } from "@/types/band/performance";
import type { PostListItem, PostType } from "@/types/band/post";
import { getGenreLabel, getRegionLabel } from "@/utils/bandLabels";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

const TABS = ["콘텐츠", "일정", "음원"] as const;
type ProfileTab = (typeof TABS)[number];

const LIVE_AUDIO_SESSION_NOT_FOUND_CODE = "LIVE404_1";

const getApiErrorCode = (error: unknown) => {
  if (!error || typeof error !== "object") return null;

  const response = (error as { response?: unknown }).response;

  if (!response || typeof response !== "object") return null;

  const data = (response as { data?: unknown }).data;

  if (!data || typeof data !== "object") return null;

  const code = (data as { code?: unknown }).code;

  return typeof code === "string" ? code : null;
};

const toNumericId = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
};

const getFollowedBandId = (band: FollowedBandItem) => {
  return (
    toNumericId(band.bandId) ??
    toNumericId(band.band?.bandId) ??
    toNumericId(band.band?.id) ??
    toNumericId(band.targetBandId) ??
    toNumericId(band.followingBandId) ??
    toNumericId(band.followedBandId) ??
    toNumericId(band.id)
  );
};

const getBandFollowerCount = (band?: FanExploreBandDetail | null) => {
  return (
    band?.followerCount ??
    band?.followersCount ??
    band?.followerCnt ??
    band?.followCount ??
    band?.followers
  );
};

const getFollowedBandFollowerCount = (band?: FollowedBandItem | null) => {
  const bandInfo = band?.band;

  return (
    band?.followerCount ??
    band?.followers ??
    bandInfo?.followerCount ??
    bandInfo?.followers
  );
};

const LocationIconNeutral500 = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M7.00004 1.16602C5.76236 1.16602 4.57538 1.65768 3.70021 2.53285C2.82504 3.40802 2.33337 4.59501 2.33337 5.83268C2.33337 8.98268 6.44587 12.541 6.62087 12.6927C6.72653 12.7831 6.861 12.8327 7.00004 12.8327C7.13908 12.8327 7.27355 12.8327 7.37921 12.6927C7.58337 12.541 11.6667 8.98268 11.6667 5.83268C11.6667 4.59501 11.175 3.40802 10.2999 2.53285C9.4247 1.65768 8.23772 1.16602 7.00004 1.16602ZM7.00004 11.4618C5.75754 10.2952 3.50004 7.78102 3.50004 5.83268C3.50004 4.90442 3.86879 4.01419 4.52517 3.35781C5.18154 2.70143 6.07178 2.33268 7.00004 2.33268C7.9283 2.33268 8.81854 2.70143 9.47491 3.35781C10.1313 4.01419 10.5 4.90442 10.5 5.83268C10.5 7.78102 8.24254 10.301 7.00004 11.4618ZM7.00004 3.49935C6.53855 3.49935 6.08742 3.6362 5.70371 3.89259C5.32 4.14898 5.02093 4.51339 4.84432 4.93975C4.66772 5.36612 4.62151 5.83527 4.71154 6.28789C4.80157 6.74052 5.0238 7.15628 5.35012 7.4826C5.67645 7.80892 6.09221 8.03115 6.54483 8.12118C6.99745 8.21121 7.46661 8.16501 7.89297 7.9884C8.31933 7.8118 8.68375 7.51273 8.94014 7.12901C9.19653 6.7453 9.33337 6.29417 9.33337 5.83268C9.33337 5.21384 9.08754 4.62035 8.64996 4.18277C8.21237 3.74518 7.61888 3.49935 7.00004 3.49935ZM7.00004 6.99935C6.7693 6.99935 6.54373 6.93092 6.35188 6.80273C6.16002 6.67453 6.01048 6.49233 5.92218 6.27915C5.83388 6.06597 5.81077 5.83139 5.85579 5.60508C5.90081 5.37877 6.01192 5.17089 6.17508 5.00772C6.33824 4.84456 6.54612 4.73345 6.77244 4.68843C6.99875 4.64342 7.23332 4.66652 7.4465 4.75482C7.65968 4.84312 7.84189 4.99266 7.97009 5.18452C8.09828 5.37637 8.16671 5.60194 8.16671 5.83268C8.16671 6.1421 8.04379 6.43885 7.825 6.65764C7.60621 6.87643 7.30946 6.99935 7.00004 6.99935Z"
      fill="#a3a3a3"
    />
  </svg>
);

const OtherMusicIcon = () => (
  <div className="flex size-[35px] shrink-0 items-center justify-center rounded-[8px] bg-neutral-400">
    <img src={PlusIcon} alt="" className="size-6" />
  </div>
);

const MusicPlatformIcon = ({ type }: { type: string }) => {
  if (type === "spotify") {
    return <img src={SpotifyIcon} alt="" className="size-[35px] shrink-0" />;
  }
  if (type === "youtube") {
    return (
      <img
        src={YouTubeIcon}
        alt=""
        className="h-[30px] w-[35px] shrink-0 aspect-[7/6]"
      />
    );
  }
  if (type === "soundcloud") {
    return <img src={SoundCloudIcon} alt="" className="size-[35px] shrink-0" />;
  }
  return <OtherMusicIcon />;
};

const MusicLinkArrowIcon = () => (
  <svg
    width="8"
    height="15"
    viewBox="0 0 8 15"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M1 1.5L6.5 7.5L1 13.5"
      stroke="#D4D4D4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getExternalUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
};

const MusicLinkCard = ({
  title,
  url,
  icon,
}: {
  title: string;
  url: string;
  icon: string;
}) => {
  return (
    <a
      href={getExternalUrl(url)}
      target="_blank"
      rel="noreferrer"
      className="box-border flex h-[60px] w-full max-w-[330px] items-center gap-[25px] rounded-[12px] bg-neutral-0 px-[12px] py-[15px] text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
    >
      <MusicPlatformIcon type={icon} />
      <div className="min-w-0 flex-1">
        <h3 className="m-0 truncate font-body text-caption3 text-neutral-900">
          {title}
        </h3>
        <p className="m-0 truncate font-body text-caption2 text-neutral-600">
          {url}
        </p>
      </div>
      <MusicLinkArrowIcon />
    </a>
  );
};

const toDate = (date?: string | null, time?: string | null) => {
  if (!date) return null;

  const dateValue = time && !date.includes("T") ? `${date}T${time}` : date;
  const parsedDate = new Date(dateValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
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

const formatDday = (date: Date | null) => {
  if (!date) return "준비중";

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

  if (diffDays < 0) return "공연 완료";
  if (diffDays === 0) return "D-DAY";
  return `D-${diffDays}`;
};

const formatPostMeta = (
  createdAt: string | null | undefined,
  genre: string,
  region: string,
) => {
  const createdDate = createdAt ? new Date(createdAt) : null;

  if (!createdDate || Number.isNaN(createdDate.getTime())) {
    return `${genre} · ${region}`;
  }

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / 60_000),
  );
  const timeLabel =
    diffMinutes < 60
      ? `${diffMinutes}분 전`
      : diffMinutes < 1440
        ? `${Math.floor(diffMinutes / 60)}시간 전`
        : `${Math.floor(diffMinutes / 1440)}일 전`;

  return `${genre} · ${region} · ${timeLabel}`;
};

const getPostVariant = (type: PostType) => {
  if (type === "VIDEO") return "video";
  if (type === "PHOTO") return "image";
  return "text";
};

const getMusicLinks = (links?: MusicLinksResponse | null) => {
  if (!links) return [];

  return [
    { id: "spotify", title: "Spotify", url: links.spotifyUrl, icon: "spotify" },
    { id: "youtube", title: "YouTube", url: links.youtubeUrl, icon: "youtube" },
    {
      id: "soundcloud",
      title: "SoundCloud",
      url: links.soundcloudUrl,
      icon: "soundcloud",
    },
    {
      id: "etc",
      title: links.etcPlatform ?? "기타",
      url: links.etcUrl ?? links.otherUrl,
      icon: "other",
    },
  ].filter((link): link is { id: string; title: string; url: string; icon: string } =>
    Boolean(link.url),
  );
};

const FanBandProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bandId = "wavy" } = useParams<{ bandId: string }>();
  const bandPreview = (
    location.state as { bandPreview?: FanExploreBandDetail } | null
  )?.bandPreview;
  const currentBandId = bandId;
  const [activeTab, setActiveTab] = useState<ProfileTab>("콘텐츠");
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [followOverrides, setFollowOverrides] = useState<
    Record<number, boolean>
  >({});
  const [followerCountOverrides, setFollowerCountOverrides] = useState<
    Record<number, number>
  >({});
  const numericBandId = Number(currentBandId);
  const canToggleFollow = Number.isFinite(numericBandId) && numericBandId > 0;
  const bandDetailQuery = useFanExploreBandDetailQuery(
    canToggleFollow ? numericBandId : undefined,
  );
  const postsQuery = usePostsQuery(canToggleFollow ? numericBandId : Number.NaN, {
    size: 20,
  });
  const performancesQuery = usePerformancesQuery(
    canToggleFollow ? numericBandId : Number.NaN,
  );
  const musicLinksQuery = useMusicLinksQuery(
    canToggleFollow ? numericBandId : Number.NaN,
  );
  const followedBandsQuery = useFollowedBandsQuery(100);
  const followBandMutation = useFollowExploreBand();
  const unfollowBandMutation = useUnfollowExploreBand();
  const enterLiveMutation = useEnterLiveMutation();
  const isLiveAudioSessionError =
    getApiErrorCode(bandDetailQuery.error) === LIVE_AUDIO_SESSION_NOT_FOUND_CODE;
  const bandDetailFallback =
    isLiveAudioSessionError && bandPreview
      ? {
          ...bandPreview,
          isLive: false,
          liveId: null,
        }
      : bandPreview;
  const bandDetail = bandDetailQuery.data ?? bandDetailFallback;
  const bandName = bandDetail?.bandName ?? bandDetail?.name ?? "밴드";
  const bandGenre = bandDetail?.genre ? getGenreLabel(bandDetail.genre) : "장르";
  const bandRegion = bandDetail?.region
    ? getRegionLabel(bandDetail.region)
    : "지역";
  const bandDescription =
    bandDetail?.description ??
    bandDetail?.bandDescription ??
    bandDetail?.introduction ??
    bandDetail?.introduce ??
    "등록된 소개가 없어요";
  const bandProfileImage =
    bandDetail?.profileImageUrl ??
    bandDetail?.bandProfileImageUrl ??
    bandDetail?.imageUrl ??
    BandImage;
  const followedBandMatch = canToggleFollow
    ? followedBandsQuery.data?.pages
        .flatMap((page) => page.items)
        .find((followedBand) => getFollowedBandId(followedBand) === numericBandId)
    : undefined;
  const isFollowedFromList =
    canToggleFollow && followedBandMatch != null;
  const followOverride = canToggleFollow
    ? followOverrides[numericBandId]
    : undefined;
  const isFollowing =
    followOverride ??
    (isFollowedFromList ? true : undefined) ??
    bandDetailQuery.data?.isFollowing ??
    bandDetailQuery.data?.isFollowed ??
    bandDetailQuery.data?.following ??
    bandDetailQuery.data?.followed ??
    bandPreview?.isFollowing ??
    bandPreview?.isFollowed ??
    bandPreview?.following ??
    bandPreview?.followed ??
    false;
  const rawFollowerCount =
    getBandFollowerCount(bandDetailQuery.data) ??
    getFollowedBandFollowerCount(followedBandMatch) ??
    getBandFollowerCount(bandPreview) ??
    0;
  const followerCountOverride = canToggleFollow
    ? followerCountOverrides[numericBandId]
    : undefined;
  const followerCount = Math.max(
    followerCountOverride ?? rawFollowerCount,
    isFollowing ? 1 : 0,
  );
  const isOfficial = bandDetail?.isOfficial ?? bandDetail?.official ?? false;
  const rawLiveId = bandDetail?.liveId ?? null;
  const liveId =
    typeof rawLiveId === "number"
      ? rawLiveId
      : typeof rawLiveId === "string"
        ? Number(rawLiveId)
        : null;
  const canEnterLive =
    bandDetail?.isLive === true && typeof liveId === "number" && liveId > 0;
  const isFollowPending =
    followBandMutation.isPending || unfollowBandMutation.isPending;
  const posts = postsQuery.data?.posts ?? [];
  const performances = performancesQuery.data?.performances ?? [];
  const musicLinks = getMusicLinks(musicLinksQuery.data);
  const hasContent = posts.length > 0;
  const hasSchedules = performances.length > 0;
  const hasMusic = musicLinks.length > 0;

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => setToastMessage(null), 2000);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  useEffect(() => {
    if (
      !canToggleFollow ||
      isFollowedFromList ||
      !followedBandsQuery.hasNextPage ||
      followedBandsQuery.isFetchingNextPage
    ) {
      return;
    }

    void followedBandsQuery.fetchNextPage();
  }, [
    canToggleFollow,
    followedBandsQuery,
    isFollowedFromList,
  ]);

  const handleOpenLive = async () => {
    if (!canEnterLive || liveId == null || enterLiveMutation.isPending) return;

    try {
      const enteredLive = await enterLiveMutation.mutateAsync(liveId);

      navigate("/fan/live/room", { state: { live: enteredLive } });
    } catch (error) {
      alert(getApiErrorMessage(error, "라이브 입장에 실패했어요."));
    }
  };

  const handleToggleFollow = async () => {
    if (!canToggleFollow || isFollowPending) return;

    if (isFollowing) {
      setIsUnfollowModalOpen(true);
      return;
    }

    try {
      setFollowOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: true,
      }));
      setFollowerCountOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: Math.max(followerCount + 1, 1),
      }));
      setToastMessage(`${bandName}를 팔로우했어요`);
      await followBandMutation.mutateAsync(numericBandId);
    } catch {
      setFollowOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: false,
      }));
      setFollowerCountOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: rawFollowerCount,
      }));
      setToastMessage("밴드 팔로우에 실패했어요");
    }
  };

  const confirmUnfollow = async () => {
    if (!canToggleFollow || isFollowPending) return;

    setIsUnfollowModalOpen(false);

    try {
      setFollowOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: false,
      }));
      setFollowerCountOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: Math.max(followerCount - 1, 0),
      }));
      await unfollowBandMutation.mutateAsync(numericBandId);

      setToastMessage(`${bandName} 팔로우를 취소했어요`);
    } catch {
      setFollowOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: true,
      }));
      setFollowerCountOverrides((currentOverrides) => ({
        ...currentOverrides,
        [numericBandId]: Math.max(rawFollowerCount, 1),
      }));
      setToastMessage("팔로우 취소에 실패했어요");
    }
  };

  return (
    <main
      className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]"
      data-band-id={currentBandId}
    >
      <Header title={`${bandName}의 프로필`} />

      <section className="px-[32px] pt-[16px]">
        <div className="flex items-start gap-[21px]">
          <img
            src={bandProfileImage}
            alt={`${bandName} 프로필`}
            className="size-[72px] rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[8px]">
              <h2 className="m-0 font-body text-label1 text-neutral-900">
                {bandName}
              </h2>
              {isOfficial ? (
                <img src={OfficialIcon} alt="" className="size-[19px] shrink-0" />
              ) : null}
            </div>
            <p className="m-0 mt-[5px] font-body text-caption2 text-neutral-700">
              {bandGenre} · {bandRegion} · 팔로워 {followerCount}명
            </p>
            <p className="m-0 mt-[5px] font-body text-body5 text-neutral-600">
              {bandDescription}
            </p>
          </div>
        </div>

        <div className="mt-[32px] grid grid-cols-2 gap-[16px]">
          <button
            type="button"
            disabled={!canToggleFollow || isFollowPending}
            onClick={() => void handleToggleFollow()}
            className={[
              "flex h-[38px] items-center justify-center rounded-[8px] border font-body text-body1",
              isFollowing
                ? "border-primary-50 bg-primary-50 text-primary-400"
                : "border-primary-400 bg-neutral-0 text-primary-400",
            ].join(" ")}
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>

          <button
            type="button"
            disabled={!canEnterLive || enterLiveMutation.isPending}
            onClick={() => void handleOpenLive()}
            className={[
              "flex h-[38px] items-center justify-center rounded-[8px] border font-body text-body1",
              canEnterLive
                ? "border-primary-400 bg-primary-400 text-neutral-0"
                : "border-neutral-300 bg-neutral-300 text-neutral-500",
            ].join(" ")}
          >
            라이브 입장
          </button>
        </div>
      </section>

      <nav className="relative mt-[32px] grid h-[30px] grid-cols-3 px-[32px]">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              "relative z-10 flex flex-col items-center gap-[8px] font-body text-body1",
              activeTab === tab ? "text-neutral-900" : "text-neutral-400",
            ].join(" ")}
          >
            <span>{tab}</span>
            <span
              className={[
                "h-[2px] w-[114px] rounded-full",
                activeTab === tab ? "bg-primary-400" : "bg-transparent",
              ].join(" ")}
            />
          </button>
        ))}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-neutral-400" />
      </nav>

      {activeTab === "콘텐츠" && hasContent ? (
        <section className="px-[23px] pt-[24px]">
          <div className="flex flex-col gap-[12px]">
            {posts.map((post: PostListItem) => {
              const mediaUrls = post.thumbnailUrl ? [post.thumbnailUrl] : [];

              return (
                <FollowedNewsCard
                  key={post.postId}
                  variant={getPostVariant(post.type)}
                  profileImageSrc={bandProfileImage}
                  profileImageAlt={`${bandName} 프로필`}
                  bandName={bandName}
                  meta={formatPostMeta(post.createdAt, bandGenre, bandRegion)}
                  content={post.description ?? post.title}
                  mediaUrls={mediaUrls}
                  videoThumbnailUrl={post.thumbnailUrl ?? undefined}
                  tags={[]}
                  onClick={() => navigate(`/fan/explore/contents/${post.postId}`)}
                  ariaLabel={`${post.title} 상세보기`}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {activeTab === "콘텐츠" && !hasContent ? (
        <section className="flex min-h-[444px] flex-col items-center justify-center px-[32px] text-center">
          <h2 className="m-0 font-body text-label1 text-neutral-900">
            아직 등록된 콘텐츠가 없어요
          </h2>
          <p className="m-0 mt-[12px] font-body text-caption1 text-neutral-600">
            새로운 콘텐츠가 등록되면
            <br />
            팔로우한 팬에게 가장 먼저 알림을 보내드려요
          </p>
        </section>
      ) : null}

      {activeTab === "일정" && hasSchedules ? (
        <section className="px-[23px] pt-[24px]">
          <div className="flex flex-col gap-[12px]">
            {performances.map((performance: PerformanceListItem) => {
              const performanceDate = toDate(performance.performanceDate);
              const month = performanceDate
                ? performanceDate.toLocaleString("en-US", { month: "short" }).toUpperCase()
                : "TBD";
              const day = performanceDate
                ? String(performanceDate.getDate()).padStart(2, "0")
                : "--";
              const isCompleted = formatDday(performanceDate) === "공연 완료";

              return (
                <ConcertCard
                  key={performance.performanceId}
                  showThumbnail={Boolean(performance.posterImageUrl)}
                  thumbnailSrc={performance.posterImageUrl ?? undefined}
                  month={month}
                  day={day}
                  title={
                    <span className={isCompleted ? "text-neutral-500" : undefined}>
                      {performance.title}
                    </span>
                  }
                  location={
                    isCompleted ? (
                      <span className="flex items-center gap-1 text-neutral-500">
                        <LocationIconNeutral500 />
                        {performance.venue}
                      </span>
                    ) : (
                      performance.venue
                    )
                  }
                  locationIconSrc={isCompleted ? "" : undefined}
                  dateTime={formatDateTime(performanceDate)}
                  status={
                    <span
                      className={
                        isCompleted ? "text-neutral-500" : "text-primary-500"
                      }
                    >
                      {formatDday(performanceDate)}
                    </span>
                  }
                  dateBadgeClassName="bg-primary-300"
                  isPending={isCompleted}
                  thumbnailClassName={
                    isCompleted
                      ? "bg-neutral-600 text-neutral-700"
                      : "bg-neutral-300 text-neutral-700"
                  }
                  onClick={() =>
                    navigate(`/fan/home/concerts/${performance.performanceId}`)
                  }
                  ariaLabel={`${performance.title} 상세보기`}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {activeTab === "일정" && !hasSchedules ? (
        <section className="flex min-h-[444px] flex-col items-center justify-center px-[32px] text-center">
          <h2 className="m-0 font-body text-label1 text-neutral-900">
            아직 등록된 일정이 없어요
          </h2>
          <p className="m-0 mt-[12px] font-body text-caption1 text-neutral-600">
            새로운 일정이 등록되면
            <br />
            팔로우한 팬에게 가장 먼저 알림을 보내드려요
          </p>
        </section>
      ) : null}

      {activeTab === "음원" && hasMusic ? (
        <section className="px-[32px] pt-[24px]">
          <p className="m-0 font-body text-caption2 text-neutral-600">
            외부 음원 플랫폼에서 이 밴드의 음악을 들어보세요
          </p>
          <div className="mt-[16px] flex flex-col gap-[12px]">
            {musicLinks.map((link) => (
              <MusicLinkCard
                key={link.id}
                title={link.title}
                url={link.url}
                icon={link.icon}
              />
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "음원" && !hasMusic ? (
        <section className="flex min-h-[444px] flex-col items-center justify-center px-[32px] text-center">
          <h2 className="m-0 font-body text-label1 text-neutral-900">
            아직 등록된 음원 링크가 없어요
          </h2>
          <p className="m-0 mt-[12px] font-body text-caption1 text-neutral-600">
            밴드가 음원 플랫폼 링크를 등록하면
            <br />
            여기서 바로 들을 수 있어요
          </p>
        </section>
      ) : null}

      <ModalOverlay
        open={isUnfollowModalOpen}
        onClose={() => setIsUnfollowModalOpen(false)}
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
          onCancel={() => setIsUnfollowModalOpen(false)}
          onConfirm={() => void confirmUnfollow()}
        />
      </ModalOverlay>

      <Toast
        open={toastMessage !== null}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        tone={toastMessage?.includes("실패") ? "error" : "success"}
      />
    </main>
  );
};

export default FanBandProfilePage;
