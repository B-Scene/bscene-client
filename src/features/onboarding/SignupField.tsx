type FieldLabelProps = {
  children: string;
  required?: boolean;
};

export const FieldLabel = ({ children, required = false }: FieldLabelProps) => {
  return (
    <label className="mb-2 block text-body1 font-semibold text-neutral-900">
      {children}
      {required && <span className="text-error">*</span>}
    </label>
  );
};

type SignupFieldProps = {
  label: string;
  required?: boolean;
  description?: string;
  placeholder: string;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export const SignupField = ({
  label,
  required = false,
  description,
  placeholder,
  value,
  type = "text",
  disabled = false,
  onChange,
}: SignupFieldProps) => {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      {description && (
        <p className="mb-2 text-caption2 text-neutral-500">{description}</p>
      )}

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[46px] w-full rounded-lg border border-neutral-400 px-4 text-body2 font-medium outline-none placeholder:text-neutral-400 focus:border-primary-500 ${
          disabled
            ? "cursor-not-allowed bg-neutral-100 text-neutral-500"
            : "bg-neutral-0 text-neutral-900"
        }`}
      />
    </div>
  );
};