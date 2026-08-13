import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";

import { getBandMembers } from "@/api/band/bandMember";
import {
  cancelLiveReservation,
  getLiveReservation,
  updateLiveReservation,
} from "@/api/live/live";
import { uploadMediaFile } from "@/api/media/media";
import CloseIcon from "@/assets/icons/close-header.svg";
import { DatePickerSheet } from "@/components/band/home/DatePickerSheet";
import { TimePickerSheet } from "@/components/band/home/TimePickerSheet";
import { Header } from "@/components/common/Header/Header";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useCreateLiveMutation,
  useEnterLiveMutation,
} from "@/hooks/api/live/useLive";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import type { BandMemberListItem } from "@/types/band/bandMember";
import type {
  LiveApiResponse,
  LiveReservationCoHostCandidate,
  LiveReservationResponse,
} from "@/types/live/live";

import type { ActiveLive, GoLiveScreen, LiveFormMode } from "./types";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CoHostSelectionScreen } from "./components/CoHostSelectionScreen";
import {
  ChoiceCard,
  CoHostCard,
  DateTimeSelector,
  FormCard,
  LiveInfoFields,
  TestBroadcastCard,
} from "./components/LiveFormParts";
import { MicTestScreen } from "./components/MicTestScreen";

interface LiveFormProps {
  mode: LiveFormMode;
  go: GoLiveScreen;
  onCreatedLive?: (live: ActiveLive) => void;
  reservationLiveId?: number | null;
}

const INACTIVE_MEMBER_STATUS_VALUES = new Set([
  "PENDING",
  "INVITED",
  "WAITING",
  "REJECTED",
  "REMOVED",
  "DELETED",
  "WITHDRAWN",
  "CANCELED",
  "CANCELLED",
]);

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

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response?.data
    ?.message;

  if (apiMessage) return apiMessage;

  if (error instanceof Error) return error.message;

  return fallbackMessage;
};

const getUploadedMediaUrl = (uploadResult: unknown) => {
  if (typeof uploadResult === "string") {
    return uploadResult;
  }

  if (!uploadResult || typeof uploadResult !== "object") {
    return "";
  }

  const result = uploadResult as {
    url?: string;
    imageUrl?: string;
    fileUrl?: string;
    mediaUrl?: string;
    thumbnailImageUrl?: string;
    result?:
      | string
      | {
          url?: string;
          imageUrl?: string;
          fileUrl?: string;
          mediaUrl?: string;
          thumbnailImageUrl?: string;
        };
  };

  if (typeof result.result === "string") {
    return result.result;
  }

  if (result.result && typeof result.result === "object") {
    return (
      result.result.thumbnailImageUrl ??
      result.result.imageUrl ??
      result.result.fileUrl ??
      result.result.mediaUrl ??
      result.result.url ??
      ""
    );
  }

  return (
    result.thumbnailImageUrl ??
    result.imageUrl ??
    result.fileUrl ??
    result.mediaUrl ??
    result.url ??
    ""
  );
};

const getReservationThumbnailUrl = (reservation: LiveReservationResponse) => {
  return (
    reservation.thumbnailImageUrl ??
    reservation.thumbnailUrl ??
    reservation.liveThumbnailImageUrl ??
    reservation.liveThumbnailUrl ??
    reservation.imageUrl ??
    ""
  );
};

const getInitialSelectedCoHostIds = (
  candidates: LiveReservationCoHostCandidate[],
) => {
  return candidates
    .filter((candidate) => {
      return candidate.status === "APPROVED" || candidate.status === "INVITED";
    })
    .map((candidate) => candidate.bandMemberId);
};

const normalizeNumberArray = (values: number[]) => {
  return [...values].sort((left, right) => left - right);
};

const isSameNumberArray = (leftValues: number[], rightValues: number[]) => {
  const left = normalizeNumberArray(leftValues);
  const right = normalizeNumberArray(rightValues);

  if (left.length !== right.length) return false;

  return left.every((value, index) => value === right[index]);
};

const isInactiveMemberStatus = (status: string | null | undefined) => {
  if (!status) return false;

  return INACTIVE_MEMBER_STATUS_VALUES.has(status.toUpperCase());
};

const mapBandMemberToCoHostCandidate = (
  member: BandMemberListItem,
): LiveReservationCoHostCandidate | null => {
  const nickname = member.profileNickname;
  const resolvedProfileId = member.bandMemberProfileId;

  if (!member.id || !member.userId || !resolvedProfileId || !nickname) {
    return null;
  }

  if (isInactiveMemberStatus(member.status)) {
    return null;
  }

  return {
    bandMemberId: member.id,
    bandMemberProfileId: resolvedProfileId,
    bandMemberProfileImageUrl: null,
    nickname,
    part: member.part ?? member.memberType,
    status: member.owner ? "OWNER" : null,
    userId: member.userId,
  };
};

function HeaderBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로가기"
      className="absolute top-0 left-5 z-20 flex h-[52px] w-10 items-center justify-center"
    >
      <span className="block h-[18px] w-[18px] rotate-45 border-b-[2.5px] border-l-[2.5px] border-[#1D1A1A]" />
    </button>
  );
}

function HeaderCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="닫기"
      className="absolute top-0 right-5 z-20 flex h-[52px] w-10 items-center justify-center"
    >
      <img src={CloseIcon} alt="" className="size-7" />
    </button>
  );
}

export function LiveForm({
  mode,
  go,
  onCreatedLive,
  reservationLiveId,
}: LiveFormProps) {
  const activeBandId = useActiveBandId();
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [coHostLoadErrorMessage, setCoHostLoadErrorMessage] = useState("");

  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isReservationLoading, setIsReservationLoading] = useState(false);
  const [isReservationSaving, setIsReservationSaving] = useState(false);
  const [isReservationCanceling, setIsReservationCanceling] = useState(false);
  const [isCoHostLoading, setIsCoHostLoading] = useState(false);

  const [cohostCandidates, setCohostCandidates] = useState<
    LiveReservationCoHostCandidate[]
  >([]);
  const [selectedCoHostIds, setSelectedCoHostIds] = useState<number[]>([]);
  const [initialSelectedCoHostIds, setInitialSelectedCoHostIds] = useState<
    number[]
  >([]);

  const isInstant = mode === "instant";
  const isReserve = mode === "reserve";
  const isEdit = mode === "edit";
  const isReservationMode = isReserve || isEdit;

  const selectedCoHostCount = selectedCoHostIds.length;

  const hasCoHostSelectionChanged = useMemo(() => {
    return !isSameNumberArray(selectedCoHostIds, initialSelectedCoHostIds);
  }, [initialSelectedCoHostIds, selectedCoHostIds]);

  const getSubmitCoHostIds = () => {
    return selectedCoHostIds
      .map((coHostId) =>
        cohostCandidates.find(
          (candidate) => candidate.bandMemberId === coHostId,
        ),
      )
      .filter((candidate): candidate is LiveReservationCoHostCandidate => {
        if (!candidate) return false;
        if (candidate.status === "OWNER") return false;

        const submitId = candidate.userId ?? candidate.bandMemberProfileId;

        return Number.isFinite(submitId);
      })
      .map((candidate) => candidate.userId ?? candidate.bandMemberProfileId);
  };

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

  const handleOpenCoHostScreen = () => {
    setSubmitErrorMessage("");
    setIsCoHostScreenOpen(true);
  };

  const handleToggleCoHost = (bandMemberId: number) => {
    const candidate = cohostCandidates.find(
      (cohostCandidate) => cohostCandidate.bandMemberId === bandMemberId,
    );

    if (candidate?.status === "OWNER") return;

    setSelectedCoHostIds((prevIds) => {
      if (prevIds.includes(bandMemberId)) {
        return prevIds.filter((id) => id !== bandMemberId);
      }

      return [...prevIds, bandMemberId];
    });
  };

  const handleOpenDatePicker = () => {
    setIsTimePickerOpen(false);
    setIsDatePickerOpen(true);
  };

  const handleOpenTimePicker = () => {
    setIsDatePickerOpen(false);
    setIsTimePickerOpen(true);
  };

  const uploadThumbnailIfNeeded = async () => {
    if (!thumbnailImage) return savedThumbnailImageUrl;

    setIsUploadingThumbnail(true);

    try {
      const uploadResult = await uploadMediaFile({
        category: "STREAM_THUMBNAIL",
        file: thumbnailImage,
      });

      const uploadedUrl = getUploadedMediaUrl(uploadResult);

      if (!uploadedUrl) {
        throw new Error("썸네일 이미지 업로드 URL을 확인할 수 없어요.");
      }

      return uploadedUrl;
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
      const submitCoHostIds = getSubmitCoHostIds();

      const createdLive = await createLiveMutation.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        thumbnailImageUrl,
        thumbnailUrl: thumbnailImageUrl,
        scheduledAt: isReserve
          ? toCreateScheduledAt(reservedDate, reservedTime)
          : null,
        coHost: submitCoHostIds,
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
      const submitCoHostIds = getSubmitCoHostIds();

      await updateLiveReservation({
        liveId: reservationLiveId,
        request: {
          title: trimmedTitle,
          description: trimmedDescription,
          thumbnailImageUrl,
          thumbnailUrl: thumbnailImageUrl,
          scheduledAt: toUpdateScheduledAt(reservedDate, reservedTime),
          cohosts: hasCoHostSelectionChanged ? submitCoHostIds : null,
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
    if (isEdit) return;

    let isMounted = true;

    window.setTimeout(() => {
      if (!isMounted) return;
      setCoHostLoadErrorMessage("");
      setSelectedCoHostIds([]);
      setInitialSelectedCoHostIds([]);
      setCohostCandidates([]);
    }, 0);

    if (!activeBandId) {
      window.setTimeout(() => {
        if (isMounted) {
          setCoHostLoadErrorMessage("현재 선택된 밴드 정보를 찾을 수 없어요.");
        }
      }, 0);
      return;
    }

    window.setTimeout(() => {
      if (isMounted) setIsCoHostLoading(true);
    }, 0);

    getBandMembers(activeBandId)
      .then((members) => {
        if (!isMounted) return;

        const candidates = members
          .map(mapBandMemberToCoHostCandidate)
          .filter(
            (candidate): candidate is LiveReservationCoHostCandidate =>
              Boolean(candidate),
          );

        setCohostCandidates(candidates);
      })
      .catch((error) => {
        if (!isMounted) return;

        setCoHostLoadErrorMessage(
          getErrorMessage(error, "공동 진행 후보를 불러오지 못했어요."),
        );
      })
      .finally(() => {
        if (!isMounted) return;

        setIsCoHostLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeBandId, isEdit]);

  useEffect(() => {
    if (!isEdit) return;

    if (!reservationLiveId) {
      window.setTimeout(() => {
        setSubmitErrorMessage("수정할 예약 라이브 정보를 찾을 수 없어요.");
      }, 0);
      return;
    }

    let isMounted = true;

    window.setTimeout(() => {
      if (!isMounted) return;
      setIsReservationLoading(true);
      setSubmitErrorMessage("");
      setCoHostLoadErrorMessage("");
    }, 0);

    getLiveReservation(reservationLiveId)
      .then((reservation) => {
        if (!isMounted) return;

        const { date, time } = splitScheduledAt(reservation.scheduledAt);
        const candidates = reservation.cohostCandidates ?? [];
        const initialSelectedIds = getInitialSelectedCoHostIds(candidates);
        const thumbnailImageUrl = getReservationThumbnailUrl(reservation);

        setTitle(reservation.title ?? "");
        setDescription(reservation.description ?? "");
        setSavedThumbnailImageUrl(thumbnailImageUrl);
        setThumbnailPreviewUrl(thumbnailImageUrl || null);
        setThumbnailImage(null);
        setReservedDate(date);
        setReservedTime(time);
        setCohostCandidates(candidates);
        setSelectedCoHostIds(initialSelectedIds);
        setInitialSelectedCoHostIds(initialSelectedIds);
      })
      .catch((error) => {
        if (!isMounted) return;

        setSubmitErrorMessage(
          getErrorMessage(error, "라이브 예약 정보를 불러오지 못했어요."),
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
        candidates={cohostCandidates}
        selectedCoHostIds={selectedCoHostIds}
        onToggleCoHost={handleToggleCoHost}
        isLoading={isCoHostLoading}
        errorMessage={coHostLoadErrorMessage}
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
      <Header
        title={isReservationMode ? "라이브 예약 수정" : "라이브 시작"}
        showBack={false}
        variant="main"
      />
      <HeaderBackButton onClick={handleBack} />
      <HeaderCloseButton onClick={handleClose} />

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
              onDateClick={handleOpenDatePicker}
              onTimeClick={handleOpenTimePicker}
            />
          </FormCard>
        ) : null}

        <CoHostCard onClick={handleOpenCoHostScreen} />

        {isCoHostLoading ? (
          <p className="-mt-1 text-right text-caption2 text-neutral-500">
            공동 진행 후보 불러오는 중
          </p>
        ) : selectedCoHostCount > 0 ? (
          <p className="-mt-1 text-right text-caption2 text-secondary-500">
            공동 진행자 {selectedCoHostCount}명 선택됨
          </p>
        ) : null}

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

      {isDatePickerOpen ? (
        <div className="fixed inset-0 z-[100]">
          <DatePickerSheet
            open={isDatePickerOpen}
            startDate={reservedDate}
            endDate={reservedDate}
            selectionMode="single"
            onClose={() => setIsDatePickerOpen(false)}
            onSelect={({ start }) => {
              setReservedDate(start);
              setIsDatePickerOpen(false);
            }}
          />
        </div>
      ) : null}

      {isTimePickerOpen ? (
        <div className="fixed inset-0 z-[100]">
          <TimePickerSheet
            open={isTimePickerOpen}
            value={reservedTime}
            title="라이브 시작 시간"
            onClose={() => setIsTimePickerOpen(false)}
            onConfirm={(time) => {
              setReservedTime(time);
              setIsTimePickerOpen(false);
            }}
          />
        </div>
      ) : null}

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