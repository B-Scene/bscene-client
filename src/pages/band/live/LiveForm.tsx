import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useCreateLiveMutation,
  useEnterLiveMutation,
} from "@/hooks/api/live/useLive";
import {
  cancelLiveReservation,
  getLiveReservation,
  updateLiveReservation,
} from "@/api/live/live";
import { uploadMediaFile } from "@/api/media/media";
import type { LiveApiResponse } from "@/types/live/live";
import type { ActiveLive, GoLiveScreen, LiveFormMode } from "./types";
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
  onCreatedLive?: (live: ActiveLive) => void;
  reservationLiveId?: number | null;
}

const toCreateScheduledAt = (date: string, time: string) => {
  return `${date}T${time}:00`;
};

const toUpdateScheduledAt = (date: string, time: string) => {
  return `${date} ${time}`;
};

const getTomorrowDateString = () => {
  const date = new Date();

  date.setDate(date.getDate() + 1);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const splitScheduledAt = (scheduledAt?: string | null) => {
  if (!scheduledAt) {
    return {
      date: getTomorrowDateString(),
      time: "20:00",
    };
  }

  const normalizedValue = scheduledAt.replace("T", " ");
  const [dateValue, timeValue = "20:00"] = normalizedValue.split(" ");

  return {
    date: dateValue,
    time: timeValue.slice(0, 5),
  };
};

const getErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response?.data
    ?.message;

  if (apiMessage) return apiMessage;

  if (error instanceof Error) return error.message;

  return fallbackMessage;
};

