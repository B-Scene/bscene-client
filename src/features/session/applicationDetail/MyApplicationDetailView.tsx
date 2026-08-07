import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import PlayButtonIcon from "@/assets/icons/band/play-button.svg";
import type { SessionApplicationDraft } from "@/features/session/applicationForm/applicationForm.types";
import type { SessionApplicationPortfolioLink } from "@/types/session/sessionApplication";
import { getRenderableProfileImageUrl } from "@/utils/profileImageUrl";

import {
  formatApplicationDetailDate,
  getApplicationPortfolioTitle,
  normalizeApplicationPortfolioUrl,
} from "./applicationDetail.utils";
import {
  APPLICATION_DETAIL_TABS,
  type DetailSectionId,
  type SectionRefCallback,
} from "./applicationDetail.types";

export const MyApplicationDetailHeader = ({
  onBack,
}: {
  onBack: () => void;
}) => (
  <header className="relative flex h-[88px] w-full shrink-0 items-end justify-center border-b border-neutral-300 bg-neutral-0 pb-[23px]">
    <button
      type="button"
      aria-label="지원서 목록으로 돌아가기"
      onClick={onBack}
      className="absolute bottom-[18px] left-[15px] flex size-8 items-center justify-center"
    >
      <img src={ArrowLeftIcon} alt="" className="size-6" />
    </button>

    <h1 className="text-label2 text-neutral-900">지원서 보기</h1>
  </header>
);

interface MyApplicationSummaryProps {
  displayDate: string;
  applicationType: string;
  title: string;
  nickname: string;
  profileImageUrl?: string | null;
  profileDescription: string;
}

export const MyApplicationSummary = ({
  displayDate,
  applicationType,
  title,
  nickname,
  profileImageUrl,
  profileDescription,
}: MyApplicationSummaryProps) => (
  <section className="px-6 pt-4 pb-6">
    <p className="text-right text-caption3 text-neutral-500">
      {formatApplicationDetailDate(displayDate)}
    </p>

    <h2 className="mt-3 break-words text-label1 text-neutral-900">
      <span className="text-secondary-500">[{applicationType}]</span> {title}
    </h2>

    <div className="mt-7 flex items-center gap-6">
      <img
        src={
          getRenderableProfileImageUrl(profileImageUrl) ||
          UserDefaultProfileIcon
        }
        alt=""
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = UserDefaultProfileIcon;
        }}
        className="size-[72px] shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0">
        <strong className="block truncate text-label1 text-neutral-900">
          {nickname}
        </strong>
        <p className="mt-2 truncate text-caption3 text-neutral-600">
          {profileDescription || "기본 정보 없음"}
        </p>
      </div>
    </div>
  </section>
);

interface MyApplicationDetailTabsProps {
  activeSection: DetailSectionId;
  onSelect: (sectionId: DetailSectionId) => void;
}

export const MyApplicationDetailTabs = ({
  activeSection,
  onSelect,
}: MyApplicationDetailTabsProps) => (
  <nav
    aria-label="지원서 상세 메뉴"
    className="sticky top-0 z-20 grid h-12 grid-cols-4 border-b border-neutral-300 bg-neutral-0"
  >
    {APPLICATION_DETAIL_TABS.map((tab) => {
      const isActive = activeSection === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`relative flex items-center justify-center text-body1 ${
            isActive ? "text-secondary-500" : "text-neutral-400"
          }`}
        >
          {tab.label}
          {isActive ? (
            <span className="absolute right-0 bottom-[-1px] left-0 h-0.5 bg-secondary-500" />
          ) : null}
        </button>
      );
    })}
  </nav>
);

interface IntroductionSectionProps {
  sectionRef: SectionRefCallback;
  shortIntroduction: string;
  introduction: string;
}

export const MyApplicationIntroductionSection = ({
  sectionRef,
  shortIntroduction,
  introduction,
}: IntroductionSectionProps) => (
  <section
    ref={sectionRef}
    className="scroll-mt-12 border-b border-neutral-300 py-6"
  >
    <h2 className="text-label1 text-neutral-900">세션 소개</h2>
    <p className="mt-4 whitespace-pre-line text-body1 text-secondary-500">
      “{shortIntroduction || "등록된 한줄 소개가 없어요"}”
    </p>
    <p className="mt-3 whitespace-pre-line text-caption2 text-neutral-800">
      {introduction || "등록된 소개글이 없어요"}
    </p>
  </section>
);

interface InformationSectionProps {
  sectionRef: SectionRefCallback;
  draft: SessionApplicationDraft;
}

