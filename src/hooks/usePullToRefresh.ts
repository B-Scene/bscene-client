import { useEffect, useRef, useState } from "react";

interface UsePullToRefreshParams {
  enabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
  onRefresh: () => Promise<unknown> | unknown;
  getScrollTop?: () => number;
}

export const usePullToRefresh = <T extends HTMLElement>({
  enabled = true,
  threshold = 72,
  maxPullDistance = 96,
  onRefresh,
  getScrollTop,
}: UsePullToRefreshParams) => {
  const containerRef = useRef<T | null>(null);

  const onRefreshRef = useRef(onRefresh);
  const getScrollTopRef = useRef(getScrollTop);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    getScrollTopRef.current = getScrollTop;
  }, [getScrollTop]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !enabled) {
      return;
    }

    const getCurrentScrollTop = () => {
      if (getScrollTopRef.current) {
        return getScrollTopRef.current();
      }

      return document.scrollingElement?.scrollTop ?? window.scrollY ?? 0;
    };

    const isAtTop = () => getCurrentScrollTop() <= 0;

    const resetPull = () => {
      isPullingRef.current = false;
      startYRef.current = 0;
      setPullDistance(0);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!enabled || isRefreshingRef.current || !isAtTop()) {
        return;
      }

      startYRef.current = event.touches[0]?.clientY ?? 0;
      isPullingRef.current = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isPullingRef.current || isRefreshingRef.current) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const rawDistance = currentY - startYRef.current;

      if (rawDistance <= 0) {
        setPullDistance(0);
        return;
      }

      if (!isAtTop()) {
        resetPull();
        return;
      }

      const nextDistance = Math.min(rawDistance * 0.45, maxPullDistance);

      if (nextDistance > 0 && event.cancelable) {
        event.preventDefault();
      }

      setPullDistance(nextDistance);
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isRefreshingRef.current) {
        resetPull();
        return;
      }

      const shouldRefresh = pullDistance >= threshold;

      if (!shouldRefresh) {
        resetPull();
        return;
      }

      isPullingRef.current = false;
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefreshRef.current();
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setPullDistance(0);
      }
    };

    const handleTouchCancel = () => {
      if (!isRefreshingRef.current) {
        resetPull();
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [enabled, maxPullDistance, pullDistance, threshold]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isReadyToRefresh: pullDistance >= threshold,
  };
};