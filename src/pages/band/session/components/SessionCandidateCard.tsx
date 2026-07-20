import type { SessionFindCandidate } from "../types";
import { StarIcon } from "./SessionIcons";

interface SessionCandidateCardProps {
  candidate: SessionFindCandidate;
  onToggleBookmark: (candidateId: number) => void;
}

const CandidateProfileIcon = () => {
  return (
    <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-neutral-600">
      <svg className="size-[30px]" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <circle cx="15" cy="11.5" r="4.5" stroke="var(--color-neutral-0)" strokeWidth="2" />
        <path
          d="M6.5 25c.8-4.4 4.2-7.5 8.5-7.5s7.7 3.1 8.5 7.5"
          stroke="var(--color-neutral-0)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const SessionCandidateCard = ({
  candidate,
  onToggleBookmark,
}: SessionCandidateCardProps) => {
  return (
    <article className="relative flex w-full gap-4 rounded-[12px] bg-neutral-0 px-6 py-3 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
      <CandidateProfileIcon />

      <div className="min-w-0 flex-1 pr-9">
        <div className="flex items-center gap-3">
          <h2 className="text-label1 text-neutral-900">{candidate.name}</h2>
          <span className="inline-flex h-[24px] min-w-[54px] items-center justify-center rounded-full bg-secondary-0 px-3 text-caption3 font-semibold text-[#FBB10E]">
            {candidate.skill}
          </span>
        </div>

        <p className="mt-1 text-caption2 text-neutral-600">
          {candidate.part} · {candidate.genre} · {candidate.location}
        </p>

        <p className="mt-3 text-body1 font-semibold text-neutral-900">
          {candidate.applicationTitle}
        </p>
        <p className="mt-1 text-caption2 text-neutral-900">{candidate.summary}</p>
      </div>

      <button
        type="button"
        aria-label={candidate.bookmarked ? "관심 세션 해제" : "관심 세션 등록"}
        aria-pressed={candidate.bookmarked}
        onClick={() => onToggleBookmark(candidate.id)}
        className="absolute right-5 top-[18px] flex size-7 items-center justify-center"
      >
        <StarIcon active={candidate.bookmarked} className="size-6" />
      </button>
    </article>
  );
};
