import CloseIcon from "@/assets/icons/close-header.svg";
import type { LiveReservationCoHostCandidate } from "@/types/live/live";

import { ProfileImage } from "./ProfileImage";

interface CoHostSelectionScreenProps {
  onBack: () => void;
  onClose: () => void;
  candidates: LiveReservationCoHostCandidate[];
  selectedCoHostIds: number[];
  onToggleCoHost: (bandMemberId: number) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

const PART_LABELS: Record<string, string> = {
  VOCAL: "보컬",
  GUITAR: "기타",
  BASS: "베이스",
  DRUM: "드럼",
  KEYBOARD: "키보드",
  SESSION: "세션",
  MEMBER: "멤버",
  ETC: "기타",
};

const getPartLabel = (part?: string | null) => {
  if (!part) return "멤버";

  return PART_LABELS[part.toUpperCase()] ?? part;
};

const isOwnerCandidate = (candidate: LiveReservationCoHostCandidate) => {
  return candidate.status === "OWNER";
};

function HeaderBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로가기"
      className="absolute top-0 left-5 z-20 flex h-[52px] w-10 items-center justify-center"
    >
      <span className="block h-[18px] w-[18px] rotate-45 border-b-[2.5px] border-l-[2.5px] border-[#1D1A1A]" />
    </button>
  );
}

function HeaderCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="닫기"
      className="absolute top-0 right-5 z-20 flex h-[52px] w-10 items-center justify-center"
    >
      <img src={CloseIcon} alt="" className="size-7" />
    </button>
  );
}

function CoHostCandidateCard({
  candidate,
  selected,
  onToggle,
}: {
  candidate: LiveReservationCoHostCandidate;
  selected: boolean;
  onToggle: () => void;
}) {
  const isOwner = isOwnerCandidate(candidate);

  return (
    <article className="flex h-[60px] items-center rounded-[8px] bg-neutral-0 px-3 shadow-[0_0_8px_rgba(20,20,20,0.08)]">
      <ProfileImage
        size="sm"
        src={candidate.bandMemberProfileImageUrl ?? undefined}
      />

      <div className="ml-3 min-w-0 flex-1">
        <strong className="block truncate text-body3 font-semibold text-neutral-900">
          {candidate.nickname}
        </strong>

        <span className="mt-0.5 block truncate text-caption2 text-neutral-600">
          {getPartLabel(candidate.part)}
        </span>
      </div>

      {isOwner ? (
        <span className="shrink-0 text-body3 font-semibold text-neutral-900">
          진행자
        </span>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={`shrink-0 text-body3 font-semibold ${
            selected ? "text-secondary-600" : "text-secondary-500"
          }`}
        >
          {selected ? "초대됨" : "초대"}
        </button>
      )}
    </article>
  );
}

export function CoHostSelectionScreen({
  onBack,
  onClose,
  candidates,
  selectedCoHostIds,
  onToggleCoHost,
  isLoading = false,
  errorMessage = "",
}: CoHostSelectionScreenProps) {
  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(env(safe-area-inset-bottom)+104px)] text-neutral-900">
      <header className="relative flex h-[52px] items-center justify-center">
        <HeaderBackButton onClick={onBack} />

        <h1 className="text-h4 font-bold text-neutral-900">공동 진행</h1>

        <HeaderCloseButton onClick={onClose} />
      </header>

      <section className="px-7 pt-9">
        {isLoading ? (
          <p className="py-10 text-center text-caption2 text-neutral-500">
            공동 진행자를 불러오는 중이에요.
          </p>
        ) : null}

        {!isLoading && errorMessage ? (
          <p className="py-10 text-center text-caption2 text-error">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage && candidates.length === 0 ? (
          <p className="py-10 text-center text-caption2 text-neutral-500">
            초대할 수 있는 공동 진행자가 없어요.
          </p>
        ) : null}

        {!isLoading && !errorMessage && candidates.length > 0 ? (
          <div className="grid gap-4">
            {candidates.map((candidate) => {
              const selected = selectedCoHostIds.includes(
                candidate.bandMemberId,
              );

              return (
                <CoHostCandidateCard
                  key={candidate.bandMemberId}
                  candidate={candidate}
                  selected={selected}
                  onToggle={() => onToggleCoHost(candidate.bandMemberId)}
                />
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="fixed right-0 bottom-0 left-0 z-30 mx-auto w-full max-w-[393px] bg-neutral-0 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+20px)]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-[52px] w-full items-center justify-center rounded-[10px] bg-secondary-500 text-label1 font-semibold text-neutral-0 shadow-[0_4px_12px_rgba(251,177,14,0.24)]"
        >
          확인
        </button>
      </div>
    </main>
  );
}