export function LiveForm({
  mode,
  go,
  onCreatedLive,
  reservationLiveId,
}: LiveFormProps) {
  const createLiveMutation = useCreateLiveMutation();
  const enterLiveMutation = useEnterLiveMutation();

  const [isCoHostScreenOpen, setIsCoHostScreenOpen] = useState(false);
  const [isMicTestScreenOpen, setIsMicTestScreenOpen] = useState(false);
  const [isEditCancelDialogOpen, setIsEditCancelDialogOpen] = useState(false);
  const [isReservationCancelDialogOpen, setIsReservationCancelDialogOpen] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null,
  );
  const [savedThumbnailImageUrl, setSavedThumbnailImageUrl] = useState("");

  const [reservedDate, setReservedDate] = useState(getTomorrowDateString);
  const [reservedTime, setReservedTime] = useState("20:00");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isReservationLoading, setIsReservationLoading] = useState(false);
  const [isReservationSaving, setIsReservationSaving] = useState(false);
  const [isReservationCanceling, setIsReservationCanceling] = useState(false);

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

  const handleThumbnailChange = (file: File) => {
    setThumbnailImage(file);

    setThumbnailPreviewUrl((prevUrl) => {
      if (prevUrl && prevUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prevUrl);
      }

      return URL.createObjectURL(file);
    });
  };

  const uploadThumbnailIfNeeded = async () => {
    if (!thumbnailImage) return savedThumbnailImageUrl;

    setIsUploadingThumbnail(true);

    try {
      return await uploadMediaFile({
        category: "STREAM_THUMBNAIL",
        file: thumbnailImage,
      });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleCreateLive = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    setSubmitErrorMessage("");

    if (!trimmedTitle) {
      setSubmitErrorMessage("라이브 제목을 입력해주세요.");
      return;
    }

    try {
      const thumbnailImageUrl = await uploadThumbnailIfNeeded();

      const createdLive = await createLiveMutation.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        thumbnailImageUrl,
        scheduledAt: isReserve
          ? toCreateScheduledAt(reservedDate, reservedTime)
          : null,
        coHost: [],
      });

      if (isReserve) {
        go("home");
        return;
      }

      const enteredLive = await enterLiveMutation.mutateAsync(
        createdLive.audioStreamId,
      );

      onCreatedLive?.(enteredLive);
      go("room");
    } catch (error) {
      setSubmitErrorMessage(
        getErrorMessage(
          error,
          "라이브 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSaveReservation = async () => {
    if (!reservationLiveId) {
      setSubmitErrorMessage("수정할 예약 라이브 정보를 찾을 수 없어요.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    setSubmitErrorMessage("");

    if (!trimmedTitle) {
      setSubmitErrorMessage("라이브 제목을 입력해주세요.");
      return;
    }

    setIsReservationSaving(true);

    try {
      const thumbnailImageUrl = await uploadThumbnailIfNeeded();

      await updateLiveReservation({
        liveId: reservationLiveId,
        request: {
          title: trimmedTitle,
          description: trimmedDescription,
          thumbnailImageUrl,
          scheduledAt: toUpdateScheduledAt(reservedDate, reservedTime),
          cohosts: null,
        },
      });

      go("home");
    } catch (error) {
      setSubmitErrorMessage(
        getErrorMessage(
          error,
          "라이브 예약 수정에 실패했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    } finally {
      setIsReservationSaving(false);
      setIsUploadingThumbnail(false);
    }
  };

  const handleEditCancelConfirm = () => {
    setIsEditCancelDialogOpen(false);
    go("home");
  };

  const handleReservationCancelConfirm = async () => {
    if (!isEdit || !reservationLiveId) {
      setIsReservationCancelDialogOpen(false);
      go("home");
      return;
    }

    setIsReservationCanceling(true);
    setSubmitErrorMessage("");

    try {
      await cancelLiveReservation(reservationLiveId);

      setIsReservationCancelDialogOpen(false);
      go("home");
    } catch (error) {
      setSubmitErrorMessage(
        getErrorMessage(
          error,
          "라이브 예약 취소에 실패했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
      setIsReservationCancelDialogOpen(false);
    } finally {
      setIsReservationCanceling(false);
    }
  };

  useEffect(() => {
    if (!isEdit) return;

    if (!reservationLiveId) {
      setSubmitErrorMessage("수정할 예약 라이브 정보를 찾을 수 없어요.");
      return;
    }

    let isMounted = true;

    setIsReservationLoading(true);
    setSubmitErrorMessage("");

    getLiveReservation(reservationLiveId)
      .then((reservation) => {
        if (!isMounted) return;

        const { date, time } = splitScheduledAt(reservation.scheduledAt);

        setTitle(reservation.title ?? "");
        setDescription(reservation.description ?? "");
        setSavedThumbnailImageUrl(reservation.thumbnailImageUrl ?? "");
        setThumbnailPreviewUrl(reservation.thumbnailImageUrl ?? null);
        setThumbnailImage(null);
        setReservedDate(date);
        setReservedTime(time);
      })
      .catch((error) => {
        if (!isMounted) return;

        setSubmitErrorMessage(
          getErrorMessage(
            error,
            "라이브 예약 정보를 불러오지 못했어요.",
          ),
        );
      })
      .finally(() => {
        if (!isMounted) return;

        setIsReservationLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isEdit, reservationLiveId]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

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

  const isSubmitting =
    isUploadingThumbnail ||
    isReservationLoading ||
    isReservationSaving ||
    isReservationCanceling ||
    createLiveMutation.isPending ||
    enterLiveMutation.isPending;

  const submitLabel = (() => {
    if (isReservationLoading) return "불러오는 중";
    if (isUploadingThumbnail) return "이미지 업로드 중";
    if (isReservationSaving) return "저장 중";
    if (isReservationCanceling) return "취소 중";
    if (createLiveMutation.isPending || enterLiveMutation.isPending) {
      return isReservationMode ? "저장 중" : "라이브 준비 중";
    }
    if (isReservationMode) return "저장";
    return "라이브 시작하기";
  })();

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
          <LiveInfoFields
            title={title}
            description={description}
            thumbnailPreviewUrl={thumbnailPreviewUrl}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onThumbnailChange={handleThumbnailChange}
          />
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

        {submitErrorMessage ? (
          <p className="text-center text-caption2 text-error">
            {submitErrorMessage}
          </p>
        ) : null}

        {isReservationMode ? (
          <div className="mt-4 flex gap-5">
            <button
              type="button"
              onClick={isEdit ? handleSaveReservation : handleCreateLive}
              disabled={isSubmitting}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-label2 text-neutral-0 disabled:opacity-60"
            >
              {submitLabel}
            </button>

            <button
              type="button"
              onClick={() => setIsReservationCancelDialogOpen(true)}
              disabled={isSubmitting}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] border border-secondary-500 bg-neutral-0 text-label2 text-secondary-500 disabled:opacity-60"
            >
              예약 취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCreateLive}
            disabled={isSubmitting}
            className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-secondary-500 text-label1 text-neutral-0 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        )}
      </div>

      <BottomNavBar modeOverride="band" />

      {isReservationCancelDialogOpen ? (
        <ConfirmDialog
          title="예약을 취소할까요?"
          description={"취소된 라이브 예약은\n복구할 수 없어요"}
          cancelLabel="취소"
          confirmLabel={isReservationCanceling ? "취소 중" : "확인"}
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