import { useEffect, useState, type TouchEvent } from "react";

interface PhotoLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const PhotoLightbox = ({
  images,
  initialIndex,
  onClose,
}: PhotoLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);

  if (initialIndex !== prevInitialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
  }

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => Math.max(0, index - 1));
      }
      if (event.key === "ArrowRight") {
        setCurrentIndex((index) => Math.min(images.length - 1, index + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, onClose]);

  if (images.length === 0) return null;

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const SWIPE_THRESHOLD = 40;
    const deltaX = event.changedTouches[0].clientX - touchStartX;

    if (deltaX > SWIPE_THRESHOLD) {
      setCurrentIndex((index) => Math.max(0, index - 1));
    } else if (deltaX < -SWIPE_THRESHOLD) {
      setCurrentIndex((index) => Math.min(images.length - 1, index + 1));
    }

    setTouchStartX(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex flex-col bg-neutral-900"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute right-[16px] top-[16px] z-10 flex size-[36px] items-center justify-center rounded-full bg-neutral-900/60 text-neutral-0"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`이미지 ${currentIndex + 1}/${images.length}`}
          className="max-h-full max-w-full object-contain [dynamic-range-limit:standard]"
          onClick={(event) => event.stopPropagation()}
        />
      </div>

      {images.length > 1 ? (
        <div className="flex justify-center gap-[6px] pb-[24px]">
          {images.map((_, index) => (
            <span
              key={`lightbox-dot-${index}`}
              className={
                index === currentIndex
                  ? "size-[6px] rounded-full bg-neutral-0"
                  : "size-[6px] rounded-full bg-neutral-0/40"
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
