import { useRef, useState, type ChangeEvent } from "react";
import type { AxiosError } from "axios";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseIcon from "@/assets/icons/close.svg";
import ArrowDownGrayIcon from "@/assets/icons/band/arrow-down-gray.svg";
import CalendarIcon from "@/assets/icons/band/data-range.svg";
import ClockIcon from "@/assets/icons/band/clock-band.svg";
import { useCreateSessionRecruitment } from "@/hooks/api/session/useSessionRecruitment";
import type {
  CreateSessionRecruitmentResponse,
  SessionApiResponse,
} from "@/types/session/sessionRecruitment";
import { SessionRecruitmentCompleteScreen } from "./SessionRecruitmentCompleteScreen";

const PART_OPTIONS = ["보컬", "기타", "베이스", "키보드", "드럼", "etc"];
const SKILL_OPTIONS = ["입문", "중급", "상급"];

const GENRE_OPTIONS = [
  "인디",
  "팝",
  "팝록",
  "재즈",
  "블루스",
  "얼터너티브록",
  "사이키델릭록",
  "일렉트로닉록",
  "포크록",
  "펑크록",
  "하드록",
  "메탈",
  "etc",
];

const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "충남",
  "충북",
  "전남",
  "전북",
  "경남",
  "경북",
  "강원",
  "제주",
  "지역 미상",
];

type FormStep = 1 | 2;
type SelectBottomSheetType = "genre" | "region" | null;

interface SessionRecruitmentFormScreenProps {
  onBack: () => void;
  onClose: () => void;
  onViewCreatedPost?: (sessionRecruitmentId?: number) => void;
}

interface BasicFormValues {
  title: string;
  summary: string;
  detail: string;
  part: string;
  skill: string;
  genre: string;
}

interface DetailFormValues {
  region: string;
  practiceSchedule: string;
  practiceLocation: string;
  deadlineDate: string;
  deadlineTime: string;
  qualification: string;
}

interface FormErrors {
  title?: string;
  summary?: string;
  detail?: string;
  part?: string;
  genre?: string;
  region?: string;
  practiceSchedule?: string;
  practiceLocation?: string;
  deadlineDate?: string;
  deadlineTime?: string;
  qualification?: string;
}

const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");

const getBandMemberId = () => {
  const storedBandMemberId =
    localStorage.getItem("bandMemberId") ??
    localStorage.getItem("currentBandMemberId") ??
    localStorage.getItem("selectedBandMemberId");

  const parsedBandMemberId = Number(storedBandMemberId);

  return Number.isFinite(parsedBandMemberId) && parsedBandMemberId > 0
    ? parsedBandMemberId
    : null;
};

const toDeadlineAt = (dateValue: string, timeValue: string) => `${dateValue}T${timeValue}:00`;

const splitDeadlineAt = (deadlineAt?: string) => ({
  deadlineDate: deadlineAt?.slice(0, 10) ?? "",
  deadlineTime: deadlineAt?.slice(11, 16) ?? "",
});

const isFutureDeadline = (dateValue: string, timeValue: string) => {
  if (!dateValue || !timeValue) return false;

  const deadline = new Date(toDeadlineAt(dateValue, timeValue));

  if (Number.isNaN(deadline.getTime())) return false;

  return deadline.getTime() > Date.now();
};

