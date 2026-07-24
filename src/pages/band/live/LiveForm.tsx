import { useState } from "react";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import type { GoLiveScreen, LiveFormMode } from "./types";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CoHostSelectionScreen } from "./components/CoHostSelectionScreen";
import { MicTestScreen } from "./components/MicTestScreen";
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
}

export function LiveForm({ mode, go }: LiveFormProps) {
  const [isCoHostScreenOpen, setIsCoHostScreenOpen] = useState(false);
  const [isMicTestScreenOpen, setIsMicTestScreenOpen] = useState(false);
  const [isEditCancelDialogOpen, setIsEditCancelDialogOpen] = useState(false);
  const [isReservationCancelDialogOpen, setIsReservationCancelDialogOpen] =
    useState(false);

  const [reservedDate, setReservedDate] = useState("2026-05-24");
  const [reservedTime, setReservedTime] = useState("20:00");

  const isInstant = mode === "instant";
  const isReserve = mode === "reserve";
  const isEdit = mode === "edit";
  const isReservationMode = isReserve || isEdit;

  const handleBack = () => {
    if (isReservationMode) {
      setIsEditCancelDialogOpen(true);
      return;
    }

    go("home");
  };

  const handleClose = () => {
    if (isReservationMode) {
      setIsEditCancelDialogOpen(true);
      return;
    }

    go("home");
  };

  const handleSaveReservation = () => {
    go("home");
  };

  const handleEditCancelConfirm = () => {
    setIsEditCancelDialogOpen(false);
    go("home");
  };

  const handleReservationCancelConfirm = () => {
    setIsReservationCancelDialogOpen(false);
    go("home");
  };

  if (isCoHostScreenOpen) {
    return (
      <CoHostSelectionScreen
        onBack={() => setIsCoHostScreenOpen(false)}
        onClose={() => setIsCoHostScreenOpen(false)}
      />
    );
  }

  if (isMicTestScreenOpen) {
    return (
      <MicTestScreen
        onBack={() => setIsMicTestScreenOpen(false)}
        onClose={() => setIsMicTestScreenOpen(false)}
        onComplete={() => setIsMicTestScreenOpen(false)}
      />
    );
  }

  return (
    <main className="relative min-h-dvh bg-secondary-0 pb-[calc(var(--bottom-nav-height)+32px)] text-neutral-900">
      <TopBar
        title={isReservationMode ? "라이브 예약 수정" : "라이브 시작"}
        onBack={handleBack}
        onClose={handleClose}
      />

      <div className="grid gap-3 px-5 pt-3 pb-6">
        {!isEdit ? (
          <FormCard title="라이브 시간 설정">
            <div className="flex gap-5">
              <ChoiceCard
                selected={isInstant}
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

        {isReservationMode ? (
          <FormCard title="예약 일시 설정">
            <DateTimeSelector
              date={reservedDate}
              time={reservedTime}
              onDateChange={setReservedDate}
              onTimeChange={setReservedTime}
            />
          </FormCard>
        ) : null}

        <CoHostCard onClick={() => setIsCoHostScreenOpen(true)} />

        {isInstant ? (
          <TestBroadcastCard onClick={() => setIsMicTestScreenOpen(true)} />
        ) : null}

        {isReservationMode ? (
          <div className="mt-4 flex gap-5">
            <button
              type="button"
              onClick={handleSaveReservation}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-label2 text-neutral-0"
            >
              저장
            </button>

            <button
              type="button"
              onClick={() => setIsReservationCancelDialogOpen(true)}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] border border-secondary-500 bg-neutral-0 text-label2 text-secondary-500"
            >
              예약 취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => go("room")}
            className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-secondary-500 text-label1 text-neutral-0"
          >
            라이브 시작하기
          </button>
        )}
      </div>

      <BottomNavBar modeOverride="band" />

      {isReservationCancelDialogOpen ? (
        <ConfirmDialog
          title="예약을 취소할까요?"
          description={"취소된 라이브 예약은\n복구할 수 없어요"}
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setIsReservationCancelDialogOpen(false)}
          onConfirm={handleReservationCancelConfirm}
        />
      ) : null}

      {isEditCancelDialogOpen ? (
        <ConfirmDialog
          title="수정을 취소할까요?"
          description={"저장하지 않은 변경 사항은\n모두 사라집니다"}
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setIsEditCancelDialogOpen(false)}
          onConfirm={handleEditCancelConfirm}
        />
      ) : null}
    </main>
  );
}

export function CancelConfirm({ go }: { go: GoLiveScreen }) {
  return <LiveForm mode="edit" go={go} />;
}