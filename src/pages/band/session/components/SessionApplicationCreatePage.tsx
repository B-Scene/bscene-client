// src/pages/band/session/components/SessionApplicationCreatePage.tsx

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

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+32px)]">
      <SessionApplicationFormHeader
        title={controller.headerTitle}
        onBack={controller.handleRequestClose}
        onClose={controller.handleRequestClose}
      />

      <SessionApplicationForm controller={controller} />

      <SessionApplicationFormModals controller={controller} />
    </main>
  );
};