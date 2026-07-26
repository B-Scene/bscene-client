// src/features/session/applicationForm/SessionApplicationFormModals.tsx

import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import type { SessionApplicationFormController } from "@/features/session/applicationForm/useSessionApplicationForm";

interface SessionApplicationFormModalsProps {
  controller: SessionApplicationFormController;
}

export const SessionApplicationFormModals = ({
  controller,
}: SessionApplicationFormModalsProps) => {
  const {
    isEditMode,
    isCancelModalOpen,
    isSaveModalOpen,
    handleCancelModalClose,
    handleConfirmClose,
    handleSaveModalClose,
    submitApplication,
  } = controller;

  return (
    <>
      <ModalOverlay
        open={isCancelModalOpen}
        onClose={handleCancelModalClose}
      >
        <Modal
          tone="orange"
          title={
            isEditMode
              ? "지원서 수정을 취소할까요?"
              : "지원서 작성을 취소할까요?"
          }
          description={
            <>
              입력한 내용은 저장되지 않고
              <br />
              사라집니다.
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={handleCancelModalClose}
          onConfirm={handleConfirmClose}
        />
      </ModalOverlay>

      <ModalOverlay open={isSaveModalOpen} onClose={handleSaveModalClose}>
        <Modal
          tone="orange"
          title="지원서를 저장할까요?"
          description={
            <>
              수정한 내용으로
              <br />
              지원서를 저장해요.
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={handleSaveModalClose}
          onConfirm={submitApplication}
        />
      </ModalOverlay>
    </>
  );
};