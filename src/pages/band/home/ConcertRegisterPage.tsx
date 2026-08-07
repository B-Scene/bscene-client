import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/common/Header/Header";
import { DatePickerSheet } from "@/components/band/home/DatePickerSheet";
import { TimePickerSheet } from "@/components/band/home/TimePickerSheet";
import { Input } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import {
  useCreatePerformance,
  usePerformanceQuery,
  useUpdatePerformance,
} from "@/hooks/api/band/usePerformance";
import { uploadMediaFile } from "@/utils/uploadMediaFile";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { PerformanceResponse } from "@/types/band/performance";
import {
  BAND_REGION_BY_LABEL,
  BAND_REGION_LABELS,
  BAND_REGION_LABEL_OPTIONS,
  PERFORMANCE_AGE_RATING_BY_LABEL,
  PERFORMANCE_AGE_RATING_LABELS,
  PERFORMANCE_AGE_RATING_LABEL_OPTIONS,
  PERFORMANCE_GENRE_BY_LABEL,
  PERFORMANCE_GENRE_LABELS,
  PERFORMANCE_GENRE_LABEL_OPTIONS,
} from "@/utils/bandLabels";
import CalendarIcon from "@/assets/icons/band/data-range.svg";
import ClockIcon from "@/assets/icons/band/clock-band.svg";
import UploadIcon from "@/assets/icons/band/add-image.svg";
import CloseIcon from "@/assets/icons/close.svg";
import Number1CircleIcon from "@/assets/icons/band/number1-circle.svg";
import Number2CircleIcon from "@/assets/icons/band/number2-circle.svg";
import Number2CircleActiveIcon from "@/assets/icons/band/number2-circle-active.svg";
import CheckCircleYellowIcon from "@/assets/icons/band/check-circle-yellow.svg";

const DESCRIPTION_MAX_LENGTH = 500;
const MAX_TAGS = 8;

const formatDateRange = (start: string, end: string) => {
  if (!start) return "";
  const startLabel = start.replaceAll("-", ".");
  if (!end || end === start) return startLabel;
  return `${startLabel} - ${end.replaceAll("-", ".")}`;
};

const hasBatchim = (text: string) => {
  const lastChar = text.trim().slice(-1);
  const code = lastChar.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
};

type Step = 1 | 2;

interface StepIndicatorProps {
  step: Step;
}

