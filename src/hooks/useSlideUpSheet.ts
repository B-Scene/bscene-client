import { useEffect, useState } from "react";

const CLOSE_TIMEOUT_MS = 320;

export const useSlideUpSheet = (
  open: boolean,
  onOpen?: () => void,
  onClose?: () => void,
) => {
  const [rendered, setRendered] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open && !rendered) {
    setRendered(true);
  }

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }

  useEffect(() => {
    if (!rendered) return;

    const frame = requestAnimationFrame(() => setIsVisible(open));
    return () => cancelAnimationFrame(frame);
  }, [open, rendered]);

  useEffect(() => {
    if (open || !rendered) return;

    const timeout = setTimeout(() => setRendered(false), CLOSE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [open, rendered]);

  const handleTransitionEnd = () => {
    if (!open) setRendered(false);
  };

  return { rendered, isVisible, handleTransitionEnd };
};
