import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { Input } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import CalendarIcon from "@/assets/icons/data-range.svg";
import ClockIcon from "@/assets/icons/clock-band.svg";
import UploadIcon from "@/assets/icons/add-image.svg";
import TrashIcon from "@/assets/icons/delete.svg";
import Number1CircleIcon from "@/assets/icons/number1-circle.svg";
import Number2CircleIcon from "@/assets/icons/number2-circle.svg";
import Number2CircleActiveIcon from "@/assets/icons/number2-circle-active.svg";
import CheckCircleYellowIcon from "@/assets/icons/check-circle-yellow.svg";

const GENRE_OPTIONS = [
  "록",
  "인디팝",
  "펑크",
  "메탈",
  "재즈",
  "블루스",
  "R&B",
  "어쿠스틱",
  "포크",
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
  "충청",
  "전라",
  "경상",
  "강원",
  "제주",
];

const DESCRIPTION_MAX_LENGTH = 500;

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
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  const [date, setDate] = useState("");
  const [time] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [ticketLinks, setTicketLinks] = useState<string[]>([""]);

  const [showStep1Errors, setShowStep1Errors] = useState(false);
  const [showStep2Errors, setShowStep2Errors] = useState(false);

  const isStep1Valid = Boolean(
    title.trim() && genre && region && description.trim(),
  );
  const isStep2Valid = Boolean(date && location.trim() && price.trim());

  const titleError = showStep1Errors && !title.trim();
  const genreError = showStep1Errors && !genre;
  const regionError = showStep1Errors && !region;
  const descriptionError = showStep1Errors && !description.trim();

  const dateError = showStep2Errors && !date;
  const locationError = showStep2Errors && !location.trim();
  const priceError = showStep2Errors && !price.trim();

  const handlePosterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPosterUrl(URL.createObjectURL(file));
  };

  const handleTicketLinkChange = (index: number, value: string) => {
    setTicketLinks((prev) =>
      prev.map((link, linkIndex) => (linkIndex === index ? value : link)),
    );
  };

  const handleRemoveTicketLink = (index: number) => {
    setTicketLinks((prev) =>
      prev.filter((_, linkIndex) => linkIndex !== index),
    );
  };

  const handleAddTicketLink = () => {
    setTicketLinks((prev) => [...prev, ""]);
  };

  const handleFillTestData = () => {
    setTitle("테스트 공연");
    setGenre(GENRE_OPTIONS[0]);
    setRegion(REGION_OPTIONS[0]);
    setDescription("테스트용으로 채운 공연 소개입니다.");
    setDate("2026-05-26");
    setLocation("테스트 공연장");
    setPrice("30000");
  };

  const handleNext = () => {
    if (!isStep1Valid) {
      setShowStep1Errors(true);
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!isStep2Valid) {
      setShowStep2Errors(true);
      return;
    }
    navigate("/band/register/complete", {
      state: {
        title: "공연이 등록됐어요",
        description: "팔로워들에게 공연 소식이\n전달됐어요",
        rows: [
          { label: "공연명", value: title },
          { label: "날짜", value: `${date.replaceAll("-", ".")}.` },
          { label: "장소", value: location },
        ],
        primaryLabel: "공연 상세 보기",
        primaryTo: "/band/home",
      },
    });
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-secondary-0 pb-40">
      <Header title="공연 등록" />

      {import.meta.env.DEV ? (
        <button
          type="button"
          onClick={handleFillTestData}
          className="mx-5 mt-2 self-start rounded-full border border-secondary-500 px-3 py-1 text-caption4 text-secondary-500"
        >
          테스트 데이터 채우기 (dev only)
        </button>
      ) : null}

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
                    options={GENRE_OPTIONS}
                    placeholder="장르 선택"
                    error={genreError}
                    className="w-full"
                  />
                </Field>

                <Field label="지역" required error={regionError}>
                  <Select
                    value={region}
                    onChange={setRegion}
                    options={REGION_OPTIONS}
                    placeholder="지역 선택"
                    error={regionError}
                    className="w-full"
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
              </>
            ) : (
              <>
                <Field label="공연 날짜" required error={dateError}>
                  <div
                    className={`relative flex w-full items-center rounded-[5px] border px-4 py-1.25 focus-within:border-secondary-500 ${
                      dateError ? "border-error" : "border-neutral-400"
                    }`}
                  >
                    <span
                      className={`flex-1 text-caption2 ${date ? "text-neutral-900" : "text-neutral-500"}`}
                    >
                      {date || "날짜 선택"}
                    </span>
                    <img
                      src={CalendarIcon}
                      alt=""
                      className="size-4 shrink-0"
                    />
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </div>
                </Field>

                <Field label="공연 시작 시간">
                  <div className="flex w-full items-center rounded-[5px] border border-neutral-400 px-4 py-1.25">
                    <span
                      className={`flex-1 text-caption2 ${time ? "text-neutral-900" : "text-neutral-500"}`}
                    >
                      {time || "시간 선택"}
                    </span>
                    <img src={ClockIcon} alt="" className="size-4 shrink-0" />
                  </div>
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
                  <div className="flex flex-col gap-2.5">
                    {ticketLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={link}
                          onChange={(event) =>
                            handleTicketLinkChange(index, event.target.value)
                          }
                          placeholder="예매 링크 또는 관련 게시글 링크를 첨부해주세요"
                          className="w-full rounded-[5px] px-4 py-1.25"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTicketLink(index)}
                          aria-label="링크 삭제"
                          className="flex size-6 shrink-0 items-center justify-center"
                        >
                          <img src={TrashIcon} alt="" className="size-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddTicketLink}
                      className="flex w-full items-center justify-center rounded-[5px] border border-secondary-500 py-1.25 text-caption2 text-secondary-500"
                    >
                      + 링크 추가
                    </button>
                  </div>
                </Field>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] px-5">
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
            className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 ${
              isStep2Valid
                ? "bg-secondary-500 text-neutral-0"
                : "bg-neutral-300 text-neutral-600"
            }`}
          >
            공연 등록
          </button>
        )}
      </div>
    </main>
  );
};

export default ConcertRegisterPage;