const StepIndicator = ({ step }: StepIndicatorProps) => {
  return (
    <div className="flex items-start justify-center gap-3 bg-secondary-0 pt-4">
      <div className="flex flex-col items-center gap-2.25">
        <img
          src={step > 1 ? CheckCircleYellowIcon : Number1CircleIcon}
          alt=""
        />
        <span
          className={`text-body4 text-center ${step === 1 ? "text-secondary-500" : "text-neutral-400"}`}
        >
          기본 정보
        </span>
      </div>

      <div
        className={`mt-2.75 h-0.5 w-32 ${step > 1 ? "bg-secondary-500" : "bg-secondary-300"}`}
      />

      <div className="flex flex-col items-center gap-1">
        <img
          src={step === 2 ? Number2CircleActiveIcon : Number2CircleIcon}
          alt=""
          className="size-6"
        />
        <span
          className={`text-body4 text-center ${step === 2 ? "text-secondary-500" : "text-neutral-400"}`}
        >
          일정 & 장소
        </span>
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  required?: boolean;
  error?: boolean;
  children: ReactNode;
}

const Field = ({ label, required, error, children }: FieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-body1 text-neutral-900">
      {label}{" "}
      {required ? <span className="text-body1 text-error">*</span> : null}
    </label>
    {children}
    {error ? (
      <span className="text-body5 text-error">
        {label}
        {hasBatchim(label) ? "은" : "는"} 필수 항목이에요
      </span>
    ) : null}
  </div>
);

const ConcertRegisterPage = () => {
  const { concertId } = useParams();
  const activeBandId = useActiveBandId();
  const bandId = activeBandId ?? NaN;
  const performanceId = concertId ? Number(concertId) : NaN;
  const isEditMode = Boolean(concertId);

  const { data: existingPerformance, isLoading } =
    usePerformanceQuery(performanceId);

  if (activeBandId === null || (isEditMode && isLoading)) {
    return <main className="min-h-dvh bg-secondary-0" />;
  }

  return (
    <ConcertRegisterForm
      bandId={bandId}
      performanceId={performanceId}
      isEditMode={isEditMode}
      existingPerformance={existingPerformance}
    />
  );
};

interface ConcertRegisterFormProps {
  bandId: number;
  performanceId: number;
  isEditMode: boolean;
  existingPerformance: PerformanceResponse | undefined;
}

const ConcertRegisterForm = ({
  bandId,
  performanceId,
  isEditMode,
  existingPerformance,
}: ConcertRegisterFormProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPerformance = useCreatePerformance(bandId);
  const updatePerformance = useUpdatePerformance(performanceId);

  const [step, setStep] = useState<Step>(1);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const [title, setTitle] = useState(() => existingPerformance?.title ?? "");
  const [genre, setGenre] = useState(() =>
    existingPerformance ? PERFORMANCE_GENRE_LABELS[existingPerformance.genre] : "",
  );
  const [region, setRegion] = useState(() =>
    existingPerformance ? BAND_REGION_LABELS[existingPerformance.region] : "",
  );
  const [ageRating, setAgeRating] = useState(() =>
    existingPerformance
      ? PERFORMANCE_AGE_RATING_LABELS[existingPerformance.ageRating]
      : "",
  );
  const [description, setDescription] = useState(
    () => existingPerformance?.description ?? "",
  );
  const [posterUrl, setPosterUrl] = useState(
    () => existingPerformance?.posterImageUrl ?? "",
  );
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(
    () => existingPerformance?.tags ?? [],
  );
  const [tagInput, setTagInput] = useState("");

  const [startDate, setStartDate] = useState(
    () => existingPerformance?.performanceDate ?? "",
  );
  const [endDate, setEndDate] = useState(
    () => existingPerformance?.performanceDate ?? "",
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [time, setTime] = useState(
    () => existingPerformance?.startTime.slice(0, 5) ?? "",
  );
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [location, setLocation] = useState(
    () => existingPerformance?.venue ?? "",
  );
  const [price, setPrice] = useState(
    () => existingPerformance?.ticketPrice ?? "",
  );
  const [ticketLink, setTicketLink] = useState(
    () => existingPerformance?.ticketLink ?? "",
  );

  const [showStep1Errors, setShowStep1Errors] = useState(false);
  const [showStep2Errors, setShowStep2Errors] = useState(false);

  const isStep1Valid = Boolean(
    title.trim() && genre && region && ageRating && description.trim(),
  );
  const isStep2Valid = Boolean(
    startDate && time && location.trim() && price.trim(),
  );

  const titleError = showStep1Errors && !title.trim();
  const genreError = showStep1Errors && !genre;
  const regionError = showStep1Errors && !region;
  const ageRatingError = showStep1Errors && !ageRating;
  const descriptionError = showStep1Errors && !description.trim();

  const dateError = showStep2Errors && !startDate;
  const timeError = showStep2Errors && !time;
  const locationError = showStep2Errors && !location.trim();
  const priceError = showStep2Errors && !price.trim();

  const submitError = isEditMode
    ? updatePerformance.error
    : createPerformance.error;
  const isSubmitting =
    (isEditMode ? updatePerformance.isPending : createPerformance.isPending) ||
    isUploading;

  const handlePosterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterUrl(URL.createObjectURL(file));
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.key !== "Enter") return;
    event.preventDefault();

    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= MAX_TAGS) return;

    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleConfirmLeave = () => {
    navigate("/band/home");
  };

  const handleNext = () => {
    if (!isStep1Valid) {
      setShowStep1Errors(true);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!isStep2Valid) {
      setShowStep2Errors(true);
      return;
    }

    const regionValue = BAND_REGION_BY_LABEL[region];
    const ageRatingValue = PERFORMANCE_AGE_RATING_BY_LABEL[ageRating];
    const genreValue = PERFORMANCE_GENRE_BY_LABEL[genre];

    if (!regionValue || !ageRatingValue || !genreValue) {
      setUploadError("장르, 지역, 관람 연령을 다시 선택해주세요");
      return;
    }

    const ticketPriceValue = String(
      Number(price.replace(/[^0-9]/g, "")) || 0,
    );
    setUploadError(null);
    let uploadedPosterUrl = posterUrl;

    if (posterFile) {
      try {
        setIsUploading(true);
        uploadedPosterUrl = await uploadMediaFile(
          posterFile,
          "PERFORMANCE_POSTER",
        );
      } catch {
        setIsUploading(false);
        setUploadError("포스터 업로드에 실패했어요. 다시 시도해주세요");
        return;
      }
      setIsUploading(false);
    }

    const onSuccess = () => {
      navigate("/band/register/complete", {
        state: {
          title: isEditMode ? "공연이 수정됐어요" : "공연이 등록됐어요",
          description: isEditMode
            ? "변경사항이 저장됐어요"
            : "팔로워들에게 공연 소식이\n전달됐어요",
          rows: [
            { label: "공연명", value: title },
            { label: "날짜", value: formatDateRange(startDate, endDate) },
            { label: "장소", value: location },
          ],
          primaryLabel: "공연 상세 보기",
          primaryTo: "/band/home",
        },
      });
    };

    if (isEditMode) {
      updatePerformance.mutate(
        {
          title,
          genre: genreValue,
          performanceDate: startDate,
          startTime: time,
          region: regionValue,
          venue: location,
          description,
          ticketPrice: ticketPriceValue,
          ticketLink: ticketLink.trim() || undefined,
          posterImageUrl: uploadedPosterUrl || undefined,
          ageRating: ageRatingValue,
          tags,
        },
        { onSuccess },
      );
      return;
    }

    createPerformance.mutate(
      {
        title,
        genre: genreValue,
        performanceDate: startDate,
        startTime: time,
        region: regionValue,
        venue: location,
        description,
        ticketPrice: ticketPriceValue,
        ticketLink: ticketLink.trim() || undefined,
        posterImageUrl: uploadedPosterUrl || undefined,
        ageRating: ageRatingValue,
        tags,
      },
      { onSuccess },
    );
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-secondary-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <Header
        title={isEditMode ? "공연 수정" : "공연 등록"}
        align="between"
        onBack={() => setIsLeaveConfirmOpen(true)}
        rightContent={
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setIsLeaveConfirmOpen(true)}
          >
            <img src={CloseIcon} alt="" className="size-6" />
          </button>
        }
      />

      <div className="flex flex-col gap-6">
        <StepIndicator step={step} />

        <section className="px-5">
          <div className="flex flex-col gap-3 rounded-2xl bg-neutral-0 px-4.5 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.08)]">
            {step === 1 ? (
              <>
                <Field label="공연명" required error={titleError}>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="공연 제목을 입력해주세요"
                    error={titleError}
                    className="w-full rounded-[5px] px-4 py-1.25"
                  />
                </Field>

                <Field label="장르" required error={genreError}>
                  <Select
                    value={genre}
                    onChange={setGenre}
                    options={PERFORMANCE_GENRE_LABEL_OPTIONS}
                    placeholder="장르 선택"
                    error={genreError}
                    className="w-full"
                  />
                </Field>

                <Field label="지역" required error={regionError}>
                  <Select
                    value={region}
                    onChange={setRegion}
                    options={BAND_REGION_LABEL_OPTIONS}
                    placeholder="지역 선택"
                    error={regionError}
                    className="w-full"
                  />
                </Field>

                <Field label="관람 연령" required error={ageRatingError}>
                  <div className="flex gap-2">
                    {PERFORMANCE_AGE_RATING_LABEL_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAgeRating(option)}
                        className={`flex h-6.5 min-w-0 flex-1 items-center justify-center rounded-lg text-center text-caption3 ${
                          ageRating === option
                            ? "bg-secondary-500 text-neutral-0"
                            : ageRatingError
                              ? "border border-error text-error"
                              : "bg-neutral-300 text-neutral-600"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="공연 포스터">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col rounded-[5px] border border-neutral-400 bg-neutral-0"
                  >
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt="공연 포스터"
                        className="h-32 w-full rounded-[5px] object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 self-stretch px-21.5 py-4">
                        <img src={UploadIcon} alt="" />
                        <span className="text-caption2 text-neutral-500">
                          공연 포스터를 업로드해주세요
                        </span>
                      </div>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </Field>

                <Field label="공연 소개" required error={descriptionError}>
                  <div
                    className={`flex h-15 w-full flex-col rounded-[5px] border bg-neutral-0 pt-1.5 pr-3.25 pb-2 pl-4 focus-within:border-secondary-500 ${
                      descriptionError ? "border-error" : "border-neutral-400"
                    }`}
                  >
                    <textarea
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value.slice(0, DESCRIPTION_MAX_LENGTH),
                        )
                      }
                      placeholder="공연에 대해 소개해주세요"
                      maxLength={DESCRIPTION_MAX_LENGTH}
                      className="w-full flex-1 resize-none bg-transparent text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500"
                    />
                    <span className="self-end text-caption4 text-neutral-400">
                      {description.length}/{DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                </Field>

                <Field label={`태그 (최대 ${MAX_TAGS}개)`}>
                  <div className="flex flex-col gap-2.5">
                    <Input
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="태그를 입력해주세요"
                      disabled={tags.length >= MAX_TAGS}
                      className="w-full rounded-[5px] px-4 py-1.25"
                    />

                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex h-6.5 shrink-0 items-center justify-center gap-2 rounded-full bg-secondary-100 px-3.75 py-1.75 text-center text-caption3 text-secondary-500"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              aria-label={`${tag} 태그 삭제`}
                            >
                              <img
                                src={CloseIcon}
                                alt=""
                                className="size-2.5"
                              />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Field>
              </>
            ) : (
              <>
                <Field label="공연 날짜" required error={dateError}>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(true)}
                    className={`flex w-full items-center rounded-[5px] border px-4 py-1.25 ${
                      dateError ? "border-error" : "border-neutral-400"
                    }`}
                  >
                    <span
                      className={`flex-1 text-left text-caption2 ${startDate ? "text-neutral-900" : "text-neutral-500"}`}
                    >
                      {startDate
                        ? formatDateRange(startDate, endDate)
                        : "날짜 선택"}
                    </span>
                    <img
                      src={CalendarIcon}
                      alt=""
                      className="size-4 shrink-0"
                    />
                  </button>
                </Field>

                <Field label="공연 시작 시간" required error={timeError}>
                  <button
                    type="button"
                    onClick={() => setIsTimePickerOpen(true)}
                    className={`flex w-full items-center rounded-[5px] border px-4 py-1.25 ${
                      timeError ? "border-error" : "border-neutral-400"
                    }`}
                  >
                    <span
                      className={`flex-1 text-left text-caption2 ${time ? "text-neutral-900" : "text-neutral-500"}`}
                    >
                      {time || "시간 선택"}
                    </span>
                    <img src={ClockIcon} alt="" className="size-4 shrink-0" />
                  </button>
                </Field>

                <Field label="공연 장소" required error={locationError}>
                  <Input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="공연 장소를 작성해주세요"
                    error={locationError}
                    className="w-full rounded-[5px] px-4 py-1.25"
                  />
                </Field>

                <Field label="티켓 가격" required error={priceError}>
                  <Input
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    error={priceError}
                    placeholder="티켓 가격을 작성해주세요"
                    className="w-full rounded-[5px] px-4 py-1.25"
                  />
                </Field>

                <Field label="티켓 예매 링크 (선택)">
                  <Input
                    value={ticketLink}
                    onChange={(event) => setTicketLink(event.target.value)}
                    placeholder="예매 링크 또는 관련 게시글 링크를 첨부해주세요"
                    className="w-full rounded-[5px] px-4 py-1.25"
                  />
                </Field>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4.5 flex flex-col gap-2 px-5">
        {uploadError ? (
          <span className="text-center text-body5 text-error">
            {uploadError}
          </span>
        ) : submitError ? (
          <span className="text-center text-body5 text-error">
            {getApiErrorMessage(submitError, "저장에 실패했어요. 다시 시도해주세요")}
          </span>
        ) : null}

        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 ${
              isStep1Valid
                ? "bg-secondary-500 text-neutral-0"
                : "bg-neutral-300 text-neutral-600"
            }`}
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 ${
              isStep2Valid && !isSubmitting
                ? "bg-secondary-500 text-neutral-0"
                : "bg-neutral-300 text-neutral-600"
            }`}
          >
            {isUploading
              ? "업로드 중..."
              : isEditMode
                ? "수정 완료"
                : "공연 등록"}
          </button>
        )}
      </div>

      <DatePickerSheet
        open={isDatePickerOpen}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={(range) => {
          setStartDate(range.start);
          setEndDate(range.end);
          setIsDatePickerOpen(false);
        }}
      />

      <TimePickerSheet
        open={isTimePickerOpen}
        value={time}
        onClose={() => setIsTimePickerOpen(false)}
        onConfirm={(nextTime) => {
          setTime(nextTime);
          setIsTimePickerOpen(false);
        }}
      />

      <ModalOverlay
        open={isLeaveConfirmOpen}
        onClose={() => setIsLeaveConfirmOpen(false)}
      >
        <Modal
          tone="orange"
          title={isEditMode ? "수정을 취소할까요?" : "공연 등록을 취소할까요?"}
          description={
            isEditMode ? (
              <>
                수정한 내용은 저장되지 않고
                <br />
                사라집니다.
              </>
            ) : (
              <>
                입력한 내용은 저장되지 않고
                <br />
                사라집니다.
              </>
            )
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setIsLeaveConfirmOpen(false)}
          onConfirm={handleConfirmLeave}
        />
      </ModalOverlay>
    </main>
  );
};

export default ConcertRegisterPage;
