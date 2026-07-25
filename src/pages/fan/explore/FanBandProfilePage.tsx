import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import OfficialIcon from "@/assets/icons/band/official-icon.svg";
import PlusIcon from "@/assets/icons/Plus.svg";
import SoundCloudIcon from "@/assets/icons/soundcloude.svg";
import SpotifyIcon from "@/assets/icons/Spotify.svg";
import YouTubeIcon from "@/assets/icons/youtube.svg";
import BandImage from "@/assets/Img_Band.png";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { FollowedNewsCard } from "@/components/fan/home/FollowedNewsCard";

const TABS = ["콘텐츠", "일정", "음원"] as const;
type ProfileTab = (typeof TABS)[number];

const SCHEDULES = [
  { id: "schedule-1", showThumbnail: true, status: "D-7" },
  {
    id: "schedule-2",
    month: "MAY",
    day: "17",
    dateBadgeClassName: "bg-primary-300",
    status: "D-day",
  },
  {
    id: "schedule-3",
    showThumbnail: true,
    isPending: true,
    thumbnailClassName: "bg-neutral-600 text-neutral-700",
    titleClassName: "text-neutral-500",
    status: "공연 완료",
  },
];

const MUSIC_LINKS = [
  {
    id: "spotify",
    title: "Spotify",
    url: "open.spotify.com/artist/밴드명",
    icon: "spotify",
  },
  {
    id: "youtube",
    title: "YouTube",
    url: "youtube.com/@밴드채널명",
    icon: "youtube",
  },
  {
    id: "soundcloud",
    title: "SoundCloud",
    url: "soundcloud.com/밴드명",
    icon: "soundcloud",
  },
  {
    id: "other",
    title: "기타 링크",
    url: "멜론, 지니, 벅스, 애플뮤직 등",
    icon: "other",
    disabled: true,
  },
];

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

const MusicLinkCard = ({
  title,
  url,
  icon,
  disabled = false,
}: {
  title: string;
  url: string;
  icon: string;
  disabled?: boolean;
}) => {
  return (
    <article
      className={[
        "box-border flex h-[60px] w-full max-w-[330px] items-center gap-[25px] rounded-[12px] px-[12px] py-[15px] text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]",
        disabled ? "bg-neutral-300" : "bg-neutral-0",
      ].join(" ")}
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
      {disabled ? null : <MusicLinkArrowIcon />}
    </article>
  );
};

const FanBandProfilePage = () => {
  const navigate = useNavigate();
  const { bandId = "wavy" } = useParams<{ bandId: string }>();
  const [searchParams] = useSearchParams();
  // TODO: currentBandId를 기준으로 밴드별 프로필 API 또는 Mock 데이터를 연결한다.
  const currentBandId = bandId;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(560);
  const [activeTab, setActiveTab] = useState<ProfileTab>("콘텐츠");
  const hasContent = searchParams.get("content") !== "empty";
  const hasSchedules = searchParams.get("schedule") !== "empty";
  const hasMusic = searchParams.get("music") !== "empty";

  const handleToggleFollow = () => {
    const nextIsFollowing = !isFollowing;

    setIsFollowing(nextIsFollowing);
    setFollowerCount((count) =>
      nextIsFollowing ? count + 1 : Math.max(0, count - 1),
    );
  };

  return (
    <main
      className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]"
      data-band-id={currentBandId}
    >
      <header className="relative flex h-[48px] w-full max-w-[393px] items-center justify-center bg-neutral-0 px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="absolute left-[15px] top-1/2 flex size-6 -translate-y-1/2 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
        <h1 className="m-0 font-body text-label2 text-neutral-900">
          WAVY의 프로필
        </h1>
      </header>

      <section className="px-[32px] pt-[16px]">
        <div className="flex items-center gap-[21px]">
          <img
            src={BandImage}
            alt="WAVY 프로필"
            className="size-[72px] rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[8px]">
              <h2 className="m-0 font-body text-label1 text-neutral-900">
                WAVY
              </h2>
              <img src={OfficialIcon} alt="" className="size-[19px] shrink-0" />
            </div>
            <p className="m-0 mt-[5px] font-body text-caption2 text-neutral-700">
              인디 · 서울 · 팔로워 {followerCount}명
            </p>
            <p className="m-0 mt-[5px] line-clamp-1 font-body text-body5 text-neutral-600">
              몽환적인 사운드와 감각적인 스타일로 주목받는 3인조 밴드
            </p>
          </div>
        </div>

        <div className="mt-[32px] grid grid-cols-2 gap-[16px]">
          <button
            type="button"
            onClick={handleToggleFollow}
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
            className="flex h-[38px] items-center justify-center rounded-[8px] border border-primary-400 bg-primary-400 font-body text-body1 text-neutral-0"
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
            <FollowedNewsCard variant="image" tags={[]} />
            <FollowedNewsCard variant="video" tags={[]} />
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
            {SCHEDULES.map((schedule) => (
              <ConcertCard
                key={schedule.id}
                showThumbnail={schedule.showThumbnail}
                month={schedule.month}
                day={schedule.day}
                title={
                  <span className={schedule.titleClassName}>
                    WAVY 단독 공연
                  </span>
                }
                location={
                  schedule.isPending ? (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <LocationIconNeutral500 />
                      홍대 롤링홀
                    </span>
                  ) : (
                    "홍대 롤링홀"
                  )
                }
                locationIconSrc={schedule.isPending ? "" : undefined}
                dateTime="2026.05.17. 18:00"
                status={
                  <span
                    className={
                      schedule.isPending ? "text-neutral-500" : "text-primary-500"
                    }
                  >
                    {schedule.status}
                  </span>
                }
                dateBadgeClassName={schedule.dateBadgeClassName}
                isPending={schedule.isPending}
                thumbnailClassName={schedule.thumbnailClassName}
              />
            ))}
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
            {MUSIC_LINKS.map((link) => (
              <MusicLinkCard
                key={link.id}
                title={link.title}
                url={link.url}
                icon={link.icon}
                disabled={link.disabled}
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
    </main>
  );
};

export default FanBandProfilePage;
