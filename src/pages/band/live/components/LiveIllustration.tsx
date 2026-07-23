import LiveMicIcon from "@/assets/icons/live_mic.svg";

export function LiveIllustration() {
  return (
    <div
      className="relative flex h-[98px] w-[118px] shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute top-[21px] left-0 text-[18px] text-secondary-500">♪</span>
      <span className="absolute top-[57px] left-4 text-[13px] text-secondary-500">♪</span>
      <span className="absolute top-[25px] right-0 text-[17px] text-secondary-500">♫</span>
      <span className="absolute top-[58px] right-5 text-[14px] text-secondary-500">♪</span>
      <img src={LiveMicIcon} alt="" className="relative z-10 h-[98px] w-[94px] object-contain" />
    </div>
  );
}
