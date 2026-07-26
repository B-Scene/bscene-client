import type { ChangeEvent, ReactNode } from "react";

import ArrowDownGrayIcon from "@/assets/icons/band/arrow-down-gray.svg";

import { joinClassNames } from "./sessionRecruitmentForm.utils";

export const RecruitmentFieldLabel = ({
  children,
  htmlFor,
  required = false,
}: {
  children: string;
  htmlFor?: string;
  required?: boolean;
}) => (
  <label htmlFor={htmlFor} className="mb-1 block text-body1 text-neutral-900">
    {children}
    {required ? <span className="text-error"> *</span> : null}
  </label>
);

export const RecruitmentTextInput = ({
  id,
  value,
  placeholder,
  error = false,
  maxLength,
  onChange,
}: {
  id: string;
  value: string;
  placeholder: string;
  error?: boolean;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => (
  <input
    id={id}
    value={value}
    maxLength={maxLength}
    placeholder={placeholder}
    onChange={onChange}
    className={joinClassNames(
      "h-[30px] w-full rounded-[5px] border bg-neutral-0 px-4 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500",
      error ? "border-error" : "border-neutral-400 focus:border-secondary-500",
    )}
  />
);

export const RecruitmentSelectButton = ({
  value,
  placeholder,
  error = false,
  onClick,
}: {
  value: string;
  placeholder: string;
  error?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={joinClassNames(
      "flex h-[30px] w-full items-center justify-between rounded-[5px] border bg-neutral-0 px-4 text-caption2",
      error ? "border-error" : "border-neutral-400",
      value ? "text-neutral-900" : "text-neutral-500",
    )}
  >
    <span>{value || placeholder}</span>
    <img src={ArrowDownGrayIcon} alt="" className="h-[7px] w-3" />
  </button>
);

export const RecruitmentDeadlinePickerButton = ({
  value,
  placeholder,
  icon,
  error = false,
  onClick,
}: {
  value: string;
  placeholder: string;
  icon: string;
  error?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={joinClassNames(
      "flex h-[30px] w-full items-center justify-between rounded-[5px] border bg-neutral-0 px-4 text-caption2",
      error ? "border-error" : "border-neutral-400",
      value ? "text-neutral-900" : "text-neutral-500",
    )}
  >
    <span>{value || placeholder}</span>
    <img src={icon} alt="" className="size-[18px]" />
  </button>
);

export const RecruitmentOptionChip = ({
  children,
  selected,
  onClick,
}: {
  children: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={joinClassNames(
      "flex h-[26px] min-w-14 items-center justify-center whitespace-nowrap rounded-[8px] px-2 text-caption2",
      selected
        ? "bg-secondary-500 text-neutral-0"
        : "bg-neutral-300 text-neutral-600",
    )}
  >
    {children}
  </button>
);

export const RecruitmentBottomActionButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void | Promise<void>;
}) => (
  <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-20 bg-secondary-0 px-5 py-5">
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      className={joinClassNames(
        "flex h-[52px] w-full items-center justify-center rounded-[12px] text-label2",
        active
          ? "bg-secondary-500 text-neutral-0"
          : "bg-neutral-300 text-neutral-700",
      )}
    >
      {label}
    </button>
  </div>
);

export const RecruitmentErrorMessage = ({ children }: { children: ReactNode }) => (
  <p className="mt-1 text-[10px] leading-3 font-bold text-error">{children}</p>
);
