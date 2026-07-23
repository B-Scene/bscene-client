import type { ReactNode } from "react";
import DefaultAvatar from "@/assets/images/IMG_my.svg";

interface NotificationBandBannerProps {
  bandName: string;
  description: string;
  action?: ReactNode;
}

export const NotificationBandBanner = ({
  bandName,
  description,
  action,
}: NotificationBandBannerProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-secondary-300 bg-secondary-0 px-4 py-3">
    <img
      src={DefaultAvatar}
      alt=""
      className="size-9 shrink-0 rounded-full object-cover"
    />

    <div className="flex min-w-0 flex-1 flex-col">
      <span className="text-body1 text-neutral-900">{bandName}</span>
      <span className="truncate text-caption2 text-neutral-600">
        {description}
      </span>
    </div>

    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