export const MyApplicationInformationSection = ({
  sectionRef,
  draft,
}: InformationSectionProps) => (
  <section
    ref={sectionRef}
    className="scroll-mt-12 border-b border-neutral-300 py-6"
  >
    <h2 className="text-label1 text-neutral-900">세션 정보</h2>
    <dl className="mt-5 flex flex-col gap-5">
      <ApplicationInfoItem label="파트" values={[draft.part]} />
      <ApplicationInfoItem label="실력대" values={[draft.skillLevel]} />
      <ApplicationInfoItem label="선호 장르" values={[draft.genre]} />
      <ApplicationInfoItem label="활동 지역" values={[draft.region]} />
      <ApplicationInfoItem label="가능한 활동" values={draft.activities} />
    </dl>
  </section>
);

const ApplicationInfoItem = ({
  label,
  values,
}: {
  label: string;
  values: string[];
}) => {
  const visibleValues = values.filter(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return (
    <div>
      <dt className="text-body1 text-neutral-800">{label}</dt>
      <dd className="mt-2 flex flex-wrap gap-2">
        {visibleValues.length > 0 ? (
          visibleValues.map((value, index) => (
            <span
              key={`${label}-${value}-${index}`}
              className="inline-flex h-[26px] items-center justify-center rounded-[8px] border border-neutral-400 bg-neutral-0 px-[15px] text-caption3 text-neutral-600"
            >
              {value}
            </span>
          ))
        ) : (
          <span className="text-caption2 text-neutral-500">
            등록된 정보가 없어요
          </span>
        )}
      </dd>
    </div>
  );
};

interface CareerSectionProps {
  sectionRef: SectionRefCallback;
  experiences: SessionApplicationDraft["experiences"];
}

export const MyApplicationCareerSection = ({
  sectionRef,
  experiences,
}: CareerSectionProps) => (
  <section
    ref={sectionRef}
    className="scroll-mt-12 border-b border-neutral-300 py-6"
  >
    <h2 className="text-label1 text-neutral-900">경력</h2>
    {experiences.length > 0 ? (
      <div className="mt-5 flex flex-col gap-5">
        {experiences.map((experience) => (
          <article key={experience.id} className="relative pl-7">
            <span className="absolute top-[2px] left-1 size-2.5 rounded-full bg-secondary-400" />
            <p className="text-body4 text-neutral-500">{experience.period}</p>
            <h3 className="mt-1 text-body6 text-neutral-800">
              {experience.title}
            </h3>
            {experience.description ? (
              <p className="mt-1 whitespace-pre-line text-caption2 text-neutral-700">
                {experience.description}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    ) : (
      <p className="mt-4 text-caption2 text-neutral-500">
        등록된 경력이 없어요
      </p>
    )}
  </section>
);

interface PortfolioSectionProps {
  sectionRef: SectionRefCallback;
  portfolioLinks?: readonly SessionApplicationPortfolioLink[] | null;
  fallbackPortfolioLinks: string[];
}

interface VisiblePortfolioLink {
  id: string;
  url: string;
  title: string;
  thumbnailUrl?: string | null;
}

export const MyApplicationPortfolioSection = ({
  sectionRef,
  portfolioLinks,
  fallbackPortfolioLinks,
}: PortfolioSectionProps) => {
  const visibleLinks: VisiblePortfolioLink[] =
    portfolioLinks && portfolioLinks.length > 0
      ? portfolioLinks
          .filter((link) => link.url.trim().length > 0)
          .map((link, index) => ({
            id: String(link.sessionApplicationLinkId ?? index),
            url: link.url,
            title:
              link.title?.trim() ||
              getApplicationPortfolioTitle(link.url, index),
            thumbnailUrl: link.thumbnailUrl,
          }))
      : fallbackPortfolioLinks
          .filter((link) => typeof link === "string" && link.trim().length > 0)
          .map((link, index) => ({
            id: `${link}-${index}`,
            url: link,
            title: getApplicationPortfolioTitle(link, index),
            thumbnailUrl: null,
          }));

  return (
    <section ref={sectionRef} className="scroll-mt-12 pt-6 pb-12">
      <h2 className="text-label1 text-neutral-900">포트폴리오</h2>

      {visibleLinks.length > 0 ? (
        <div className="mt-4 flex flex-col gap-6">
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={normalizeApplicationPortfolioUrl(link.url)}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <div className="relative flex h-[172px] w-full items-center justify-center overflow-hidden rounded-[6px] bg-neutral-500">
                {link.thumbnailUrl ? (
                  <img
                    src={link.thumbnailUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}

                <img src={PlayButtonIcon} alt="" className="absolute size-6" />
              </div>

              <h3 className="mt-4 text-body1 text-neutral-800">
                {link.title}
              </h3>

              <p className="mt-1 truncate text-caption2 text-neutral-500">
                {link.url}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-caption2 text-neutral-500">
          등록된 포트폴리오가 없어요
        </p>
      )}
    </section>
  );
};