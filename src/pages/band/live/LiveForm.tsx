import { BottomNavBar } from "@/components/layout/BottomNavBar";
import type { GoLiveScreen, LiveFormMode } from "./types";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { TopBar } from "./components/TopBar";
import {
  ChoiceCard,
  CoHostCard,
  DateTimeSelector,
  FormCard,
  LiveInfoFields,
  TestBroadcastCard,
} from "./components/LiveFormParts";

interface LiveFormProps {
  mode: LiveFormMode;
  go: GoLiveScreen;
  showCancelDialog?: boolean;
}

export function LiveForm({
  mode,
  go,
  showCancelDialog = false,
}: LiveFormProps) {
  const isReserve = mode === "reserve";
  const isEdit = mode === "edit";
  const isReservationMode = isReserve || isEdit;

  return (
    <main className="relative min-h-dvh bg-secondary-0 pb-[calc(var(--bottom-nav-height)+32px)] text-neutral-900">
      <TopBar
        title={isReservationMode ? "라이브 예약 편집" : "라이브 시작"}
        onBack={() => (isReservationMode ? go("cancelConfirm") : go("home"))}
        onClose={isReservationMode ? undefined : () => go("home")}
      />

      <div className="grid gap-3 px-5 pt-3 pb-6">
        {!isEdit ? (
          <FormCard title="라이브 시간 설정">
            <div className="flex gap-5">
              <ChoiceCard
                selected={!isReserve}
                title="지금 바로 시작"
                description="즉시 라이브를 시작합니다"
                onClick={() => go("instantForm")}
              />
              <ChoiceCard
                selected={isReserve}
                title="예약 설정"
                description={"원하는 시간에\n라이브를 시작합니다"}
                onClick={() => go("reserveForm")}
              />
            </div>
          </FormCard>
        ) : null}

        <FormCard title="라이브 정보">
          <LiveInfoFields />
        </FormCard>

        {isReserve || isEdit ? (
          <FormCard title="예약 일시 설정">
            <DateTimeSelector />
          </FormCard>
        ) : null}

        <CoHostCard />
        {!isReserve && !isEdit ? <TestBroadcastCard /> : null}

        {isEdit ? (
          <div className="mt-4 flex gap-5">
            <button
              type="button"
              onClick={() => go("home")}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-label2 text-neutral-0"
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => go("cancelConfirm")}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] border border-secondary-500 bg-neutral-0 text-label2 text-secondary-500"
            >
              예약 취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (isReserve ? go("home") : go("room"))}
            className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-secondary-500 text-label1 text-neutral-0"
          >
            {isReserve ? "라이브 예약하기" : "라이브 시작하기"}
          </button>
        )}
      </div>

      <BottomNavBar modeOverride="band" />

      {showCancelDialog ? (
        <ConfirmDialog
          title="예약을 취소할까요?"
          description="취소된 라이브 예약은 복구할 수 없어요"
          cancelLabel="돌아가기"
          confirmLabel="예약 취소"
          onCancel={() => go("editForm")}
          onConfirm={() => go("home")}
        />
      ) : null}
    </main>
  );
}

export function CancelConfirm({ go }: { go: GoLiveScreen }) {
  return <LiveForm mode="edit" go={go} showCancelDialog />;
}
