import { useState, type ChangeEvent } from "react";
import type { AxiosError } from "axios";

import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  DEFAULT_RECRUITMENT_BASIC_VALUES,
  DEFAULT_RECRUITMENT_DETAIL_VALUES,
  RECRUITMENT_GENRE_OPTIONS,
  RECRUITMENT_REGION_OPTIONS,
} from "@/features/session/recruitmentForm/sessionRecruitmentForm.constants";
import type {
  BasicFormValues,
  DetailFormValues,
  FormErrors,
  FormMode,
  FormStep,
  SelectBottomSheetType,
} from "@/features/session/recruitmentForm/sessionRecruitmentForm.types";
import {
  isFutureRecruitmentDeadline,
  splitRecruitmentDeadlineAt,
  toRecruitmentDeadlineAt,
} from "@/features/session/recruitmentForm/sessionRecruitmentForm.utils";
import {
  RecruitmentFormTopBar,
  RecruitmentSelectBottomSheet,
  RecruitmentStepIndicator,
} from "@/features/session/recruitmentForm/RecruitmentFormChrome";
import { RecruitmentBasicInfoStep } from "@/features/session/recruitmentForm/RecruitmentBasicInfoStep";
import { RecruitmentDetailInfoStep } from "@/features/session/recruitmentForm/RecruitmentDetailInfoStep";
import { useActiveBandMemberId } from "@/hooks/api/band/useBandMember";
import {
  useCreateSessionRecruitment,
  useSessionRecruitmentEditInfoQuery,
  useUpdateSessionRecruitment,
} from "@/hooks/api/session/useSessionRecruitment";
import type {
  CreateSessionRecruitmentResponse,
  SessionApiResponse,
} from "@/types/session/sessionRecruitment";
import { SessionRecruitmentCompleteScreen } from "./SessionRecruitmentCompleteScreen";

interface SessionRecruitmentFormScreenProps {
  onBack: () => void;
  onClose: () => void;
  onViewCreatedPost?: (sessionRecruitmentId?: number) => void;
  editSessionRecruitmentId?: number;
  onSaved?: () => void;
}

const normalizeRecruitmentEnumValue = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue.toLowerCase() === "etc.") {
    return "etc";
  }

  return trimmedValue;
};

const normalizeBasicValues = (
  values: BasicFormValues,
): BasicFormValues => {
  return {
    ...values,
    part: normalizeRecruitmentEnumValue(values.part),
    skill: normalizeRecruitmentEnumValue(values.skill),
    genre: normalizeRecruitmentEnumValue(values.genre),
  };
};

const normalizeDetailValues = (
  values: DetailFormValues,
): DetailFormValues => {
  return {
    ...values,
    region: normalizeRecruitmentEnumValue(values.region),
  };
};

export const SessionRecruitmentFormScreen = ({
  onBack,
  onClose,
  onViewCreatedPost,
  editSessionRecruitmentId,
  onSaved,
}: SessionRecruitmentFormScreenProps) => {
  if (!editSessionRecruitmentId) {
    return (
      <SessionRecruitmentFormBody
        mode="create"
        initialBasicValues={normalizeBasicValues(
          DEFAULT_RECRUITMENT_BASIC_VALUES,
        )}
        initialDetailValues={normalizeDetailValues(
          DEFAULT_RECRUITMENT_DETAIL_VALUES,
        )}
        onBack={onBack}
        onClose={onClose}
        onViewCreatedPost={onViewCreatedPost}
      />
    );
  }

  return (
    <SessionRecruitmentEditLoader
      sessionRecruitmentId={editSessionRecruitmentId}
      onBack={onBack}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
};

interface SessionRecruitmentEditLoaderProps {
  sessionRecruitmentId: number;
  onBack: () => void;
  onClose: () => void;
  onSaved?: () => void;
}

const SessionRecruitmentEditLoader = ({
  sessionRecruitmentId,
  onBack,
  onClose,
  onSaved,
}: SessionRecruitmentEditLoaderProps) => {
  const editInfoQuery = useSessionRecruitmentEditInfoQuery(sessionRecruitmentId);

  if (editInfoQuery.isError) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-secondary-0 px-6 text-center">
        <p className="text-caption1 text-neutral-500">
          모집 공고 정보를 불러오지 못했어요
        </p>

        <button
          type="button"
          onClick={onBack}
          className="rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
        >
          뒤로가기
        </button>
      </main>
    );
  }

  if (!editInfoQuery.data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-secondary-0">
        <p className="text-caption1 text-neutral-500">
          모집 공고 정보를 불러오고 있어요
        </p>
      </main>
    );
  }

  const detail = editInfoQuery.data;
  const deadline = splitRecruitmentDeadlineAt(detail.deadlineAt);

  return (
    <SessionRecruitmentFormBody
      mode="edit"
      sessionRecruitmentId={sessionRecruitmentId}
      initialBasicValues={normalizeBasicValues({
        title: detail.recruitmentTitle,
        summary: detail.summary,
        detail: detail.content,
        part: detail.part,
        skill: detail.skillLevel,
        genre: detail.genre,
      })}
      initialDetailValues={normalizeDetailValues({
        region: detail.region,
        practiceSchedule: detail.practiceSchedule,
        practiceLocation: detail.practicePlace,
        deadlineDate: deadline.deadlineDate,
        deadlineTime: deadline.deadlineTime,
        qualification: detail.qualification,
      })}
      onBack={onBack}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
};

