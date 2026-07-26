// src/features/session/applicationSelect/SessionApplicationSelectModal.tsx

import {
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useMySessionApplicationSummaryQuery } from "@/hooks/api/session/useSessionApplication";
import { SessionApplicationSelectCard } from "./SessionApplicationSelectCard";

interface SessionApplicationSelectModalProps {
  open: boolean;
  onClose: () => void;

  onPreviewApplication?: (
    sessionApplicationId: number,
  ) => void;

  onEditApplication?: (
    sessionApplicationId: number,
  ) => void;

  onApplyApplication: (
    sessionApplicationId: number,
    applicationTitle: string,
  ) => void;
}

export const SessionApplicationSelectModal = ({
  open,
  onClose,
  onPreviewApplication,
  onEditApplication,
  onApplyApplication,
}: SessionApplicationSelectModalProps) => {
  const summaryQuery =
    useMySessionApplicationSummaryQuery();

  const applications = useMemo(
    () =>
      summaryQuery.data?.applications ??
      [],
    [summaryQuery.data?.applications],
  );

  const [
    selectedApplicationId,
    setSelectedApplicationId,
  ] = useState<number | null>(null);

  const activeApplicationId =
    applications.some(
      (application) =>
        application.sessionApplicationId ===
        selectedApplicationId,
    )
      ? selectedApplicationId
      : applications[0]
          ?.sessionApplicationId ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  const handleBackdropMouseDown = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  const handleApply = () => {
    if (
      activeApplicationId === null
    ) {
      return;
    }

    const activeApplication =
      applications.find(
        (application) =>
          application.sessionApplicationId ===
          activeApplicationId,
      );

    onApplyApplication(
      activeApplicationId,
      activeApplication?.title || "기본",
    );
  };

  const handlePreview = (
    sessionApplicationId: number,
  ) => {
    onPreviewApplication?.(
      sessionApplicationId,
    );
  };

  const handleEdit = (
    sessionApplicationId: number,
  ) => {
    onEditApplication?.(
      sessionApplicationId,
    );
  };

  if (
    !open ||
    typeof document === "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={
        handleBackdropMouseDown
      }
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-select-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="flex max-h-[calc(100dvh-48px)] w-full max-w-[354px] flex-col overflow-hidden rounded-[16px] bg-neutral-0 px-[15px] pt-6 pb-4 shadow-[0_0_8px_rgba(0,0,0,0.1)]"
      >
        <header className="shrink-0">
          <h2
            id="application-select-title"
            className="text-label1 text-neutral-900"
          >
            지원서 선택
          </h2>

          <p className="mt-1 text-caption2 text-neutral-600">
            지원할 지원서를 고르면 아래에
            전체 내용이 표시돼요
            <br />
            선택 즉시 지원이 완료돼요
          </p>
        </header>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {summaryQuery.isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center text-caption2 text-neutral-500">
              지원서를 불러오고 있어요
            </div>
          ) : summaryQuery.isError ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center">
              <p className="text-caption2 text-neutral-500">
                지원서를 불러오지
                못했어요
              </p>

              <button
                type="button"
                onClick={() =>
                  summaryQuery.refetch()
                }
                className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
              >
                다시 시도
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <strong className="text-body1 text-neutral-900">
                등록된 지원서가 없어요
              </strong>

              <p className="mt-2 text-caption2 text-neutral-600">
                지원서를 먼저 작성한 후
                <br />
                모집 공고에 지원해주세요
              </p>
            </div>
          ) : (
            <div
              role="radiogroup"
              aria-label="지원서 선택"
              className="flex flex-col gap-3"
            >
              {applications.map((application) => (
                <SessionApplicationSelectCard
                  key={application.sessionApplicationId}
                  application={application}
                  selected={
                    activeApplicationId ===
                    application.sessionApplicationId
                  }
                  onSelect={setSelectedApplicationId}
                  onPreview={
                    onPreviewApplication
                      ? handlePreview
                      : undefined
                  }
                  onEdit={
                    onEditApplication
                      ? handleEdit
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        <footer className="mt-4 grid shrink-0 grid-cols-2 gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 items-center justify-center rounded-[8px] border border-secondary-500 bg-neutral-0 text-caption3 text-secondary-500"
          >
            취소
          </button>

          <button
            type="button"
            disabled={
              activeApplicationId ===
              null
            }
            onClick={handleApply}
            className="flex h-10 items-center justify-center rounded-[8px] bg-secondary-500 text-caption3 text-neutral-0 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            선택한 지원서로 지원
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
};
