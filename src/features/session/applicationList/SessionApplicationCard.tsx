// src/features/session/applicationList/SessionApplicationCard.tsx

import { ToggleSwitch } from "@/components/band/my/ToggleSwitch";

import type { ApplicationCardItem } from "@/features/session/applicationList/sessionApplicationList.types";

interface SessionApplicationCardProps {
  application: ApplicationCardItem;
  visibilityDisabled?: boolean;

  onView: (
    application: ApplicationCardItem,
  ) => void;

  onEdit: (
    application: ApplicationCardItem,
  ) => void;

  onDelete: (
    application: ApplicationCardItem,
  ) => void;

  onToggleVisibility: (
    application: ApplicationCardItem,
    checked: boolean,
  ) => void;
}

export const SessionApplicationCard = ({
  application,
  visibilityDisabled = false,
  onView,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SessionApplicationCardProps) => {
  return (
    <article className="flex w-full flex-col gap-[10px] rounded-[12px] bg-neutral-0 px-6 py-3 shadow-[0_0_8px_rgba(0,0,0,0.10)]">
      <div className="flex min-h-6 items-center justify-between gap-4">
        <p className="min-w-0 truncate text-caption3 text-neutral-500">
          {formatDisplayDate(
            application.displayDate,
          )}
        </p>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-caption3 text-neutral-700">
            이력서 공개
          </span>

          <div
            className={
              visibilityDisabled
                ? "pointer-events-none opacity-50"
                : ""
            }
          >
            <ToggleSwitch
              checked={application.isPublic}
              label={
                application.isPublic
                  ? "이력서 공개 끄기"
                  : "이력서 공개 켜기"
              }
              onChange={(checked) =>
                onToggleVisibility(
                  application,
                  checked,
                )
              }
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={`${application.purpose} 지원서 상세보기`}
        onClick={() => onView(application)}
        className="w-full text-left"
      >
        <h3 className="break-words text-label1 text-neutral-900">
          <span className="text-secondary-500">
            [{application.title}]
          </span>{" "}
          {application.purpose}
        </h3>
      </button>

      <div className="flex gap-7">
        <button
          type="button"
          onClick={() => onEdit(application)}
          className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-[5px] bg-secondary-0 text-caption3 text-neutral-600"
        >
          수정
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(application)
          }
          className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-[5px] bg-neutral-300 text-caption3 text-neutral-600"
        >
          삭제
        </button>
      </div>
    </article>
  );
};

const formatDisplayDate = (
  value: string,
) => {
  if (!value) {
    return "";
  }

  if (
    value.includes("작성") ||
    value.includes("수정")
  ) {
    return value;
  }

  if (value.includes("T")) {
    return `${value.slice(0, 10)} 작성`;
  }

  return value;
};