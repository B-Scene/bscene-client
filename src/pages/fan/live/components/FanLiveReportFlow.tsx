import { useState } from "react";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CircleCheckIcon from "@/assets/icons/circle_check.svg";
import Button from "@/components/common/Button/Button";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

const REPORT_REASONS = [
  {
    title: "스팸 또는 홍보성 게시물",
    description: "의도와 관계없이 반복적인 홍보, 광고, 도배성 메시지",
  },
  {
    title: "욕설 및 혐오 표현",
    description: "특정 개인이나 집단에 대한 욕설, 비하, 혐오 표현",
  },
  {
    title: "성적으로 불쾌한 내용",
    description: "선정적이거나 성적으로 불쾌감을 주는 표현",
  },
  {
    title: "폭력적이거나 위험한 내용",
    description: "폭력, 자해, 범죄 조장 등 위험한 행동을 유도하는 내용",
  },
  {
    title: "저작권 침해",
    description: "무단으로 사용된 음원, 영상, 이미지 등 저작권 침해",
  },
  {
    title: "기타",
    description: "위 항목에 해당하지 않는 기타 문제",
  },
] as const;

interface ReportPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export function FanLiveReportPage({ onBack, onComplete }: ReportPageProps) {
  const [selectedReason, setSelectedReason] = useState(2);
  const [details, setDetails] = useState("");

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 pb-(--bottom-nav-height) text-neutral-900">
      <header className="relative flex h-12 items-center justify-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="라이브로 돌아가기"
          className="absolute left-[15px] flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
        <h1 className="text-label2">댓글 신고</h1>
      </header>

      <form
        className="fan-live-chat-scroll flex h-[calc(100%-48px)] flex-col overflow-y-auto px-5 pt-8 pb-5"
        onSubmit={(event) => {
          event.preventDefault();
          onComplete();
        }}
      >
        <section>
          <h2 className="text-body1">신고 사유 선택</h2>
          <p className="text-body5 text-neutral-600">
            허위 신고는 서비스 이용에 제한이 생길 수 있어요.
          </p>

          <fieldset className="mt-8">
            <legend className="sr-only">신고 사유</legend>
            {REPORT_REASONS.map((reason, index) => (
              <label
                key={reason.title}
                className="flex h-[54px] cursor-pointer items-center gap-4 border-b border-neutral-400"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={index}
                  checked={selectedReason === index}
                  onChange={() => setSelectedReason(index)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="relative size-6 shrink-0 rounded-full border-2 border-neutral-600 peer-checked:border-primary-400 peer-checked:after:absolute peer-checked:after:top-1/2 peer-checked:after:left-1/2 peer-checked:after:size-3 peer-checked:after:-translate-x-1/2 peer-checked:after:-translate-y-1/2 peer-checked:after:rounded-full peer-checked:after:bg-primary-400"
                />
                <span className="min-w-0">
                  <span className="block text-body1 text-neutral-900">{reason.title}</span>
                  <span className="block truncate text-body5 text-neutral-600">
                    {reason.description}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </section>

        <section className="mt-4">
          <label htmlFor="fan-live-report-details" className="block text-body1">
            자세히 적기 (선택)
          </label>
          <p className="text-body5 text-neutral-600">
            어떤 내용이 문제였는지 자세히 설명해 주세요.
          </p>
          <div className="relative mt-2 h-[100px] w-full">
            <textarea
              id="fan-live-report-details"
              value={details}
              maxLength={500}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="최대 500자까지 입력할 수 있어요."
              className="h-full w-full resize-none rounded-lg border border-neutral-400 bg-neutral-0 px-4 py-3 pb-6 text-body5 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400"
            />
            <span className="pointer-events-none absolute right-2 bottom-2 text-caption5 text-neutral-600">
              {details.length}/500
            </span>
          </div>
        </section>

        <Button type="submit" className="mt-4 w-full shrink-0">
          신고하기
        </Button>
      </form>
      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

interface ReportCompletePageProps {
  onBackToLive: () => void;
}

export function FanLiveReportCompletePage({ onBackToLive }: ReportCompletePageProps) {
  return (
    <main className="relative flex h-full flex-col items-center overflow-hidden bg-neutral-0 px-5 pb-(--bottom-nav-height) text-center text-neutral-900">
      <img
        src={CircleCheckIcon}
        alt=""
        aria-hidden="true"
        className="mt-[126px] size-[100px]"
      />

      <h1 className="mt-5 text-h1 !font-body text-neutral-900">신고가 접수됐어요</h1>
      <p className="mt-3 text-body2 text-neutral-700">
        검토 후 운영 정책에 따라
        <br />
        처리될 예정이에요
      </p>
      <p className="mt-8 w-[228px] text-caption2 text-neutral-600">
        같은 사용자의 메시지를 더 이상 보고 싶지 않다면
        <br />
        해당 사용자를 차단할 수 있어요
      </p>

      <div className="mt-6 flex w-full flex-col gap-3">
        <Button variant="outline" className="w-full" onClick={onBackToLive}>
          이 사용자 차단하기
        </Button>
        <Button className="w-full" onClick={onBackToLive}>
          라이브로 돌아가기
        </Button>
      </div>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}
