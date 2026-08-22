import { useRef, useState, type PointerEvent } from "react";

const DRAG_CLOSE_THRESHOLD_PX = 80;

export const useDragToCloseSheet = (
  isVisible: boolean,
  onClose: () => void,
) => {
  const [dragPhase, setDragPhase] = useState<"idle" | "dragging" | "closing">(
    "idle",
  );
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartYRef = useRef(0);

  const handleDragStart = (event: PointerEvent<HTMLDivElement>) => {
    setDragPhase("dragging");
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragPhase !== "dragging") return;

    setDragOffset(Math.max(0, event.clientY - dragStartYRef.current));
  };

  const handleDragEnd = () => {
    if (dragPhase !== "dragging") return;

    if (dragOffset > DRAG_CLOSE_THRESHOLD_PX) {
      // Animate off-screen ourselves instead of snapping dragOffset back to
      // 0: isVisible flips to false a frame later (via useSlideUpSheet's
      // rAF-deferred effect), so resetting now would flash the sheet back
      // to its fully open position for a frame before it slides shut.
      setDragPhase("closing");
      setDragOffset(window.innerHeight);
      onClose();
      return;
    }

    setDragPhase("idle");
    setDragOffset(0);
  };

  const translateY =
    dragPhase === "idle"
      ? isVisible
        ? "0px"
        : "100%"
      : `${dragOffset}px`;

  return {
    dragPhase,
    translateY,
    dragHandleProps: {
      onPointerDown: handleDragStart,
      onPointerMove: handleDragMove,
      onPointerUp: handleDragEnd,
      onPointerCancel: handleDragEnd,
    },
  };
};
