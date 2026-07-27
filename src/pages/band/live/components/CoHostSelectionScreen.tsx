import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import type {
  LiveReservationCoHostCandidate,
  LiveReservationCoHostStatus,
} from "@/types/live/live";
import { TopBar } from "./TopBar";

interface CoHostSelectionScreenProps {
  onBack: () => void;
  onClose: () => void;
  candidates: LiveReservationCoHostCandidate[];
  selectedCoHostIds: number[];
  onToggleCoHost: (bandMemberId: number) => void;
}

const STATUS_LABELS: Record<Exclude<LiveReservationCoHostStatus, null>, string> = {
  OWNER: "진행자",
  APPROVED: "선택됨",
  INVITED: "초대 중",
  REJECTED: "재초대",
};

const PART_LABELS: Record<string, string> = {
  VOCAL: "보컬",
  GUITAR: "기타",
  BASS: "베이스",
  DRUM: "드럼",
  KEYBOARD: "키보드",
};

const getPartLabel = (part: string) => {
  return PART_LABELS[part] ?? part;
};

const getButtonLabel = ({
  status,
  isSelected,
}: {
  status: LiveReservationCoHostStatus;
  isSelected: boolean;
}) => {
  if (status === "OWNER") return STATUS_LABELS.OWNER;
  if (isSelected && status === "INVITED") return STATUS_LABELS.INVITED;
  if (isSelected) return "선택됨";
  if (status === "REJECTED") return STATUS_LABELS.REJECTED;

  return "초대";
};

const getButtonClassName = ({
  status,
  isSelected,
}: {
  status: LiveReservationCoHostStatus;
  isSelected: boolean;
}) => {
  if (status === "OWNER") {
    return "shrink-0 text-body2 font-semibold text-neutral-900";
  }

  if (isSelected) {
    return "shrink-0 rounded-full bg-secondary-0 px-3 py-1 text-body2 font-semibold text-secondary-600";
  }

  if (status === "REJECTED") {
    return "shrink-0 text-body2 font-semibold text-error";
  }

  return "shrink-0 text-body2 font-semibold text-secondary-500";
};

export function CoHostSelectionScreen({
  onBack,
  onClose,
  candidates,
  selectedCoHostIds,
  onToggleCoHost,
}: CoHostSelectionScreenProps) {
  return (
    <main className="min-h-dvh bg-neutral-0 text-neutral-900">
      <TopBar title="공동 진행" onBack={onBack} onClose={onClose} />

      <section className="px-9 pt-6 pb-8">
        {candidates.length === 0 ? (
          <div className="rounded-[14px] bg-secondary-0 px-5 py-8 text-center shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
            <p className="text-body3 text-neutral-700">
              공동 진행자로 초대할 수 있는 멤버가 없어요.
            </p>
            <p className="mt-2 text-caption2 text-neutral-500">
              예약 수정 화면에서는 기존 후보 목록을 불러올 수 있어요.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((candidate) => {
              const isHost = candidate.status === "OWNER";
              const isSelected = selectedCoHostIds.includes(
                candidate.bandMemberId,
              );

              return (
                <article
                  key={`${candidate.bandMemberId}-${candidate.bandMemberProfileId}`}
                  className="flex items-center rounded-[14px] bg-neutral-0 px-5 py-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]"
                >
                  <img
                    src={
                      candidate.bandMemberProfileImageUrl ??
                      UserDefaultProfileIcon
                    }
                    alt=""
                    className="size-12 shrink-0 rounded-full object-cover"
                  />

                  <div className="ml-4 min-w-0 flex-1">
                    <strong className="block truncate text-body1 font-semibold text-neutral-900">
                      {candidate.nickname}
                    </strong>
                    <p className="mt-1 text-caption2 text-neutral-600">
                      {getPartLabel(candidate.part)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isHost}
                    onClick={() => onToggleCoHost(candidate.bandMemberId)}
                    className={getButtonClassName({
                      status: candidate.status,
                      isSelected,
                    })}
                  >
                    {getButtonLabel({
                      status: candidate.status,
                      isSelected,
                    })}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}