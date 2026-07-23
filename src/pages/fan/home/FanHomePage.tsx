import { useMemo, useState, type UIEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowIcon from "@/assets/Arrow.svg";
import SpeakerIcon from "@/assets/speaker.svg";
import SwapIcon from "@/assets/icons/swap.svg";
import BandProfileImage from "@/assets/icons/band/band-default-profile.svg";
import ContentImage from "@/assets/Img_upload.png";
import ConcertCard from "@/components/common/Card/ConcertCard";
import NewsCard from "@/components/common/Card/NewsCard";
import { HomeHeader } from "@/components/common/Header/HomeHeader";
import { NotificationBellIcon } from "@/components/common/Header/NotificationBellIcon";
import { ModeSwitchSheet } from "@/components/band/home/ModeSwitchSheet";

type HomeVariant = "new" | "recommended" | "main";

const NEWS_ITEMS = [
  {
    id: "news-1",
    title: "팬분들께 전하고 싶은 소식을 적어보세요",
    hasImage: false,
  },
  {
    id: "news-2",
    title: "새 싱글 발매와 공연 일정을 공개했어요",
    hasImage: true,
  },
  {
    id: "news-3",
    title: "팬분들께 전하고 싶은 소식을 적어보세요",
    hasImage: false,
  },
  {
    id: "news-4",
    title: "팬분들께 전하고 싶은 소식을 적어보세요",
    hasImage: true,
  },
  {
    id: "news-5",
    title: "팬분들께 전하고 싶은 소식을 적어보세요",
    hasImage: false,
  },
];

const RECOMMENDED_BANDS = Array.from({ length: 5 }, (_, index) => ({
  id: `band-${index + 1}`,
  name: "밴드명",
  meta: "장르 · 지역",
}));

const CONCERTS = Array.from({ length: 4 }, (_, index) => ({
  id: `concert-${index + 1}`,
  month: "MAY",
  day: "17",
  title: "WAVY 단독 공연",
  location: "홍대 롤링홀",
  dateTime: "2026.05.17. 18:00",
  status: "D-7",
}));

const VARIANTS = new Set<HomeVariant>(["new", "recommended", "main"]);

const getVariant = (value: string | null): HomeVariant => {
  if (value && VARIANTS.has(value as HomeVariant)) {
    return value as HomeVariant;
  }

  return "main";
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

const EmptyFollowCard = () => {
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

const BandRecommendationStrip = () => {
  return (
    <div className="flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {RECOMMENDED_BANDS.map((band) => (
        <article
          key={band.id}
          className="flex w-[54px] shrink-0 flex-col items-center text-center"
        >
          <img
            src={BandProfileImage}
            alt=""
            className="size-[54px] rounded-full object-cover"
          />
          <strong className="mt-2 max-w-full truncate font-body text-body4 text-neutral-900">
            {band.name}
          </strong>
          <span className="mt-[5px] max-w-full truncate font-body text-caption4 text-neutral-600">
            {band.meta}
          </span>
          <button
            type="button"
            className="mt-2 h-[16px] w-[54px] rounded-full border-[1px] border-primary-400 font-body text-label4 text-primary-400"
          >
            팔로우
          </button>
        </article>
      ))}
    </div>
  );
};

const NewsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollContainer = event.currentTarget;
    const firstCard = scrollContainer.firstElementChild as HTMLElement | null;

    if (!firstCard) return;

    const gap = 12;
    const cardStep = firstCard.offsetWidth + gap;
    const nextIndex = Math.min(
      NEWS_ITEMS.length - 1,
      Math.max(0, Math.round(scrollContainer.scrollLeft / cardStep)),
    );

    setActiveIndex(nextIndex);
  };

  return (
    <section>
      <div
        className="flex gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {NEWS_ITEMS.map((item) => (
          <NewsCard
            key={item.id}
            profileImageSrc={BandProfileImage}
            contentImageSrc={item.hasImage ? ContentImage : undefined}
            bandName="밴드명"
            meta="장르 · 지역 · 4시간"
            title={item.title}
            tags={[]}
          />
        ))}
      </div>

      <div className="flex justify-center gap-1">
        {NEWS_ITEMS.map((item, index) => (
          <span
            key={item.id}
            className={
              index === activeIndex
                ? "size-1 rounded-full bg-primary-300"
                : "size-1 rounded-full bg-neutral-400"
            }
          />
        ))}
      </div>
    </section>
  );
};

const ConcertList = ({ count = 4 }: { count?: number }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      {CONCERTS.slice(0, count).map((concert) => (
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
  const variant = getVariant(searchParams.get("variant"));
  const hasNotifications = searchParams.get("notifications") !== "empty";

  const content = useMemo(() => {
    if (variant === "new") {
      return (
        <>
          <section>
            <SectionHeader title="팔로우한 밴드 소식" showMore={false} />
            <EmptyFollowCard />
          </section>

          <section className="mt-8">
            <SectionHeader
              title="이런 밴드는 어때요?"
              description="관심사 장르 · 지역 기반 추천"
            />
            <BandRecommendationStrip />
          </section>

          <section className="mt-8">
            <SectionHeader
              title="이런 공연은 어때요?"
              description="지금 인기 있는 공연을 추천해드릴게요!"
              onMoreClick={() => navigate("/fan/home/concerts")}
            />
            <ConcertList />
          </section>
        </>
      );
    }

    if (variant === "recommended") {
      return (
        <>
          <section>
            <SectionHeader
              title="팔로우한 밴드 소식"
              onMoreClick={() => navigate("/fan/home/news")}
            />
            <NewsCarousel />
          </section>

          <section className="mt-8">
            <SectionHeader
              title="다가오는 공연이 없어요"
              description="지금 인기 있는 공연을 추천해드릴게요!"
              onMoreClick={() => navigate("/fan/home/concerts")}
            />
            <ConcertList />
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
          <NewsCarousel />
        </section>

        <section className="mt-8">
          <SectionHeader
            title="다가오는 공연"
            onMoreClick={() => navigate("/fan/home/concerts")}
          />
          <ConcertList />
        </section>
      </>
    );
  }, [navigate, variant]);

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <HomeHeader
        rightAction={
          <>
            <button
              type="button"
              aria-label="알림"
              onClick={() =>
                navigate(
                  `/fan/home/notifications?status=${
                    hasNotifications ? "has" : "empty"
                  }`,
                )
              }
              className="flex size-6 items-center justify-center text-neutral-900"
            >
              <NotificationBellIcon hasUnread={hasNotifications} />
            </button>

            <button
              type="button"
              aria-label="모드 전환"
              onClick={() => setIsModeSwitchOpen(true)}
            >
              <img src={SwapIcon} alt="" className="size-6" />
            </button>
          </>
        }
      />

      <div className="mt-8">{content}</div>

      <ModeSwitchSheet
        open={isModeSwitchOpen}
        onClose={() => setIsModeSwitchOpen(false)}
      />
    </main>
  );
};

export default FanHomePage;