interface SessionRecruitmentFormBodyProps {
  mode: FormMode;
  sessionRecruitmentId?: number;
  initialBasicValues: BasicFormValues;
  initialDetailValues: DetailFormValues;
  onBack: () => void;
  onClose: () => void;
  onViewCreatedPost?: (sessionRecruitmentId?: number) => void;
  onSaved?: () => void;
}

const SessionRecruitmentFormBody = ({
  mode,
  sessionRecruitmentId,
  initialBasicValues,
  initialDetailValues,
  onBack,
  onClose,
  onViewCreatedPost,
  onSaved,
}: SessionRecruitmentFormBodyProps) => {
  const createRecruitmentMutation = useCreateSessionRecruitment();
  const updateRecruitmentMutation = useUpdateSessionRecruitment();
  const activeBandMemberId = useActiveBandMemberId();

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCompleteScreenOpen, setIsCompleteScreenOpen] = useState(false);
  const [selectBottomSheetType, setSelectBottomSheetType] =
    useState<SelectBottomSheetType>(null);
  const [createdRecruitment, setCreatedRecruitment] =
    useState<CreateSessionRecruitmentResponse | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  const [basicValues, setBasicValues] = useState<BasicFormValues>(() =>
    normalizeBasicValues(initialBasicValues),
  );

  const [detailValues, setDetailValues] = useState<DetailFormValues>(() =>
    normalizeDetailValues(initialDetailValues),
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const isBasicComplete =
    basicValues.title.trim().length > 0 &&
    basicValues.summary.trim().length > 0 &&
    basicValues.detail.trim().length > 0 &&
    basicValues.part.length > 0 &&
    basicValues.skill.length > 0 &&
    basicValues.genre.length > 0;

  const isDetailComplete =
    detailValues.region.length > 0 &&
    detailValues.practiceSchedule.trim().length > 0 &&
    detailValues.practiceLocation.trim().length > 0 &&
    detailValues.deadlineDate.length > 0 &&
    detailValues.deadlineTime.length > 0 &&
    detailValues.qualification.trim().length > 0;

  const handleBasicFieldChange =
    (field: keyof Pick<BasicFormValues, "title" | "summary" | "detail">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setBasicValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }));
      setSubmitErrorMessage("");
    };

  const handleDetailFieldChange =
    (
      field: keyof Pick<
        DetailFormValues,
        "practiceSchedule" | "practiceLocation" | "qualification"
      >,
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDetailValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }));
      setSubmitErrorMessage("");
    };

  const handlePartClick = (part: string) => {
    setBasicValues((currentValues) => ({
      ...currentValues,
      part: normalizeRecruitmentEnumValue(part),
    }));
    setErrors((currentErrors) => ({ ...currentErrors, part: undefined }));
    setSubmitErrorMessage("");
  };

  const handleSkillClick = (skill: string) => {
    setBasicValues((currentValues) => ({
      ...currentValues,
      skill: normalizeRecruitmentEnumValue(skill),
    }));
    setSubmitErrorMessage("");
  };

  const handleGenreSelect = (genre: string) => {
    setBasicValues((currentValues) => ({
      ...currentValues,
      genre: normalizeRecruitmentEnumValue(genre),
    }));
    setErrors((currentErrors) => ({ ...currentErrors, genre: undefined }));
    setSubmitErrorMessage("");
    setSelectBottomSheetType(null);
  };

  const handleRegionSelect = (region: string) => {
    setDetailValues((currentValues) => ({
      ...currentValues,
      region: normalizeRecruitmentEnumValue(region),
    }));
    setErrors((currentErrors) => ({ ...currentErrors, region: undefined }));
    setSubmitErrorMessage("");
    setSelectBottomSheetType(null);
  };

  const handleDeadlineDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDetailValues((currentValues) => ({
      ...currentValues,
      deadlineDate: event.target.value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      deadlineDate: undefined,
      deadlineTime: undefined,
    }));
    setSubmitErrorMessage("");
  };

  const handleDeadlineTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDetailValues((currentValues) => ({
      ...currentValues,
      deadlineTime: event.target.value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      deadlineDate: undefined,
      deadlineTime: undefined,
    }));
    setSubmitErrorMessage("");
  };

  const validateBasicForm = () => {
    const nextErrors: FormErrors = {};

    if (!basicValues.title.trim()) {
      nextErrors.title = "공고명은 필수 항목이에요";
    }

    if (!basicValues.summary.trim()) {
      nextErrors.summary = "공고 한줄 소개는 필수 항목이에요";
    }

    if (!basicValues.detail.trim()) {
      nextErrors.detail = "공고 상세 소개는 필수 항목이에요";
    }

    if (!basicValues.part) {
      nextErrors.part = "파트를 선택해주세요";
    }

    if (!basicValues.genre) {
      nextErrors.genre = "장르를 선택해주세요";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && isBasicComplete;
  };

  const validateDetailForm = () => {
    const nextErrors: FormErrors = {};

    if (!detailValues.region) {
      nextErrors.region = "활동 지역을 선택해주세요";
    }

    if (!detailValues.practiceSchedule.trim()) {
      nextErrors.practiceSchedule = "연습 일정은 필수 항목이에요";
    }

    if (!detailValues.practiceLocation.trim()) {
      nextErrors.practiceLocation = "연습 장소는 필수 항목이에요";
    }

    if (!detailValues.deadlineDate) {
      nextErrors.deadlineDate = "모집 마감 날짜를 선택해주세요";
    }

    if (!detailValues.deadlineTime) {
      nextErrors.deadlineTime = "모집 마감 시간을 선택해주세요";
    }

    if (
      detailValues.deadlineDate &&
      detailValues.deadlineTime &&
      !isFutureRecruitmentDeadline(
        detailValues.deadlineDate,
        detailValues.deadlineTime,
      )
    ) {
      nextErrors.deadlineTime = "모집 마감일은 현재 시간 이후여야 해요";
    }

    if (!detailValues.qualification.trim()) {
      nextErrors.qualification = "지원 자격은 필수 항목이에요";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && isDetailComplete;
  };

  const handleNext = () => {
    if (validateBasicForm()) {
      setErrors({});
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateDetailForm()) return;

    setSubmitErrorMessage("");

    const normalizedPart = normalizeRecruitmentEnumValue(basicValues.part);
    const normalizedSkill = normalizeRecruitmentEnumValue(basicValues.skill);
    const normalizedGenre = normalizeRecruitmentEnumValue(basicValues.genre);
    const normalizedRegion = normalizeRecruitmentEnumValue(detailValues.region);

    if (mode === "edit") {
      if (!sessionRecruitmentId) return;

      const body = {
        recruitmentTitle: basicValues.title.trim(),
        summary: basicValues.summary.trim(),
        content: basicValues.detail.trim(),
        part: normalizedPart,
        skillLevel: normalizedSkill,
        genre: normalizedGenre,
        region: normalizedRegion,
        practiceSchedule: detailValues.practiceSchedule.trim(),
        practicePlace: detailValues.practiceLocation.trim(),
        deadlineAt: toRecruitmentDeadlineAt(
          detailValues.deadlineDate,
          detailValues.deadlineTime,
        ),
        qualification: detailValues.qualification.trim(),
      };

      try {
        await updateRecruitmentMutation.mutateAsync({
          sessionRecruitmentId,
          body,
        });
        onSaved?.();
      } catch (error) {
        const apiMessage = (error as AxiosError<SessionApiResponse<null>>)
          .response?.data?.message;

        setSubmitErrorMessage(
          apiMessage ?? "모집 공고 수정에 실패했어요. 잠시 후 다시 시도해주세요.",
        );
      }

      return;
    }

    const bandMemberId = activeBandMemberId;

    if (!bandMemberId) {
      setSubmitErrorMessage(
        "밴드 정보를 찾을 수 없어요. 밴드 오너 계정으로 로그인했는지 확인해주세요.",
      );
      return;
    }

    const requestBody = {
      bandMemberId,
      recruitmentTitle: basicValues.title.trim(),
      summary: basicValues.summary.trim(),
      content: basicValues.detail.trim(),
      part: normalizedPart,
      skillLevel: normalizedSkill,
      genre: normalizedGenre,
      region: normalizedRegion,
      practiceSchedule: detailValues.practiceSchedule.trim(),
      practicePlace: detailValues.practiceLocation.trim(),
      deadlineAt: toRecruitmentDeadlineAt(
        detailValues.deadlineDate,
        detailValues.deadlineTime,
      ),
      qualification: detailValues.qualification.trim(),
    };

    try {
      const result = await createRecruitmentMutation.mutateAsync(requestBody);

      setCreatedRecruitment(result);
      setIsCompleteScreenOpen(true);
    } catch (error) {
      const errorResponse = (error as AxiosError<SessionApiResponse<null>>)
        .response;
      const apiMessage = errorResponse?.data?.message;

      if (errorResponse?.status === 403) {
        setSubmitErrorMessage(
          apiMessage ??
            "밴드 오너 계정만 세션 모집 공고를 등록할 수 있어요. 현재 선택된 밴드 정보를 확인해주세요.",
        );
        return;
      }

      setSubmitErrorMessage(
        apiMessage ?? "모집 공고 등록에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleBack = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
  };

  const handleCancelConfirm = () => {
    setIsCancelModalOpen(false);
    onBack();
  };

  const handleConfirmPost = () => {
    if (onViewCreatedPost) {
      onViewCreatedPost(createdRecruitment?.sessionRecruitmentId);
      return;
    }

    onClose();
  };

  const deadlineSummary = splitRecruitmentDeadlineAt(
    createdRecruitment?.deadlineAt,
  );

  const completionSummary = {
    title: createdRecruitment?.recruitmentTitle ?? basicValues.title.trim(),
    part: normalizeRecruitmentEnumValue(
      createdRecruitment?.part ?? basicValues.part,
    ),
    skill: normalizeRecruitmentEnumValue(
      createdRecruitment?.skillLevel ?? basicValues.skill,
    ),
    genre: normalizeRecruitmentEnumValue(
      createdRecruitment?.genre ?? basicValues.genre,
    ),
    region: normalizeRecruitmentEnumValue(
      createdRecruitment?.region ?? detailValues.region,
    ),
    deadlineDate: deadlineSummary.deadlineDate || detailValues.deadlineDate,
    deadlineTime: deadlineSummary.deadlineTime || detailValues.deadlineTime,
  };

  if (isCompleteScreenOpen) {
    return (
      <SessionRecruitmentCompleteScreen
        summary={completionSummary}
        onBackToSession={onClose}
        onConfirmPost={handleConfirmPost}
      />
    );
  }

  const isSubmitting =
    mode === "edit"
      ? updateRecruitmentMutation.isPending
      : createRecruitmentMutation.isPending;

  return (
    <main className="min-h-dvh bg-secondary-0 pb-[calc(var(--bottom-nav-height)+92px)]">
      <RecruitmentFormTopBar
        title={mode === "edit" ? "세션 모집 공고 수정" : "세션 모집 공고 등록"}
        onBack={handleBack}
        onClose={onClose}
      />

      <RecruitmentStepIndicator currentStep={currentStep} />

      {currentStep === 1 ? (
        <RecruitmentBasicInfoStep
          values={basicValues}
          errors={errors}
          isComplete={isBasicComplete}
          onFieldChange={handleBasicFieldChange}
          onPartClick={handlePartClick}
          onSkillClick={handleSkillClick}
          onOpenGenreSelect={() => setSelectBottomSheetType("genre")}
          onNext={handleNext}
        />
      ) : (
        <RecruitmentDetailInfoStep
          values={detailValues}
          errors={errors}
          isComplete={isDetailComplete}
          submitErrorMessage={submitErrorMessage}
          isSubmitting={isSubmitting}
          submitLabel={mode === "edit" ? "수정하기" : "모집 공고 등록"}
          submittingLabel={mode === "edit" ? "수정 중" : "등록 중"}
          onFieldChange={handleDetailFieldChange}
          onOpenRegionSelect={() => setSelectBottomSheetType("region")}
          onDeadlineDateChange={handleDeadlineDateChange}
          onDeadlineTimeChange={handleDeadlineTimeChange}
          onSubmit={handleSubmit}
        />
      )}

      <ModalOverlay open={isCancelModalOpen} onClose={handleCancelModalClose}>
        <Modal
          tone="orange"
          title={
            mode === "edit"
              ? "모집 공고 수정을 취소할까요?"
              : "모집 공고 등록을 취소할까요?"
          }
          description={
            <>
              입력한 내용은 저장되지 않고
              <br />
              사라집니다.
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={handleCancelModalClose}
          onConfirm={handleCancelConfirm}
        />
      </ModalOverlay>

      {selectBottomSheetType === "genre" ? (
        <RecruitmentSelectBottomSheet
          title="장르"
          options={RECRUITMENT_GENRE_OPTIONS}
          selectedValue={basicValues.genre}
          onSelect={handleGenreSelect}
          onClose={() => setSelectBottomSheetType(null)}
        />
      ) : null}

      {selectBottomSheetType === "region" ? (
        <RecruitmentSelectBottomSheet
          title="지역"
          options={RECRUITMENT_REGION_OPTIONS}
          selectedValue={detailValues.region}
          onSelect={handleRegionSelect}
          onClose={() => setSelectBottomSheetType(null)}
        />
      ) : null}
    </main>
  );
};