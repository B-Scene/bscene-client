import CheckApproveIcon from "@/assets/icons/band/check-approve.svg";
import CheckCircleYellowIcon from "@/assets/icons/band/check-circle-yellow.svg";
import type { SessionApplicationSummaryItem } from "@/types/session/sessionApplication";

interface SessionApplicationSelectCardProps {
  application: SessionApplicationSummaryItem;
  selected: boolean;
  onSelect: (applicationId: number) => void;
  onPreview?: (applicationId: number) => void;
  onEdit?: (applicationId: number) => void;
}

export const SessionApplicationSelectCard = ({
  application,
  selected,
  onSelect,
  onPreview,
  onEdit,
}: SessionApplicationSelectCardProps) => {
  const applicationId = application.sessionApplicationId;

  return (
    <article
      className={`rounded-[12px] border bg-neutral-0 px-[15px] py-3 ${
        selected ? "border-secondary-500" : "border-neutral-400"
      }`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => onSelect(applicationId)}
        className="block w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <time className="text-caption3 text-neutral-500">
            {formatApplicationDate(application.displayDate)}
          </time>

          <img
            src={selected ? CheckCircleYellowIcon : CheckApproveIcon}
            alt=""
            className="size-5 shrink-0"
          />
        </div>

        <h3 className="mt-[10px] truncate text-label1">
          <span className="text-secondary-500">
            [{application.title || "기본"}]
          </span>
          <span className="ml-1 text-neutral-900">
            {application.purpose || "드럼 세션 지원합니다"}
          </span>
        </h3>
      </button>

      {onPreview || onEdit ? (
        <div
          className={`mt-3 grid gap-[14px] ${
            onPreview && onEdit ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {onPreview ? (
            <button
              type="button"
              onClick={() => onPreview(applicationId)}
              className="flex h-[30px] items-center justify-center rounded-[5px] bg-secondary-0 text-caption3 text-neutral-600"
            >
              미리보기
            </button>
          ) : null}

          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(applicationId)}
              className="flex h-[30px] items-center justify-center rounded-[5px] bg-neutral-300 text-caption3 text-neutral-600"
            >
              수정하기
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

const formatApplicationDate = (value?: string) => {
  if (!value) return "";

  const dateValue = value.includes("T")
    ? value.split("T")[0]
    : value.slice(0, 10);

  return `${dateValue} 수정`;
};
