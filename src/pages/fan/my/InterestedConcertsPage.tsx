import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import BellActiveIcon from "@/assets/icons/fan/bell-active-icon.svg";
import BellIcon from "@/assets/icons/fan/bell-icon.svg";
import ImagePlaceholderIcon from "@/assets/icons/fan/image-icon.svg";
import LikedPerformIcon from "@/assets/icons/fan/liked-perform.svg";

interface InterestConcert {
  id: string;
  title: string;
  location: string;
  dateTime: string;
  status: string;
  year: number;
}

const INTEREST_CONCERTS: InterestConcert[] = [
  {
    id: "concert-1",
    title: "WAVY 단독 공연",
    location: "홍대 롤링홀",
    dateTime: "2026. 08. 17. 18:00",
    status: "D-28",
    year: 2026,
  },
  {
    id: "concert-2",
    title: "WAVY EP 발매 쇼케이스",
    location: "홍대 롤링홀",
    dateTime: "2026. 06. 14. 19:00",
    status: "D-70",
    year: 2026,
  },
  {
    id: "concert-3",
    title: "인디 나잇 vol.4",
    location: "상수 무브홀",
    dateTime: "2026. 07. 20. 20:00",
    status: "D-88",
    year: 2026,
  },
];

const FILTERS = ["전체", "2026년", "2025년", "2024년 이전"] as const;

type Filter = (typeof FILTERS)[number];

const matchesFilter = (concert: InterestConcert, filter: Filter) => {
  if (filter === "전체") return true;
  if (filter === "2024년 이전") return concert.year <= 2024;
  return `${concert.year}년` === filter;
};

const LocationIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7.00004 1.16602C5.76236 1.16602 4.57538 1.65768 3.70021 2.53285C2.82504 3.40802 2.33337 4.59501 2.33337 5.83268C2.33337 8.98268 6.44587 12.541 6.62087 12.6927C6.72653 12.7831 6.861 12.8327 7.00004 12.8327C7.13908 12.8327 7.27355 12.7831 7.37921 12.6927C7.58337 12.541 11.6667 8.98268 11.6667 5.83268C11.6667 4.59501 11.175 3.40802 10.2999 2.53285C9.4247 1.65768 8.23772 1.16602 7.00004 1.16602ZM7.00004 11.4618C5.75754 10.2952 3.50004 7.78102 3.50004 5.83268C3.50004 4.90442 3.86879 4.01419 4.52517 3.35781C5.18154 2.70143 6.07178 2.33268 7.00004 2.33268C7.9283 2.33268 8.81854 2.70143 9.47491 3.35781C10.1313 4.01419 10.5 4.90442 10.5 5.83268C10.5 7.78102 8.24254 10.301 7.00004 11.4618ZM7.00004 3.49935C6.53855 3.49935 6.08742 3.6362 5.70371 3.89259C5.32 4.14898 5.02093 4.51339 4.84432 4.93975C4.66772 5.36612 4.62151 5.83527 4.71154 6.28789C4.80157 6.74052 5.0238 7.15628 5.35012 7.4826C5.67645 7.80892 6.09221 8.03115 6.54483 8.12118C6.99745 8.21121 7.46661 8.16501 7.89297 7.9884C8.31933 7.8118 8.68375 7.51273 8.94014 7.12901C9.19653 6.7453 9.33337 6.29417 9.33337 5.83268C9.33337 5.21384 9.08754 4.62035 8.64996 4.18277C8.21237 3.74518 7.61888 3.49935 7.00004 3.49935ZM7.00004 6.99935C6.7693 6.99935 6.54373 6.93092 6.35188 6.80273C6.16002 6.67453 6.01048 6.49233 5.92218 6.27915C5.83388 6.06597 5.81077 5.83139 5.85579 5.60508C5.90081 5.37877 6.01192 5.17089 6.17508 5.00772C6.33824 4.84456 6.54612 4.73345 6.77244 4.68843C6.99875 4.64342 7.23332 4.66652 7.4465 4.75482C7.65968 4.84312 7.84189 4.99266 7.97009 5.18452C8.09828 5.37637 8.16671 5.60194 8.16671 5.83268C8.16671 6.1421 8.04379 6.43885 7.825 6.65764C7.60621 6.87643 7.30946 6.99935 7.00004 6.99935Z"
      fill="currentColor"
    />
  </svg>
);

const InterestedConcertsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("전체");
  const [notifyIds, setNotifyIds] = useState<Record<string, boolean>>({
    "concert-2": true,
    "concert-3": true,
  });

  const toggleNotify = (id: string) => {
    setNotifyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredConcerts = INTEREST_CONCERTS.filter((concert) =>
    matchesFilter(concert, activeFilter),
  );

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="-mx-5 flex h-15 items-center justify-between px-3.75">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">
          관심 공연 목록
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <div className="mt-4 flex flex-col gap-5">
        <div className="rounded-xl border border-primary-300 bg-primary-0 p-3 text-center">
          <p className="m-0 text-caption2 leading-5 text-neutral-600">
            공연 상세페이지에서 하트를 눌러 찜한 공연이 모여요
            <br />
            알림 설정 여부와는 별도로 관리됩니다
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-neutral-0 py-3 px-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <img src={LikedPerformIcon} alt="" className="shrink-0" />

          <div className="flex flex-col">
            <span className="text-caption3 text-neutral-900">관심 공연</span>
            <span className="flex items-baseline gap-1">
              <strong className="text-h4 text-primary-500">
                {INTEREST_CONCERTS.length}
              </strong>
              <span className="text-caption2 text-neutral-600">회</span>
            </span>
          </div>
        </div>

        <div className="flex rounded-md bg-primary-0 p-1">
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`flex flex-1 items-center justify-center gap-2.5 rounded-md border border-transparent px-2 py-1.25 text-center text-caption3 text-neutral-900 ${
                  isActive
                    ? "border-black/4 bg-neutral-0 shadow-[0_3px_8px_0_rgba(0,0,0,0.12),0_3px_1px_0_rgba(0,0,0,0.04)]"
                    : ""
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-col gap-3">
          {filteredConcerts.map((concert) => {
            const isNotifyOn = notifyIds[concert.id] ?? false;

            return (
              <li
                key={concert.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-neutral-0 px-4 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex w-12.5 h-15.5 shrink-0 items-center justify-center rounded-lg bg-neutral-400">
                    <img src={ImagePlaceholderIcon} alt="" />
                  </div>

                  <div className="flex min-w-0 flex-col gap-1.25">
                    <div className="flex min-w-0 flex-col">
                      <h3 className="m-0 truncate text-body1 text-neutral-900">
                        {concert.title}
                      </h3>
                      <p className="m-0 flex items-center gap-1 text-caption2 text-neutral-700">
                        <LocationIcon />
                        <span className="truncate">{concert.location}</span>
                      </p>
                    </div>

                    <p className="m-0 text-body5 text-neutral-500">
                      {concert.dateTime}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={isNotifyOn}
                    aria-label={`${concert.title} 알림 ${isNotifyOn ? "끄기" : "켜기"}`}
                    onClick={() => toggleNotify(concert.id)}
                    className="flex size-6 items-center justify-center"
                  >
                    <img src={isNotifyOn ? BellActiveIcon : BellIcon} alt="" />
                  </button>

                  <span className="flex h-6.5 items-center justify-center rounded-full bg-primary-50 px-3.75 text-caption3 text-primary-400">
                    {concert.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
};

export default InterestedConcertsPage;
