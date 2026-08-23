import { useEffect, useRef, useState, type RefObject } from "react";
import PlayButtonIcon from "@/assets/icons/band/play-button.svg";
import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";

export interface SessionApplicationCareer {
  id: number;
  title: string;
  period: string;
  description: string;
}

export interface SessionApplicationPortfolioLink {
  id: number;
  title: string;
  url: string;
  thumbnailUrl?: string | null;
}

export interface SessionApplicationProfileData {
  part: string;
  nickname: string;
  level: string;
  region: string;
  profileImageUrl?: string | null;
  introQuote: string;
  introText: string;
  preferredGenres: string[];
  availableActivities: string[];
  careers: SessionApplicationCareer[];
  portfolioLinks: SessionApplicationPortfolioLink[];
}

interface SessionApplicationProfileProps {
  data: SessionApplicationProfileData;
  isBandOwner: boolean;
  onChatClick?: () => void;
}

const TABS = ["소개", "정보", "경력", "포트폴리오"] as const;
type SessionApplicationTab = (typeof TABS)[number];

const ChatBubbleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9.75 8.25H5.25C5.05109 8.25 4.86032 8.32902 4.71967 8.46967C4.57902 8.61032 4.5 8.80109 4.5 9C4.5 9.19891 4.57902 9.38968 4.71967 9.53033C4.86032 9.67098 5.05109 9.75 5.25 9.75H9.75C9.94891 9.75 10.1397 9.67098 10.2803 9.53033C10.421 9.38968 10.5 9.19891 10.5 9C10.5 8.80109 10.421 8.61032 10.2803 8.46967C10.1397 8.32902 9.94891 8.25 9.75 8.25ZM12.75 5.25H5.25C5.05109 5.25 4.86032 5.32902 4.71967 5.46967C4.57902 5.61032 4.5 5.80109 4.5 6C4.5 6.19891 4.57902 6.38968 4.71967 6.53033C4.86032 6.67098 5.05109 6.75 5.25 6.75H12.75C12.9489 6.75 13.1397 6.67098 13.2803 6.53033C13.421 6.38968 13.5 6.19891 13.5 6C13.5 5.80109 13.421 5.61032 13.2803 5.46967C13.1397 5.32902 12.9489 5.25 12.75 5.25ZM14.25 1.5H3.75C3.15326 1.5 2.58097 1.73705 2.15901 2.15901C1.73705 2.58097 1.5 3.15326 1.5 3.75V11.25C1.5 11.8467 1.73705 12.419 2.15901 12.841C2.58097 13.2629 3.15326 13.5 3.75 13.5H12.4425L15.2175 16.2825C15.2876 16.352 15.3707 16.407 15.4621 16.4443C15.5534 16.4817 15.6513 16.5006 15.75 16.5C15.8484 16.5025 15.946 16.482 16.035 16.44C16.172 16.3837 16.2892 16.2882 16.372 16.1654C16.4547 16.0426 16.4993 15.8981 16.5 15.75V3.75C16.5 3.15326 16.2629 2.58097 15.841 2.15901C15.419 1.73705 14.8467 1.5 14.25 1.5ZM15 13.9425L13.2825 12.2175C13.2124 12.148 13.1293 12.093 13.0379 12.0557C12.9466 12.0183 12.8487 11.9994 12.75 12H3.75C3.55109 12 3.36032 11.921 3.21967 11.7803C3.07902 11.6397 3 11.4489 3 11.25V3.75C3 3.55109 3.07902 3.36032 3.21967 3.21967C3.36032 3.07902 3.55109 3 3.75 3H14.25C14.4489 3 14.6397 3.07902 14.7803 3.21967C14.921 3.36032 15 3.55109 15 3.75V13.9425Z"
      fill="currentColor"
    />
  </svg>
);

