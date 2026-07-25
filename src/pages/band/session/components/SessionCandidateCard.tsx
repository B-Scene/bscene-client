import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";

export interface SessionCandidateCardData {
  id: number;
  name: string;
  profileImageUrl: string | null;
  skill: string;
  part: string;
  genre: string;
  location: string;
  applicationTitle: string;
  summary: string;
}

interface SessionCandidateCardProps {
  candidate: SessionCandidateCardData;
  onSelect?: (candidateId: number) => void;
}

export const SessionCandidateCard = ({
  candidate,
  onSelect,
}: SessionCandidateCardProps) => {
  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(candidate.id)}
      onKeyDown={(event) => {
        if (!onSelect) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(candidate.id);
        }
      }}
      className={[
        "relative flex w-full gap-4 rounded-[12px] bg-neutral-0 px-6 py-3 shadow-[0_0_8px_rgba(0,0,0,0.08)] outline-none",
        onSelect ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary-500" : "",
      ].join(" ")}
    >
      <img
        src={candidate.profileImageUrl || UserDefaultProfileIcon}
        alt=""
        className="size-[50px] shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
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
    </article>
  );
};