import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { Input, Textarea } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import CalendarIcon from "@/assets/icons/calendar.svg";
import ClockIcon from "@/assets/icons/clock.svg";
import ImageUploadIcon from "@/assets/icons/image-upload.svg";
import TrashIcon from "@/assets/icons/trash.svg";

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

type Step = 1 | 2;

interface StepIndicatorProps {
  step: Step;
}

const StepIndicator = ({ step }: StepIndicatorProps) => {
  const circleClass = (stepId: Step) =>
    `flex size-6 shrink-0 items-center justify-center rounded-full text-caption3 font-semibold ${
      step >= stepId
        ? "bg-secondary-500 text-neutral-0"
        : "bg-neutral-300 text-neutral-500"
    }`;

  const labelClass = (stepId: Step) =>
    `text-caption3 ${step === stepId ? "text-secondary-500" : "text-neutral-500"}`;

  return (
    <div className="flex items-center justify-center gap-3 bg-secondary-0 py-4">
      <div className="flex flex-col items-center gap-1">
        <div className={circleClass(1)}>
          {step > 1 ? (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 5L4.5 8.5L11 1"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            "1"
          )}
        </div>
        <span className={labelClass(1)}>기본 정보</span>
      </div>

      <div
        className={`h-0.5 w-16 ${step > 1 ? "bg-secondary-500" : "bg-neutral-300"}`}
      />

      <div className="flex flex-col items-center gap-1">
        <div className={circleClass(2)}>2</div>
        <span className={labelClass(2)}>일정 & 장소</span>
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

const Field = ({ label, required, children }: FieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-body1 text-neutral-900">
      {label} {required ? <span className="text-body1 text-error">*</span> : null}
    </label>
    {children}
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
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [ticketLinks, setTicketLinks] = useState<string[]>([""]);

  const isStep1Valid = Boolean(
    title.trim() && genre && region && description.trim(),
  );
  const isStep2Valid = Boolean(date && time && location.trim() && price.trim());

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
    setTicketLinks((prev) => prev.filter((_, linkIndex) => linkIndex !== index));
  };

  const handleAddTicketLink = () => {
    setTicketLinks((prev) => [...prev, ""]);
  };

  const handleNext = () => {
    if (!isStep1Valid) return;
    setStep(2);
  };

  const handleSubmit = () => {
    if (!isStep2Valid) return;
    navigate("/band/home");
  };

  return (
    <main className="relative min-h-dvh bg-secondary-0 pb-40">
      <Header title="공연 등록" />
      <StepIndicator step={step} />

      <section className="px-5 pt-5">
        <div className="flex flex-col gap-5 rounded-2xl bg-neutral-0 p-4 shadow-[0_0_8px_0_rgba(0,0,0,0.08)]">
          {step === 1 ? (
            <>
              <Field label="공연명" required>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="공연 제목을 입력해주세요"
                  className="h-11 w-full rounded-[5px] px-4"
                />
              </Field>

              <Field label="장르" required>
                <Select
                  value={genre}
                  onChange={setGenre}
                  options={GENRE_OPTIONS}
                  placeholder="장르 선택"
                  className="w-full"
                />
              </Field>

              <Field label="지역" required>
                <Select
                  value={region}
                  onChange={setRegion}
                  options={REGION_OPTIONS}
                  placeholder="지역 선택"
                  className="w-full"
                />
              </Field>

              <Field label="공연 소개" required>
                <div className="relative">
                  <Textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH))
                    }
                    placeholder="공연에 대해 소개해주세요"
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    className="h-24 w-full rounded-[5px] p-4"
                  />
                  <span className="absolute bottom-2 right-3 text-caption4 text-neutral-500">
                    {description.length}/{DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
              </Field>

              <Field label="공연 포스터">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-[5px] border border-dashed border-neutral-400 bg-neutral-0"
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt="공연 포스터"
                      className="h-full w-full rounded-[5px] object-cover"
                    />
                  ) : (
                    <>
                      <img src={ImageUploadIcon} alt="" className="size-8" />
                      <span className="text-caption2 text-neutral-500">
                        공연 포스터를 업로드해주세요
                      </span>
                    </>
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
              <Field label="공연 날짜" required>
                <div className="relative flex h-11 w-full items-center rounded-[5px] border border-neutral-400 px-4 focus-within:border-secondary-500">
                  <span
                    className={`flex-1 text-caption2 ${date ? "text-neutral-900" : "text-neutral-500"}`}
                  >
                    {date || "날짜 선택"}
                  </span>
                  <img src={CalendarIcon} alt="" className="size-4 shrink-0" />
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </Field>

              <Field label="공연 시작 시간" required>
                <div className="relative flex h-11 w-full items-center rounded-[5px] border border-neutral-400 px-4 focus-within:border-secondary-500">
                  <span
                    className={`flex-1 text-caption2 ${time ? "text-neutral-900" : "text-neutral-500"}`}
                  >
                    {time || "시간 선택"}
                  </span>
                  <img src={ClockIcon} alt="" className="size-4 shrink-0" />
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </Field>

              <Field label="공연 장소" required>
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="공연 장소를 작성해주세요"
                  className="h-11 w-full rounded-[5px] px-4"
                />
              </Field>

              <Field label="티켓 가격" required>
                <Input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="티켓 가격을 작성해주세요"
                  className="h-11 w-full rounded-[5px] px-4"
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
                        className="h-11 w-full rounded-[5px] px-4"
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
                    className="flex h-11 w-full items-center justify-center rounded-[5px] border border-secondary-500 text-body1 text-secondary-500"
                  >
                    + 링크 추가
                  </button>
                </div>
              </Field>
            </>
          )}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] px-5">
        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStep1Valid}
            className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 text-neutral-0 disabled:cursor-not-allowed ${
              isStep1Valid ? "bg-secondary-500" : "bg-neutral-400"
            }`}
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isStep2Valid}
            className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 text-neutral-0 disabled:cursor-not-allowed ${
              isStep2Valid ? "bg-secondary-500" : "bg-neutral-400"
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
