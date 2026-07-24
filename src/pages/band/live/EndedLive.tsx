import { useState } from "react";
import LoveIcon from "@/assets/icons/love.svg";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import type { GoLiveScreen } from "./types";
import { ConfirmDialog } from "./components/ConfirmDialog";

export function EndedLive({ go }: { go: GoLiveScreen }) {
  const [isReplayConfirmOpen, setIsReplayConfirmOpen] = useState(false);

  const handleReplayConfirm = () => {
    setIsReplayConfirmOpen(false);
    go("home");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900">
      <section className="px-8 pt-[118px] text-center">
        <img src={LoveIcon} alt="" className="mx-auto size-[150px] object-contain" />

        <h1 className="mt-[52px] text-h1 text-neutral-900">라이브가 종료되었어요!</h1>
        <p className="mt-3 text-body2 text-neutral-900">오늘도 팬들과 함께해줘서 고마워요</p>

        <dl className="mt-12 rounded-lg bg-neutral-0 px-7 py-2 text-body3 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
          <div className="flex h-[34px] items-center justify-between border-b border-neutral-300">
            <dt className="font-medium text-neutral-600">라이브 제목</dt>
            <dd className="font-semibold text-neutral-900">신곡 데모 첫 공개!</dd>
          </div>
          <div className="flex h-[34px] items-center justify-between border-b border-neutral-300">
            <dt className="font-medium text-neutral-600">진행 시간</dt>
            <dd className="font-semibold text-neutral-900">01 : 23 : 54</dd>
          </div>
          <div className="flex h-[34px] items-center justify-between">
            <dt className="font-medium text-neutral-600">총 청취자</dt>
            <dd className="font-semibold text-neutral-900">254명</dd>
          </div>
        </dl>

        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => go("home")}
            className="flex h-12 flex-1 items-center justify-center rounded-[10px] border border-secondary-500 bg-neutral-0 text-label2 text-secondary-500"
          >
            라이브 탭으로
          </button>

          <button
            type="button"
            onClick={() => setIsReplayConfirmOpen(true)}
            className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-label2 text-neutral-0"
          >
            다시보기 허용하기
          </button>
        </div>
      </section>

      <BottomNavBar modeOverride="band" />

      {isReplayConfirmOpen ? (
        <ConfirmDialog
          title="다시보기를 허용할까요?"
          description={"라이브를 종료한 후에도\n72시간 동안 다시 볼 수 있어요"}
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setIsReplayConfirmOpen(false)}
          onConfirm={handleReplayConfirm}
        />
      ) : null}
    </main>
  );
}