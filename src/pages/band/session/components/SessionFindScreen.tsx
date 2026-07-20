import { useState } from "react";
import type { SessionFindCandidate } from "../types";
import { SessionCandidateCard } from "./SessionCandidateCard";

interface SessionFindScreenProps {
  candidates: SessionFindCandidate[];
  onToggleBookmark: (candidateId: number) => void;
}

export const SessionFindScreen = ({
  candidates,
  onToggleBookmark,
}: SessionFindScreenProps) => {
  const [isNoticeVisible, setIsNoticeVisible] = useState(true);

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
              className="absolute right-2 top-2 flex size-4 items-center justify-center text-[18px] leading-none text-neutral-400"
            >
              ×
            </button>
          </div>
        </section>
      ) : (
        <div className="border-b border-neutral-300" />
      )}

      <section className="flex flex-col gap-3 px-6 pt-3">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <SessionCandidateCard
              key={candidate.id}
              candidate={candidate}
              onToggleBookmark={onToggleBookmark}
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
