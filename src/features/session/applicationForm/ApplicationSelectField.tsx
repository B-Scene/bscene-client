// src/features/session/applicationForm/ApplicationSelectField.tsx

interface ApplicationSelectFieldProps {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}

export const ApplicationSelectField = ({
  value,
  placeholder,
  options,
  onChange,
}: ApplicationSelectFieldProps) => {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`h-[30px] w-full appearance-none rounded-[5px] border border-neutral-400 bg-neutral-0 px-4 pr-10 text-caption2 outline-none focus:border-secondary-500 ${
          value
            ? "text-neutral-900"
            : "text-neutral-500"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-2 -translate-y-[70%] rotate-45 border-r border-b border-neutral-500"
      />
    </div>
  );
};