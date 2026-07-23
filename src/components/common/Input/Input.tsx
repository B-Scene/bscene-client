import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = ({ error, className = "", ...props }: InputProps) => {
  return (
    <input
      className={`border bg-neutral-0 px-4 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500 ${
        error ? "border-error" : "border-neutral-400 focus:border-secondary-500"
      } ${className}`}
      {...props}
    />
  );
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = ({
  error,
  className = "",
  ...props
}: TextareaProps) => {
  return (
    <textarea
      className={`resize-none border bg-neutral-0 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500 ${
        error ? "border-error" : "border-neutral-400 focus:border-secondary-500"
      } ${className}`}
      {...props}
    />
  );
};
