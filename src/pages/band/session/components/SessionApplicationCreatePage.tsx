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
    <main className="frame-width fixed inset-0 z-[100] mx-auto flex h-dvh flex-col overflow-hidden bg-neutral-0">
      <SessionApplicationFormHeader
        title={controller.headerTitle}
        onBack={controller.handleRequestClose}
        onClose={controller.handleRequestClose}
      />

      <section className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <SessionApplicationForm controller={controller} />
      </section>

      <SessionApplicationFormModals controller={controller} />
    </main>,
    document.body,
  );
};
