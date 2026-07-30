// src/features/session/applicationForm/ApplicationFormField.tsx

import type { ReactNode } from "react";

interface ApplicationFormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export const ApplicationFormField = ({
  label,
  required = false,
  children,
}: ApplicationFormFieldProps) => {
  return (
    <div>
      <div className="mb-[6px] flex items-center">
        <span className="text-body1 text-neutral-900">
          {label}
        </span>

        {required ? (
          <span
            aria-hidden="true"
            className="ml-1 text-body1 text-error"
          >
            *
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
};