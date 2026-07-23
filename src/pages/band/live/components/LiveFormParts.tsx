import { useState, type ChangeEvent, type ReactNode } from "react";
import AddImageIcon from "@/assets/icons/band/add-image.svg";
import ArrowDownGrayIcon from "@/assets/icons/band/arrow-down-gray.svg";
import CalendarIcon from "@/assets/icons/band/data-range.svg";
import ClockIcon from "@/assets/icons/band/clock-band.svg";
import CoHostBackgroundIcon from "@/assets/icons/Background.svg";
import { cx } from "../utils";

export function ChoiceCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-[66px] flex-1 items-start gap-3 rounded-lg border px-3 py-3 text-left",
        selected ? "border-secondary-500 bg-secondary-0" : "border-neutral-300 bg-neutral-0",
      )}
    >
      <span
        className={cx(
          "mt-0.5 size-3 shrink-0 rounded-full border",
          selected ? "border-secondary-500 bg-secondary-500 shadow-[inset_0_0_0_3px_#fffaf0]" : "border-neutral-300",
        )}
      />
      <span className="min-w-0">
        <strong className="block text-caption3 text-neutral-900">{title}</strong>
        <span className="mt-0.5 block whitespace-pre-line text-caption4 leading-[12px] text-neutral-500">
          {description}
        </span>
      </span>
    </button>
  );
}

export function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[14px] bg-neutral-0 px-[18px] py-3 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <h2 className="text-body1 text-neutral-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextField({
  label,
  required,
  textarea,
  placeholder,
}: {
  label: string;
  required?: boolean;
  textarea?: boolean;
  placeholder: string;
}) {
  return (
    <label className="grid grid-cols-[76px_1fr] items-start gap-0 text-caption3 text-neutral-900">
      <span className="pt-1">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          className="h-[56px] resize-none rounded border border-neutral-300 px-4 py-1 text-caption2 outline-none placeholder:text-neutral-400"
        />
      ) : (
        <input
          placeholder={placeholder}
          className="h-7 rounded border border-neutral-300 px-4 text-caption2 outline-none placeholder:text-neutral-400"
        />
      )}
    </label>
  );
}

function ThumbnailField() {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailPreview(URL.createObjectURL(file));
  };

  return (
    <div className="grid grid-cols-[76px_56px_1fr] items-center gap-0 text-body3">
      <strong className="font-semibold text-neutral-900">썸네일 이미지</strong>
      <label
        aria-label="썸네일 이미지 추가"
        className="flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded border border-neutral-300 bg-neutral-0"
      >
        {thumbnailPreview ? (
          <img src={thumbnailPreview} alt="" className="size-full object-cover" />
        ) : (
          <img src={AddImageIcon} alt="" className="size-6" />
        )}
        <input type="file" accept="image/*" className="sr-only" onChange={handleThumbnailChange} />
      </label>
      <p className="ml-3 text-caption2 text-neutral-500">
        라이브를 대표할 이미지에요.
        <br />
        <span className="text-caption4 leading-[13px]">권장 사이즈 16:9 (1280*720)</span>
      </p>
    </div>
  );
}

export function LiveInfoFields() {
  return (
    <div className="grid gap-4">
      <TextField label="라이브 제목" required placeholder="라이브 제목을 입력해주세요" />
      <TextField label="라이브 소개" textarea placeholder="라이브에 대해 소개해주세요 (선택)" />
      <ThumbnailField />
    </div>
  );
}

export function DateTimeSelector() {
  return (
    <div className="rounded-lg border border-neutral-300 px-4 py-3">
      <button type="button" className="flex h-9 w-full items-center gap-4 text-left">
        <img src={CalendarIcon} alt="" className="size-6 shrink-0" />
        <span className="flex-1">
          <span className="block text-caption2 text-neutral-500">날짜 선택</span>
          <strong className="block text-body2 text-neutral-900">2026.05.24. (금)</strong>
        </span>
        <img src={ArrowDownGrayIcon} alt="" className="size-4 shrink-0" />
      </button>
      <div className="my-2 h-px bg-neutral-300" />
      <button type="button" className="flex h-9 w-full items-center gap-4 text-left">
        <img src={ClockIcon} alt="" className="size-6 shrink-0" />
        <span className="flex-1">
          <span className="block text-caption2 text-neutral-500">시작 시간</span>
          <strong className="block text-body2 text-neutral-900">20:00</strong>
        </span>
        <img src={ArrowDownGrayIcon} alt="" className="size-4 shrink-0" />
      </button>
    </div>
  );
}

export function CoHostCard() {
  return (
    <button
      type="button"
      className="flex h-16 w-full items-center rounded-[14px] bg-neutral-0 px-[18px] text-left shadow-[0_4px_15px_rgba(20,20,20,0.08)]"
    >
      <img src={CoHostBackgroundIcon} alt="" className="size-9 shrink-0" />
      <span className="ml-3 flex-1">
        <strong className="block text-caption3 text-neutral-900">공동 진행 (선택)</strong>
        <span className="block text-caption2 text-neutral-600">멤버와 함께 라이브를 진행할 수 있어요.</span>
      </span>
      <span className="text-[32px] leading-none text-neutral-300">›</span>
    </button>
  );
}

export function TestBroadcastCard() {
  return (
    <section className="flex h-[88px] items-center justify-between rounded-[14px] bg-neutral-0 px-[18px] shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <div>
        <h2 className="text-body1 text-neutral-900">테스트 방송</h2>
        <p className="mt-2 text-caption2 text-neutral-600">
          방송 전에 음질과 마이크를
          <br />
          테스트해보세요
        </p>
      </div>
      <button
        type="button"
        className="flex h-8 w-[82px] items-center justify-center rounded-lg bg-secondary-0 text-caption3 text-secondary-500"
      >
        테스트 시작
      </button>
    </section>
  );
}