export const SessionApplicationProfile = ({
  data,
  isBandOwner,
  onChatClick,
}: SessionApplicationProfileProps) => {
  const introRef = useRef<HTMLElement | null>(null);
  const infoRef = useRef<HTMLElement | null>(null);
  const careerRef = useRef<HTMLElement | null>(null);
  const portfolioRef = useRef<HTMLElement | null>(null);

  const [activeTab, setActiveTab] = useState<SessionApplicationTab>("소개");

  const sectionRefs: Record<
    SessionApplicationTab,
    RefObject<HTMLElement | null>
  > = {
    소개: introRef,
    정보: infoRef,
    경력: careerRef,
    포트폴리오: portfolioRef,
  };

  const handleTabClick = (tab: SessionApplicationTab) => {
    setActiveTab(tab);
    sectionRefs[tab].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const sections = TABS.map((tab) => ({
      tab,
      el: sectionRefs[tab].current,
    })).filter(
      (section): section is { tab: SessionApplicationTab; el: HTMLElement } =>
        Boolean(section.el),
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];

        if (!visibleEntry) return;

        const matched = sections.find(
          (section) => section.el === visibleEntry.target,
        );

        if (matched) setActiveTab(matched.tab);
      },
      { rootMargin: "-44px 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section.el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 px-6 pt-4">
        <h2 className="text-h3 text-neutral-900">
          {data.part} 세션 지원합니다
        </h2>

        <div className="flex items-center gap-6">
          <img
            src={data.profileImageUrl || UserDefaultProfileIcon}
            alt=""
            className="size-24 shrink-0 rounded-full object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <span className="truncate text-[20px] leading-5 font-bold text-neutral-900">
              {data.nickname}
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-caption1 text-neutral-700">
                {data.part} · {data.level} · {data.region}
              </span>

              <button
                type="button"
                onClick={onChatClick}
                disabled={!isBandOwner}
                className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-3.75 py-1 text-caption3 disabled:cursor-not-allowed ${
                  isBandOwner
                    ? "border-secondary-500 text-secondary-500"
                    : "border-neutral-400 text-neutral-400"
                }`}
              >
                <span
                  className={
                    isBandOwner ? "text-secondary-500" : "text-neutral-400"
                  }
                >
                  <ChatBubbleIcon />
                </span>
                채팅하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav
        aria-label="지원서 메뉴"
        className="sticky top-0 z-10 grid grid-cols-4 bg-neutral-0"
      >
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-400" />

        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`relative flex h-11 items-center justify-center ${
              activeTab === tab
                ? "text-body6 text-secondary-500"
                : "text-body1 text-neutral-400"
            }`}
          >
            {tab}
            {activeTab === tab ? (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-full -translate-x-1/2 bg-secondary-500" />
            ) : null}
          </button>
        ))}
      </nav>

      <section ref={introRef} className="flex scroll-mt-11 flex-col gap-3 px-6">
        <h3 className="text-label1 text-neutral-900">세션 소개</h3>
        <blockquote className="text-body1 text-secondary-500">
          “{data.introQuote}”
        </blockquote>
        <p className="whitespace-pre-line text-caption2 text-neutral-800">
          {data.introText}
        </p>
      </section>

      <div className="mx-6 h-0.5 bg-neutral-300" aria-hidden="true" />

      <section ref={infoRef} className="flex scroll-mt-11 flex-col gap-4 px-6">
        <h3 className="text-label1 text-neutral-900">세션 정보</h3>

        <SessionInfoGroup label="파트" values={[data.part]} />
        <SessionInfoGroup label="실력대" values={[data.level]} />
        <SessionInfoGroup label="선호 장르" values={data.preferredGenres} />
        <SessionInfoGroup label="활동 지역" values={[data.region]} />
        <SessionInfoGroup
          label="가능한 활동"
          values={data.availableActivities}
        />
      </section>

      <div className="mx-6 h-0.5 bg-neutral-300" aria-hidden="true" />

      <section
        ref={careerRef}
        className="flex scroll-mt-11 flex-col gap-4 px-6"
      >
        <h3 className="text-label1 text-neutral-900">경력</h3>

        {data.careers.length > 0 ? (
          <div className="flex flex-col gap-4">
            {data.careers.map((career) => (
              <div key={career.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-secondary-500"
                    aria-hidden="true"
                  />
                  <span className="text-body4 text-neutral-500">
                    {career.period}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-3.5">
                  <span className="text-body6 text-neutral-800">
                    {career.title}
                  </span>
                  <span className="text-caption2 text-neutral-700">
                    {career.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-caption2 text-neutral-500">등록된 경력이 없어요</p>
        )}
      </section>

      <div className="mx-6 h-0.5 bg-neutral-300" aria-hidden="true" />

      <section
        ref={portfolioRef}
        className="flex scroll-mt-11 flex-col gap-4 px-6 pb-6"
      >
        <h3 className="text-label1 text-neutral-900">포트폴리오</h3>

        {data.portfolioLinks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {data.portfolioLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col gap-4"
              >
                <div className="relative mx-auto flex aspect-video w-82.5 items-center justify-center overflow-hidden rounded-lg bg-neutral-500">
                  {link.thumbnailUrl ? (
                    <img
                      src={link.thumbnailUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                  <img
                    src={PlayButtonIcon}
                    alt=""
                    className="absolute size-6"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-body1 text-neutral-800">
                    {link.title}
                  </span>
                  <span className="truncate text-caption2 text-neutral-500">
                    {link.url}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-caption2 text-neutral-500">
            등록된 포트폴리오가 없어요
          </p>
        )}
      </section>
    </div>
  );
};

interface SessionInfoGroupProps {
  label: string;
  values: string[];
}

const SessionInfoGroup = ({ label, values }: SessionInfoGroupProps) => (
  <div className="flex flex-col gap-2">
    <span className="text-body1 text-neutral-800">{label}</span>
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex h-6.5 items-center rounded-lg border border-neutral-400 px-3 text-caption3 text-neutral-600"
        >
          {value}
        </span>
      ))}
    </div>
  </div>
);
