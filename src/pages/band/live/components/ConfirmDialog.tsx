import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";

interface ConfirmDialogProps {
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const descriptionNode = description.split("\n").map((line, index, lines) => (
    <span key={line + index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));

  return (
    <ModalOverlay open onClose={onCancel}>
      <Modal
        tone="orange"
        title={title}
        description={descriptionNode}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </ModalOverlay>
  );
}
