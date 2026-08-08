interface PullToRefreshSpinnerProps {
  pullDistance: number;
  isRefreshing: boolean;
  top?: string | number;
}

export const PullToRefreshSpinner = ({
  pullDistance,
  isRefreshing,
  top = "calc(env(safe-area-inset-top) + 72px)",
}: PullToRefreshSpinnerProps) => {
  const shouldShow = pullDistance >= 24 || isRefreshing;

  if (!shouldShow) {
    return null;
  }

  const visibleDistance = Math.min(pullDistance, 52);
  const opacity = Math.min(1, Math.max(0.35, pullDistance / 80));

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-[70] flex size-9 items-center justify-center rounded-full bg-neutral-0 shadow-[0_4px_18px_rgba(0,0,0,0.18)]"
      style={{
        top,
        opacity,
        transform: `translate(-50%, ${visibleDistance}px)`,
      }}
    >
      <div className="size-5 animate-spin rounded-full border-2 border-neutral-300 border-t-secondary-500" />
    </div>
  );
};