export const SessionRecruitmentFormScreen = ({
  onBack,
  onClose,
  onViewCreatedPost,
}: SessionRecruitmentFormScreenProps) => {
  const createRecruitmentMutation = useCreateSessionRecruitment();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCompleteScreenOpen, setIsCompleteScreenOpen] = useState(false);
  const [selectBottomSheetType, setSelectBottomSheetType] =
    useState<SelectBottomSheetType>(null);
  const [createdRecruitment, setCreatedRecruitment] =
    useState<CreateSessionRecruitmentResponse | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  const [basicValues, setBasicValues] = useState<BasicFormValues>({
    title: "",
    summary: "",
    detail: "",
    part: "",
    skill: "중급",
    genre: "",
  });

  const [detailValues, setDetailValues] = useState<DetailFormValues>({
    region: "",
    practiceSchedule: "",
    practiceLocation: "",
    deadlineDate: "",
    deadlineTime: "",
    qualification: "",
  });

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
      part,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, part: undefined }));
    setSubmitErrorMessage("");
  };

  const handleSkillClick = (skill: string) => {
    setBasicValues((currentValues) => ({ ...currentValues, skill }));
    setSubmitErrorMessage("");
  };

  const handleGenreSelect = (genre: string) => {
    setBasicValues((currentValues) => ({
      ...currentValues,
      genre,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, genre: undefined }));
    setSubmitErrorMessage("");
    setSelectBottomSheetType(null);
  };

  const handleRegionSelect = (region: string) => {
    setDetailValues((currentValues) => ({
      ...currentValues,
      region,
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
      !isFutureDeadline(detailValues.deadlineDate, detailValues.deadlineTime)
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

    const bandMemberId = getBandMemberId();

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
  part: basicValues.part,
  skillLevel: basicValues.skill,
  genre: basicValues.genre,
  region: detailValues.region,
  practiceSchedule: detailValues.practiceSchedule.trim(),
  practicePlace: detailValues.practiceLocation.trim(),
  deadlineAt: toDeadlineAt(detailValues.deadlineDate, detailValues.deadlineTime),
  qualification: detailValues.qualification.trim(),
};

    console.log("세션 모집 공고 등록 requestBody:", requestBody);

    try {
      const result = await createRecruitmentMutation.mutateAsync(requestBody);

      setCreatedRecruitment(result);
      setIsCompleteScreenOpen(true);
   } catch (error) {
  const errorResponse = (error as AxiosError<SessionApiResponse<null>>).response;
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

  const deadlineSummary = splitDeadlineAt(createdRecruitment?.deadlineAt);
  const completionSummary = {
    title: createdRecruitment?.recruitmentTitle ?? basicValues.title.trim(),
    part: createdRecruitment?.part ?? basicValues.part,
    skill: createdRecruitment?.skillLevel ?? basicValues.skill,
    genre: createdRecruitment?.genre ?? basicValues.genre,
    region: createdRecruitment?.region ?? detailValues.region,
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

  return (
    <main className="min-h-dvh bg-secondary-0 pb-[calc(var(--bottom-nav-height)+92px)]">
      <FormTopBar onBack={handleBack} onClose={onClose} />
      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 ? (
        <BasicInfoStep
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
        <DetailInfoStep
          values={detailValues}
          errors={errors}
          isComplete={isDetailComplete}
          submitErrorMessage={submitErrorMessage}
          isSubmitting={createRecruitmentMutation.isPending}
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
          title="모집 공고 등록을 취소할까요?"
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
        <SelectBottomSheet
          title="장르"
          options={GENRE_OPTIONS}
          selectedValue={basicValues.genre}
          onSelect={handleGenreSelect}
          onClose={() => setSelectBottomSheetType(null)}
        />
      ) : null}

      {selectBottomSheetType === "region" ? (
        <SelectBottomSheet
          title="지역"
          options={REGION_OPTIONS}
          selectedValue={detailValues.region}
          onSelect={handleRegionSelect}
          onClose={() => setSelectBottomSheetType(null)}
        />
      ) : null}
    </main>
  );
};

interface BasicInfoStepProps {
  values: BasicFormValues;
  errors: FormErrors;
  isComplete: boolean;
  onFieldChange: (
    field: keyof Pick<BasicFormValues, "title" | "summary" | "detail">,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPartClick: (part: string) => void;
  onSkillClick: (skill: string) => void;
  onOpenGenreSelect: () => void;
  onNext: () => void;
}

const BasicInfoStep = ({
  values,
  errors,
  isComplete,
  onFieldChange,
  onPartClick,
  onSkillClick,
  onOpenGenreSelect,
  onNext,
}: BasicInfoStepProps) => {
  return (
    <>
      <section className="px-5 pt-0">
        <div className="rounded-[16px] bg-neutral-0 px-[18px] py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
          <FieldLabel htmlFor="session-recruitment-title" required>
            공고 제목
          </FieldLabel>
          <TextInput
            id="session-recruitment-title"
            value={values.title}
            placeholder="공고 제목을 입력해주세요"
            maxLength={50}
            error={Boolean(errors.title)}
            onChange={onFieldChange("title")}
          />
          {errors.title ? <ErrorMessage>{errors.title}</ErrorMessage> : null}

          <div className="mt-3">
            <FieldLabel htmlFor="session-recruitment-summary" required>
              공고 한줄 소개
            </FieldLabel>
            <TextInput
              id="session-recruitment-summary"
              value={values.summary}
              placeholder="공고 목록에 표시될 짧은 소개를 입력해주세요. (최대 50자)"
              maxLength={50}
              error={Boolean(errors.summary)}
              onChange={onFieldChange("summary")}
            />
            {errors.summary ? <ErrorMessage>{errors.summary}</ErrorMessage> : null}
          </div>

          <div className="mt-3">
            <FieldLabel htmlFor="session-recruitment-detail" required>
              공고 상세 소개
            </FieldLabel>
            <div className="relative">
              <textarea
                id="session-recruitment-detail"
                value={values.detail}
                maxLength={500}
                placeholder="모집 공고의 상세 내용을 입력해주세요"
                onChange={onFieldChange("detail")}
                className={cx(
                  "h-[58px] w-full resize-none rounded-[5px] border bg-neutral-0 px-4 py-2 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500",
                  errors.detail ? "border-error" : "border-neutral-400 focus:border-secondary-500",
                )}
              />
              <span className="absolute right-[13px] bottom-2 text-caption4 text-neutral-500">
                {values.detail.length}/500
              </span>
            </div>
            {errors.detail ? <ErrorMessage>{errors.detail}</ErrorMessage> : null}
          </div>

          <div className="mt-3">
            <FieldLabel required>모집 파트</FieldLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {PART_OPTIONS.map((part) => (
                <OptionChip
                  key={part}
                  selected={values.part === part}
                  onClick={() => onPartClick(part)}
                >
                  {part === "etc" ? "etc." : part}
                </OptionChip>
              ))}
            </div>
            {errors.part ? <ErrorMessage>{errors.part}</ErrorMessage> : null}
          </div>

          <div className="mt-3">
            <FieldLabel required>실력대</FieldLabel>
            <div className="mt-2 flex gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <OptionChip
                  key={skill}
                  selected={values.skill === skill}
                  onClick={() => onSkillClick(skill)}
                >
                  {skill}
                </OptionChip>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <FieldLabel required>장르</FieldLabel>
            <SelectButton
              value={values.genre === "etc" ? "etc." : values.genre}
              placeholder="장르 선택"
              error={Boolean(errors.genre)}
              onClick={onOpenGenreSelect}
            />
            {errors.genre ? <ErrorMessage>{errors.genre}</ErrorMessage> : null}
          </div>
        </div>
      </section>

      <BottomActionButton active={isComplete} label="다음" onClick={onNext} />
    </>
  );
};

interface DetailInfoStepProps {
  values: DetailFormValues;
  errors: FormErrors;
  isComplete: boolean;
  submitErrorMessage: string;
  isSubmitting: boolean;
  onFieldChange: (
    field: keyof Pick<
      DetailFormValues,
      "practiceSchedule" | "practiceLocation" | "qualification"
    >,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onOpenRegionSelect: () => void;
  onDeadlineDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeadlineTimeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const DetailInfoStep = ({
  values,
  errors,
  isComplete,
  submitErrorMessage,
  isSubmitting,
  onFieldChange,
  onOpenRegionSelect,
  onDeadlineDateChange,
  onDeadlineTimeChange,
  onSubmit,
}: DetailInfoStepProps) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const openNativePicker = (input: HTMLInputElement | null) => {
    if (!input) return;

    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };

    if (pickerInput.showPicker) {
      pickerInput.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <>
      <section className="px-5 pt-0">
        <div className="rounded-[16px] bg-neutral-0 px-[18px] py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
          <FieldLabel required>활동 지역</FieldLabel>
          <SelectButton
            value={values.region}
            placeholder="지역 선택"
            error={Boolean(errors.region)}
            onClick={onOpenRegionSelect}
          />
          {errors.region ? <ErrorMessage>{errors.region}</ErrorMessage> : null}

          <div className="mt-3">
            <FieldLabel htmlFor="session-practice-schedule" required>
              연습 일정
            </FieldLabel>
            <TextInput
              id="session-practice-schedule"
              value={values.practiceSchedule}
              placeholder="연습 일정을 작성해주세요"
              maxLength={50}
              error={Boolean(errors.practiceSchedule)}
              onChange={onFieldChange("practiceSchedule")}
            />
            {errors.practiceSchedule ? (
              <ErrorMessage>{errors.practiceSchedule}</ErrorMessage>
            ) : null}
          </div>

          <div className="mt-3">
            <FieldLabel htmlFor="session-practice-location" required>
              연습 장소
            </FieldLabel>
            <TextInput
              id="session-practice-location"
              value={values.practiceLocation}
              placeholder="연습 장소를 작성해주세요"
              maxLength={50}
              error={Boolean(errors.practiceLocation)}
              onChange={onFieldChange("practiceLocation")}
            />
            {errors.practiceLocation ? (
              <ErrorMessage>{errors.practiceLocation}</ErrorMessage>
            ) : null}
          </div>

          <div className="mt-3">
            <FieldLabel required>모집 마감일</FieldLabel>
            <div className="flex flex-col gap-1">
              <div className="relative">
                <DeadlinePickerButton
                  value={formatDeadlineDateLabel(values.deadlineDate)}
                  placeholder="날짜 선택"
                  icon={CalendarIcon}
                  error={Boolean(errors.deadlineDate)}
                  onClick={() => openNativePicker(dateInputRef.current)}
                />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={values.deadlineDate}
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={onDeadlineDateChange}
                  className="pointer-events-none absolute top-0 right-0 h-px w-px opacity-0"
                />
              </div>

              <div className="relative">
                <DeadlinePickerButton
                  value={values.deadlineTime}
                  placeholder="시간 선택"
                  icon={ClockIcon}
                  error={Boolean(errors.deadlineTime)}
                  onClick={() => openNativePicker(timeInputRef.current)}
                />
                <input
                  ref={timeInputRef}
                  type="time"
                  value={values.deadlineTime}
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={onDeadlineTimeChange}
                  className="pointer-events-none absolute top-0 right-0 h-px w-px opacity-0"
                />
              </div>
            </div>
            {errors.deadlineDate ? <ErrorMessage>{errors.deadlineDate}</ErrorMessage> : null}
            {errors.deadlineTime ? <ErrorMessage>{errors.deadlineTime}</ErrorMessage> : null}
          </div>

          <div className="mt-3">
            <FieldLabel htmlFor="session-qualification" required>
              지원 자격
            </FieldLabel>
            <div className="relative">
              <textarea
                id="session-qualification"
                value={values.qualification}
                maxLength={500}
                placeholder="지원 자격을 입력해주세요"
                onChange={onFieldChange("qualification")}
                className={cx(
                  "h-[58px] w-full resize-none rounded-[5px] border bg-neutral-0 px-4 py-2 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500",
                  errors.qualification
                    ? "border-error"
                    : "border-neutral-400 focus:border-secondary-500",
                )}
              />
              <span className="absolute right-[13px] bottom-2 text-caption4 text-neutral-500">
                {values.qualification.length}/500
              </span>
            </div>
            {errors.qualification ? <ErrorMessage>{errors.qualification}</ErrorMessage> : null}
          </div>
        </div>
      </section>

     {submitErrorMessage ? (
  <p className="fixed left-1/2 bottom-[calc(var(--bottom-nav-height)+128px)] z-30 w-full max-w-[393px] -translate-x-1/2 px-6 text-center text-caption2 text-error">
          {submitErrorMessage}
        </p>
      ) : null}
      <BottomActionButton
        active={isComplete && !isSubmitting}
        label={isSubmitting ? "등록 중" : "모집 공고 등록"}
        onClick={onSubmit}
      />
    </>
  );
};

interface SelectBottomSheetProps {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const SelectBottomSheet = ({
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectBottomSheetProps) => {
  return (
    <div
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-end bg-neutral-900/70"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[70dvh] w-full overflow-y-auto rounded-t-[24px] bg-neutral-0 px-6 pt-3 pb-[calc(var(--bottom-nav-height)+24px)]"
      >
        <div className="mx-auto h-1.5 w-14 rounded-full bg-neutral-300" />
        <h2 className="mt-5 text-h4 text-neutral-900">{title}</h2>

        <div className="mt-5 flex flex-wrap gap-x-3 gap-y-4">
          {options.map((option) => {
            const isSelected = selectedValue === option;
            const label = option === "etc" ? "etc." : option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={cx(
                  "flex h-[54px] min-w-[76px] items-center justify-center rounded-full px-6 text-body1 font-semibold",
                  isSelected
                    ? "bg-secondary-500 text-neutral-0"
                    : "bg-neutral-300 text-neutral-600",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

interface FormTopBarProps {
  onBack: () => void;
  onClose: () => void;
}

const FormTopBar = ({ onBack, onClose }: FormTopBarProps) => {
  return (
    <header className="relative flex h-12 w-full items-center justify-center bg-neutral-0 px-[15px] py-[5px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute top-[5px] left-[15px] flex size-[38px] items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <h1 className="text-[18px] leading-5 font-bold text-neutral-900">세션 모집 공고 등록</h1>

      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-[5px] right-[15px] flex size-[38px] items-center justify-center"
      >
        <img src={CloseIcon} alt="" className="size-6" />
      </button>
    </header>
  );
};

interface StepIndicatorProps {
  currentStep: FormStep;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <section className="flex h-[77px] items-start justify-center bg-secondary-0 pt-4">
      <div className="flex items-start">
        <StepNode complete={currentStep === 2} active={currentStep === 1} label="기본 정보" number={1} />
        <div
          className={cx(
            "mt-[9px] h-0.5 w-32",
            currentStep === 2 ? "bg-secondary-500" : "bg-neutral-400",
          )}
        />
        <StepNode active={currentStep === 2} label="상세 정보" number={2} />
      </div>
    </section>
  );
};

interface StepNodeProps {
  active?: boolean;
  complete?: boolean;
  label: string;
  number: number;
}

const StepNode = ({ active = false, complete = false, label, number }: StepNodeProps) => {
  return (
    <div className="flex w-[58px] flex-col items-center gap-[3px]">
      <span
        className={cx(
          "flex size-5 items-center justify-center rounded-full text-[10px] leading-3 font-bold text-neutral-0",
          active || complete ? "bg-secondary-500" : "bg-neutral-500",
        )}
      >
        {complete ? "✓" : number}
      </span>
      <span
        className={cx(
          "text-[10px] leading-3 font-bold",
          active || complete ? "text-secondary-500" : "text-neutral-500",
        )}
      >
        {label}
      </span>
    </div>
  );
};

interface FieldLabelProps {
  children: string;
  htmlFor?: string;
  required?: boolean;
}

const FieldLabel = ({ children, htmlFor, required = false }: FieldLabelProps) => {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-body1 text-neutral-900">
      {children}
      {required ? <span className="text-error"> *</span> : null}
    </label>
  );
};

interface TextInputProps {
  id: string;
  value: string;
  placeholder: string;
  error?: boolean;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TextInput = ({
  id,
  value,
  placeholder,
  error = false,
  maxLength,
  onChange,
}: TextInputProps) => {
  return (
    <input
      id={id}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={onChange}
      className={cx(
        "h-[30px] w-full rounded-[5px] border bg-neutral-0 px-4 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500",
        error ? "border-error" : "border-neutral-400 focus:border-secondary-500",
      )}
    />
  );
};

interface SelectButtonProps {
  value: string;
  placeholder: string;
  error?: boolean;
  onClick: () => void;
}

const SelectButton = ({ value, placeholder, error = false, onClick }: SelectButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-[30px] w-full items-center justify-between rounded-[5px] border bg-neutral-0 px-4 text-caption2",
        error ? "border-error" : "border-neutral-400",
        value ? "text-neutral-900" : "text-neutral-500",
      )}
    >
      <span>{value || placeholder}</span>
      <img src={ArrowDownGrayIcon} alt="" className="h-[7px] w-3" />
    </button>
  );
};

interface DeadlinePickerButtonProps {
  value: string;
  placeholder: string;
  icon: string;
  error?: boolean;
  onClick: () => void;
}

const DeadlinePickerButton = ({
  value,
  placeholder,
  icon,
  error = false,
  onClick,
}: DeadlinePickerButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-[30px] w-full items-center justify-between rounded-[5px] border bg-neutral-0 px-4 text-caption2",
        error ? "border-error" : "border-neutral-400",
        value ? "text-neutral-900" : "text-neutral-500",
      )}
    >
      <span>{value || placeholder}</span>
      <img src={icon} alt="" className="size-[18px]" />
    </button>
  );
};

const formatDeadlineDateLabel = (value: string) => {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  const weekDay = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(year, month - 1, day).getDay()
  ];

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}. (${weekDay})`;
};

interface OptionChipProps {
  children: string;
  selected: boolean;
  onClick: () => void;
}

const OptionChip = ({ children, selected, onClick }: OptionChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-[26px] min-w-14 items-center justify-center whitespace-nowrap rounded-[8px] px-2 text-caption2",
        selected ? "bg-secondary-500 text-neutral-0" : "bg-neutral-300 text-neutral-600",
      )}
    >
      {children}
    </button>
  );
};

interface BottomActionButtonProps {
  active: boolean;
  label: string;
  onClick: () => void | Promise<void>;
}

const BottomActionButton = ({ active, label, onClick }: BottomActionButtonProps) => {
  return (
    <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-20 bg-secondary-0 px-5 py-5">
      <button
        type="button"
        onClick={onClick}
        disabled={!active}
        className={cx(
          "flex h-[52px] w-full items-center justify-center rounded-[12px] text-label2",
          active ? "bg-secondary-500 text-neutral-0" : "bg-neutral-300 text-neutral-700",
        )}
      >
        {label}
      </button>
    </div>
  );
};

interface ErrorMessageProps {
  children: string;
}

const ErrorMessage = ({ children }: ErrorMessageProps) => {
  return <p className="mt-1 text-[10px] leading-3 font-bold text-error">{children}</p>;
};