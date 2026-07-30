interface IconProps {
  className?: string;
}

interface StarIconProps extends IconProps {
  active: boolean;
}

export const ChevronDownIcon = ({ className }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 4.5 6 7.5 9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const TuneIcon = ({ className }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M4 8h20M4 14h20M4 20h20" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="10" cy="8" r="2.2" fill="var(--color-neutral-0)" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="18" cy="14" r="2.2" fill="var(--color-neutral-0)" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="13" cy="20" r="2.2" fill="var(--color-neutral-0)" stroke="currentColor" strokeWidth="2.1" />
    </svg>
  );
};

export const StarIcon = ({ active, className }: StarIconProps) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 2.8 2.83 5.74 6.33.92-4.58 4.46 1.08 6.3L12 17.25l-5.66 2.97 1.08-6.3-4.58-4.46 6.33-.92L12 2.8Z"
        fill={active ? "var(--color-secondary-500)" : "none"}
        stroke={active ? "var(--color-secondary-500)" : "var(--color-neutral-400)"}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const PlusIcon = ({ className }: IconProps) => {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 7v22M7 18h22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};
