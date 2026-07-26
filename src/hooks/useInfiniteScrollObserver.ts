import { useEffect, useRef } from "react";

interface UseInfiniteScrollObserverOptions {
  enabled: boolean;
  onIntersect: () => void;
}

export const useInfiniteScrollObserver = ({
  enabled,
  onIntersect,
}: UseInfiniteScrollObserverOptions) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !enabled) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onIntersect();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return targetRef;
};
