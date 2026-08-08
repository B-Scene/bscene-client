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

const isScrollable = (element: HTMLElement) => {
  return element.scrollHeight > element.clientHeight + 2;
};

const getPrimaryScrollElement = (container: HTMLElement) => {
  let element: HTMLElement | null = container;

  while (element && element !== document.body) {
    if (isScrollable(element)) {
      return element;
    }

    element = element.parentElement;
  }

  return document.scrollingElement || document.documentElement;
};

const getScrollTop = (element: Element | null) => {
  if (
    !element ||
    element === document.scrollingElement ||
    element === document.documentElement ||
    element === document.body
  ) {
    return getDocumentScrollTop();
  }

  return (element as HTMLElement).scrollTop;
};

export const usePullToRefresh = <T extends HTMLElement>({
  enabled = true,
  threshold = 80,
  activationDistance = 48,
  maxPullDistance = 104,
  onRefresh,
}: UsePullToRefreshParams) => {
  const containerRef = useRef<T | null>(null);
  const scrollElementRef = useRef<Element | null>(null);

  const onRefreshRef = useRef(onRefresh);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);

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

    const isEventInsideContainer = (event: TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return false;
      }

      return container.contains(target);
    };

    const isAtTop = () => {
      const scrollElement =
        scrollElementRef.current ?? getPrimaryScrollElement(container);

      const scrollTop = getScrollTop(scrollElement);
      const documentScrollTop = getDocumentScrollTop();

      return scrollTop <= 2 && documentScrollTop <= 2;
    };

    const resetPull = () => {
      isPullingRef.current = false;
      startYRef.current = 0;
      pullDistanceRef.current = 0;
      setPullDistanceState(0);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (
        !enabled ||
        isRefreshingRef.current ||
        !isEventInsideContainer(event)
      ) {
        return;
      }

      scrollElementRef.current = getPrimaryScrollElement(container);

      if (!isAtTop()) {
        return;
      }

      startYRef.current = event.touches[0]?.clientY ?? 0;
      isPullingRef.current = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isPullingRef.current || isRefreshingRef.current) {
        return;
      }

      if (!isAtTop()) {
        resetPull();
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const rawDistance = currentY - startYRef.current;

      if (rawDistance <= activationDistance) {
        setPullDistance(0);
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

      await onRefreshRef.current();
    };

    const handleTouchCancel = () => {
      if (!isRefreshingRef.current) {
        resetPull();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [activationDistance, enabled, maxPullDistance, threshold]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isReadyToRefresh: pullDistance >= threshold,
  };
};