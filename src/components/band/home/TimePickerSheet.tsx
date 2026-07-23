import { useEffect, useState, type ChangeEvent } from "react";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";

interface TimePickerSheetProps {
  open: boolean;
  value: string;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

const parseValue = (value: string) => {
  const [hour = "", minute = ""] = value.split(":");
  return { hour, minute };
};

const clamp = (value: string, max: number) => {
  if (!value) return "";
  const num = Math.min(Number(value), max);
  return String(num);
};

const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 2);

export const TimePickerSheet = ({
  open,
  value,
  onClose,
  onConfirm,
}: TimePickerSheetProps) => {
  const [hour, setHour] = useState(() => parseValue(value).hour);
  const [minute, setMinute] = useState(() => parseValue(value).minute);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const { rendered, isVisible, handleTransitionEnd } = useSlideUpSheet(
    open,
    () => {
      const parsed = parseValue(value);
      setHour(parsed.hour);
      setMinute(parsed.minute);
    },
    () => setKeyboardOffset(0),
  );

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!open || !viewport) return;

    const handleViewportChange = () => {
      const offset = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };

    viewport.addEventListener("resize", handleViewportChange);
    viewport.addEventListener("scroll", handleViewportChange);

    return () => {
      viewport.removeEventListener("resize", handleViewportChange);
      viewport.removeEventListener("scroll", handleViewportChange);
    };
  }, [open]);

  const handleHourChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHour(onlyDigits(event.target.value));
  };

  const handleMinuteChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMinute(onlyDigits(event.target.value));
  };

  const handleConfirm = () => {
    const clampedHour = clamp(hour, 23);
    const clampedMinute = clamp(minute, 59);

    if (!clampedHour && !clampedMinute) {
      onConfirm("");
      return;
    }

    onConfirm(
      `${clampedHour.padStart(2, "0")}:${clampedMinute.padStart(2, "0")}`,
    );
  };

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-neutral-900/50 transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        onTransitionEnd={handleTransitionEnd}
        style={{ marginBottom: keyboardOffset }}
        className={`relative z-10 flex w-full flex-col items-center gap-4 rounded-t-3xl bg-neutral-0 px-3.75 pt-2 pb-16 transition-[transform,margin-bottom] duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pb-3">
          <div className="h-1 w-11 shrink-0 rounded bg-[#DEDEDE]" />
        </div>

        <div className="flex w-full flex-col items-center gap-6">
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center px-4">
            <span aria-hidden="true" />

            <h2 className="justify-self-center text-label1 text-neutral-900">
              공연 시작 시간
            </h2>

            <button
              type="button"
              onClick={handleConfirm}
              className="justify-self-end text-right text-body1 text-secondary-500"
            >
              확인
            </button>
          </div>

          <div className="flex items-center justify-center gap-6">
            <input
              type="text"
              inputMode="numeric"
              value={hour}
              onChange={handleHourChange}
              onBlur={() => setHour((prev) => clamp(prev, 23))}
              className="h-10 w-13 rounded-[5px] border-2 border-neutral-400 text-center text-h4 text-neutral-900 outline-none focus:border-secondary-500"
            />

            <span className="text-h4 text-neutral-900">:</span>

            <input
              type="text"
              inputMode="numeric"
              value={minute}
              onChange={handleMinuteChange}
              onBlur={() => setMinute((prev) => clamp(prev, 59))}
              className="h-10 w-13 rounded-[5px] border-2 border-neutral-400 text-center text-h4 text-neutral-900 outline-none focus:border-secondary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
