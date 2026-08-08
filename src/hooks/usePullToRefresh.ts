import { useEffect, useRef, useState } from "react";

interface UsePullToRefreshParams {
  enabled?: boolean;
  threshold?: number;
  activationDistance?: number;
  maxPullDistance?: number;
  onRefresh: () => Promise<unknown> | unknown;
}

const getDocumentScrollTop = () => {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
};

const isDocumentScrollElement = (element: Element | null) => {
  return (
    element === document.scrollingElement ||
    element === document.documentElement ||
    element === document.body
  );
};

const getScrollTop = (element: HTMLElement | Element | null) => {
  if (!element || isDocumentScrollElement(element)) {
    return getDocumentScrollTop();
  }

  return (element as HTMLElement).scrollTop;
};

const isScrollable = (element: Element) => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;

  const canScroll =
    overflowY === "auto" ||
    overflowY === "scroll" ||
    overflowY === "overlay";

  return canScroll && element.scrollHeight > element.clientHeight + 1;
};

const findScrollContainer = (
  target: EventTarget | null,
  root: HTMLElement,
): HTMLElement | Element | null => {
  let element = target instanceof Element ? target : null;

  while (element) {
    if (isScrollable(element)) {
      return element;
    }

    if (element === root) {
      break;
    }

    element = element.parentElement;
  }

  return document.scrollingElement || document.documentElement;
};

export const usePullToRefresh = <T extends HTMLElement>({
  enabled = true,
  threshold = 76,
  activationDistance = 18,
  maxPullDistance = 104,
  onRefresh,
}: UsePullToRefreshParams) => {
  const containerRef = useRef<T | null>(null);

  const onRefreshRef = useRef(onRefresh);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const scrollContainerRef = useRef<HTMLElement | Element | null>(null);

  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const [pullDistance, setPullDistanceState] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setPullDistance = (distance: number) => {
    pullDistanceRef.current = distance;
    setPullDistanceState(distance);
  };

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !enabled) {
      return;
    }

    const isAtTop = () => {
      const scrollContainer = scrollContainerRef.current;

      return getScrollTop(scrollContainer) <= 2;
    };

    const resetPull = () => {
      isPullingRef.current = false;
      startYRef.current = 0;
      scrollContainerRef.current = null;
      setPullDistance(0);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!enabled || isRefreshingRef.current) {
        return;
      }

      const nextScrollContainer = findScrollContainer(event.target, container);

      scrollContainerRef.current = nextScrollContainer;

      if (getScrollTop(nextScrollContainer) > 2) {
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

      /**
       * 상단 Pull to Refresh 기준
       * 맨 위에서 손가락을 아래로 당기면 currentY가 커진다.
       */
      const rawDistance = currentY - startYRef.current;

      if (rawDistance <= activationDistance) {
        setPullDistance(0);
        return;
      }

      if (!isAtTop()) {
        resetPull();
        return;
      }

      const nextDistance = Math.min(
        (rawDistance - activationDistance) * 0.48,
        maxPullDistance,
      );

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

      const shouldRefresh = pullDistanceRef.current >= threshold;

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
        resetPull();
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
  }, [activationDistance, enabled, maxPullDistance, threshold]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isReadyToRefresh: pullDistance >= threshold,
  };
};