import { useMemo, useState } from "react";
import { useSessionApplicationsSearchQuery } from "@/hooks/api/session/useSessionApplication";
import type { SessionApplicationSearchItem } from "@/types/session/sessionApplication";
import type { SessionFilterValues } from "../types";
import {
  SessionCandidateCard,
  type SessionCandidateCardData,
} from "./SessionCandidateCard";
import { SessionApplicationDetailScreen } from "./SessionApplicationDetailScreen";

interface SessionFindScreenProps {
  values: SessionFilterValues;
}

const mapApplicationToCandidate = (
  application: SessionApplicationSearchItem,
): SessionCandidateCardData => {
  return {
    id: application.sessionApplicationId,
    name: application.nickname,
    profileImageUrl: application.profileImageUrl,
    skill: application.skillLevel,
    part: application.part,
    genre: application.genre,
    location: application.region,
    applicationTitle: application.title,
    summary: application.oneLineIntro,
  };
};

export const SessionFindScreen = ({ values }: SessionFindScreenProps) => {
  const [isNoticeVisible, setIsNoticeVisible] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  const applicationsQuery = useSessionApplicationsSearchQuery({
    size: 20,
  });

  const candidates = useMemo(() => {
    const apiCandidates =
      applicationsQuery.data?.content.map(mapApplicationToCandidate) ?? [];

    return apiCandidates.filter((candidate) => {
      const matchesPart = values.part === "전체" || candidate.part === values.part;
      const matchesSkill = values.skill === "전체" || candidate.skill === values.skill;
      const matchesGenre = values.genre === "전체" || candidate.genre.includes(values.genre);
      const matchesRegion =
        values.region === "전체" || candidate.location.includes(values.region);

      return matchesPart && matchesSkill && matchesGenre && matchesRegion;
    });
  }, [applicationsQuery.data, values]);

  if (selectedApplicationId) {
    return (
      <SessionApplicationDetailScreen
        sessionApplicationId={selectedApplicationId}
        onBack={() => setSelectedApplicationId(null)}
      />
    );
  }

  return (
    <>
      {isNoticeVisible ? (
        <section className="border-b border-neutral-300 bg-neutral-0 px-6 pb-[9px]">
          <div className="relative flex min-h-[68px] w-full items-center justify-center rounded-[12px] border border-[#FBB10E] bg-secondary-0 px-[34px] py-[15px]">
            <p className="text-center text-caption2 text-neutral-600">
              필터를 선택하지 않으면 기본 지원서에서 선택한 활동 지역, 장르와 같은 세션 뮤지션이 먼저 보여요.
            </p>
            <button
              type="button"
              aria-label="안내 닫기"
              onClick={() => setIsNoticeVisible(false)}
              className="absolute top-2 right-2 flex size-4 items-center justify-center text-[18px] leading-none text-neutral-400"
            >
              ×
            </button>
          </div>
        </section>
      ) : (
        <div className="border-b border-neutral-300" />
      )}

      <section className="flex flex-col gap-3 px-6 pt-3">
        {applicationsQuery.isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            세션 뮤지션을 불러오고 있어요
          </div>
        ) : applicationsQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <p className="text-caption1 text-neutral-500">
              세션 뮤지션을 불러오지 못했어요
            </p>
            <button
              type="button"
              onClick={() => applicationsQuery.refetch()}
              className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
            >
              다시 시도
            </button>
          </div>
        ) : candidates.length > 0 ? (
          candidates.map((candidate) => (
            <SessionCandidateCard
              key={candidate.id}
              candidate={candidate}
              onSelect={setSelectedApplicationId}
            />
          ))
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            선택한 조건에 맞는 세션 뮤지션이 없어요
          </div>
        )}
      </section>
    </>
  );
};