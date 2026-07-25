import DefaultAvatar from "@/assets/images/IMG_my.svg";

interface ProfileSummaryProps {
  name: string;
  subtitle: string;
  bandLabel: string;
  onSwitchBand: () => void;
}

export const ProfileSummary = ({
  name,
  subtitle,
  bandLabel,
  onSwitchBand,
}: ProfileSummaryProps) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={DefaultAvatar}
          alt=""
          className="size-14 shrink-0 rounded-full object-cover"
        />

        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-label1 text-neutral-900">{name}</h2>
          <p className="truncate text-caption2 text-neutral-700">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSwitchBand}
        className="flex shrink-0 items-center gap-1 rounded-full bg-secondary-400 px-3.5 py-1.5 text-caption3 text-neutral-0"
      >
        {bandLabel}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};
