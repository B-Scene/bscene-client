// src/pages/band/session/components/SessionApplicationCompletePage.tsx

import CheckCircleCompleteIcon from "@/assets/icons/band/check-circle-complete.svg";

interface SessionApplicationCompletePageProps {
  recruitmentTitle: string;
  bandName: string;
  applicationTitle: string;
  onSendMessage: () => void;
  onViewApplication: () => void;
  onGoToSessionHome: () => void;
}

export const SessionApplicationCompletePage = ({
  recruitmentTitle,
  bandName,
  applicationTitle,
  onSendMessage,
  onViewApplication,
  onGoToSessionHome,
}: SessionApplicationCompletePageProps) => {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0 pb-[var(--bottom-nav-height)]">
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-10">
        <img
          src={CheckCircleCompleteIcon}
          alt=""
          className="size-[100px] shrink-0"
        />

        <h1 className="mt-8 text-center text-h2 text-neutral-900">
          지원이 완료되었어요
        </h1>

        <p className="mt-3 text-center text-body2 text-neutral-600">
          선택한 지원서가 밴드에게
          전달됐어요
          <br />
          추가 대화는 쪽지로 이어갈 수
          있어요
        </p>

        <section className="mt-8 w-full max-w-[330px] rounded-[8px] bg-neutral-0 p-4 shadow-[0_0_8px_rgba(0,0,0,0.1)]">
          <CompleteInfoRow
            label="공고 제목"
            value={
              recruitmentTitle
            }
          />

          <CompleteInfoRow
            label="밴드"
            value={bandName}
          />

          <CompleteInfoRow
            label="지원서"
            value={
              applicationTitle ||
              "기본"
            }
            isLast
          />
        </section>

        <div className="mt-5 grid w-full max-w-[330px] grid-cols-2 gap-[18px]">
          <button
            type="button"
            onClick={onSendMessage}
            className="flex h-12 min-w-0 items-center justify-center rounded-[10px] border-[1.5px] border-secondary-500 bg-neutral-0 text-body6 text-secondary-500"
          >
            쪽지 보내기
          </button>

          <button
            type="button"
            onClick={
              onViewApplication
            }
            className="flex h-12 min-w-0 items-center justify-center rounded-[10px] bg-secondary-400 text-body6 text-neutral-0"
          >
            지원서 보기
          </button>
        </div>

        <button
          type="button"
          onClick={onGoToSessionHome}
          className="mt-5 text-caption2 text-neutral-600 underline underline-offset-[3px]"
        >
          세션 홈으로
        </button>
      </section>
    </main>
  );
};

interface CompleteInfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const CompleteInfoRow = ({
  label,
  value,
  isLast = false,
}: CompleteInfoRowProps) => {
  return (
    <div
      className={`flex min-h-8 items-center justify-between gap-4 ${
        isLast
          ? ""
          : "border-b border-neutral-300"
      }`}
    >
      <span className="shrink-0 text-caption2 text-neutral-700">
        {label}
      </span>

      <strong className="min-w-0 truncate text-right text-caption3 text-neutral-900">
        {value}
      </strong>
    </div>
  );
};
