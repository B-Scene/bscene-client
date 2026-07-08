import { useState } from "react";
import ArrowDownGrayIcon from "@/assets/icons/band/arrow-down-gray.svg";
import ArrowDownYellowIcon from "@/assets/icons/band/arrow-down-yellow.svg";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
  error?: boolean;
}

export const Select = ({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  error = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-[5px] border px-4 py-1.25 text-caption2 ${
          isOpen ? "border-secondary-500" : error ? "border-error" : "border-neutral-400"
        } ${value ? "text-neutral-900" : "text-neutral-500"}`}
      >
        <span>{value || placeholder}</span>
        <img
          src={isOpen ? ArrowDownYellowIcon : ArrowDownGrayIcon}
          alt=""
          className="h-1.5 w-2.5 shrink-0"
        />
      </button>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full z-50 mt-1 flex flex-col gap-1 rounded-[5px] border border-secondary-500 bg-neutral-0 px-4 py-2.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="text-left text-caption3 text-neutral-600"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
