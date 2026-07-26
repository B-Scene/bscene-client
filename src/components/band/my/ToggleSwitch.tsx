// src/components/band/my/ToggleSwitch.tsx

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  tone?: "primary" | "secondary";
  disabled?: boolean;
}

export const ToggleSwitch = ({
  checked,
  onChange,
  label,
  tone = "secondary",
  disabled = false,
}: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked
          ? tone === "primary"
            ? "bg-primary-400"
            : "bg-secondary-500"
          : "bg-neutral-400"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span
        className={`size-5 rounded-full bg-neutral-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.25)] transition-transform ${
          checked
            ? "translate-x-5"
            : "translate-x-0"
        }`}
      />
    </button>
  );
};
