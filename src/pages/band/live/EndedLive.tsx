import LoveIcon from "@/assets/icons/love.svg";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import type { GoLiveScreen } from "./types";

export function EndedLive({ go }: { go: GoLiveScreen }) {
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

        <button
          type="button"
          onClick={() => go("home")}
          className="mt-8 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-secondary-500 text-label1 text-neutral-0"
        >
          라이브 탭으로 돌아가기
        </button>
      </section>
      <BottomNavBar modeOverride="band" />
    </main>
  );
}
