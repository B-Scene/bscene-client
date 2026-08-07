import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  MyApplicationCareerSection,
  MyApplicationDetailHeader,
  MyApplicationDetailTabs,
  MyApplicationInformationSection,
  MyApplicationIntroductionSection,
  MyApplicationPortfolioSection,
  MyApplicationSummary,
} from "@/features/session/applicationDetail/MyApplicationDetailView";
import { type DetailSectionId } from "@/features/session/applicationDetail/applicationDetail.types";
import type { MyApplicationDetailData } from "@/features/session/applicationList/sessionApplicationList.types";

interface MyApplicationDetailProps {
  open: boolean;
  application: MyApplicationDetailData | null;
  onClose: () => void;
}

export const MyApplicationDetail = ({
  open,
  application,
  onClose,
}: MyApplicationDetailProps) => {
  const [activeSection, setActiveSection] =
    useState<DetailSectionId>("introduction");

  const scrollContainerRef = useRef<HTMLElement>(null);

  const sectionRefs = useRef<Record<DetailSectionId, HTMLElement | null>>({
    introduction: null,
    information: null,
    career: null,
    portfolio: null,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSection("introduction");
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !application) {
    return null;
  }

  const {
    displayDate,
    applicationType,
    title,
    nickname,
    profileImageUrl,
    draft,
    portfolioLinks,
  } = application;

  const profileDescription = [draft.part, draft.skillLevel, draft.region]
    .filter(Boolean)
    .join(" · ");

  const handleClose = () => {
    setActiveSection("introduction");
    onClose();
  };

  const handleSelectSection = (sectionId: DetailSectionId) => {
    const scrollContainer = scrollContainerRef.current;

    const section = sectionRefs.current[sectionId];

    if (!scrollContainer || !section) {
      return;
    }

    setActiveSection(sectionId);

    const containerTop = scrollContainer.getBoundingClientRect().top;

    const sectionTop = section.getBoundingClientRect().top;

    const nextScrollTop =
      scrollContainer.scrollTop + sectionTop - containerTop - 47;

    scrollContainer.scrollTo({
      top: nextScrollTop,
      behavior: "smooth",
    });
  };

  return createPortal(
    <main className="fixed inset-0 z-[99999] mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
      <MyApplicationDetailHeader onBack={handleClose} />

      <section
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        <MyApplicationSummary
          displayDate={displayDate}
          applicationType={applicationType}
          title={title}
          nickname={nickname}
          profileImageUrl={profileImageUrl}
          profileDescription={profileDescription}
        />

        <MyApplicationDetailTabs
          activeSection={activeSection}
          onSelect={handleSelectSection}
        />

        <div className="px-6">
          <MyApplicationIntroductionSection
            sectionRef={(element) => {
              sectionRefs.current.introduction = element;
            }}
            shortIntroduction={draft.shortIntroduction}
            introduction={draft.introduction}
          />

          <MyApplicationInformationSection
            sectionRef={(element) => {
              sectionRefs.current.information = element;
            }}
            draft={draft}
          />

          <MyApplicationCareerSection
            sectionRef={(element) => {
              sectionRefs.current.career = element;
            }}
            experiences={draft.experiences}
          />

          <MyApplicationPortfolioSection
            sectionRef={(element) => {
              sectionRefs.current.portfolio = element;
            }}
            portfolioLinks={portfolioLinks}
            fallbackPortfolioLinks={draft.portfolioLinks}
          />
        </div>
      </section>
    </main>,
    document.body,
  );
};