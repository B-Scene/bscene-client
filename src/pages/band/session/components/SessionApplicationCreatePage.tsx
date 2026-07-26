// src/pages/band/session/components/SessionApplicationCreatePage.tsx

import { createPortal } from "react-dom";

import { SessionApplicationForm } from "@/features/session/applicationForm/SessionApplicationForm";
import { SessionApplicationFormHeader } from "@/features/session/applicationForm/SessionApplicationFormHeader";
import { SessionApplicationFormModals } from "@/features/session/applicationForm/SessionApplicationFormModals";
import type {
  SessionApplicationDraft,
  SessionApplicationFormMode,
} from "@/features/session/applicationForm/applicationForm.types";
import { useSessionApplicationForm } from "@/features/session/applicationForm/useSessionApplicationForm";

interface SessionApplicationCreatePageProps {
  open: boolean;
  mode?: SessionApplicationFormMode;
  initialValue?: SessionApplicationDraft | null;
  onClose: () => void;
  onSubmit: (application: SessionApplicationDraft) => void;
}

export const SessionApplicationCreatePage = ({
  open,
  mode = "create",
  initialValue = null,
  onClose,
  onSubmit,
}: SessionApplicationCreatePageProps) => {
  if (!open) {
    return null;
  }

  return (
    <SessionApplicationCreatePageContent
      mode={mode}
      initialValue={initialValue}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

type SessionApplicationCreatePageContentProps = Omit<
  SessionApplicationCreatePageProps,
  "open"
>;

const SessionApplicationCreatePageContent = ({
  mode = "create",
  initialValue = null,
  onClose,
  onSubmit,
}: SessionApplicationCreatePageContentProps) => {
  const controller = useSessionApplicationForm({
    open: true,
    mode,
    initialValue,
    onClose,
    onSubmit,
  });

  return createPortal(
    <main className="fixed inset-0 z-[99999] mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
      <SessionApplicationFormHeader
        title={controller.headerTitle}
        onBack={controller.handleRequestClose}
        onClose={controller.handleRequestClose}
      />

      <SessionApplicationForm controller={controller} />

      <SessionApplicationFormModals controller={controller} />
    </main>,
    document.body,
  );
};
