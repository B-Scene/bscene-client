import { useMemo } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import BandDefaultProfileImage from "@/assets/icons/band/band-default-profile.svg";
import {
  useMarkNotificationAsReadMutation,
  useNotificationsInfiniteQuery,
} from "@/hooks/api/useNotifications";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import {
  FAN_NOTIFICATION_ROUTES,
  formatNotificationTime,
  getNotificationTargetPath,
  isNotificationForMode,
} from "@/utils/notificationDeepLink";
import type { NotificationItem } from "@/types/notification";

const NOTIFICATION_PAGE_SIZE = 20;

const NotificationCard = ({
  notification,
}: {
  notification: NotificationItem;
}) => {
  const navigate = useNavigate();
  const markNotificationAsRead = useMarkNotificationAsReadMutation();
  const time = formatNotificationTime(notification.createdAt);
  const targetPath = getNotificationTargetPath(
    notification,
    FAN_NOTIFICATION_ROUTES,
  );
  const canNavigate = Boolean(targetPath);

  const handleClick = () => {
    if (!notification.isRead) {
      markNotificationAsRead.mutate(notification.notificationId);
    }

    if (!targetPath) return;

    if (/^https?:\/\//i.test(targetPath)) {
      window.location.assign(targetPath);
      return;
    }

    navigate(targetPath);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleClick();
  };

  return (
    <article
      role={canNavigate ? "button" : undefined}
      tabIndex={canNavigate ? 0 : undefined}
      className={`flex w-full flex-col items-start gap-2.5 self-stretch rounded-[12px] bg-neutral-0 px-4 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)] ${
        canNavigate ? "cursor-pointer" : ""
      } ${notification.isRead ? "opacity-80" : ""}`}
      onClick={handleClick}
      onKeyDown={canNavigate ? handleKeyDown : undefined}
    >
      <div className="flex items-center gap-4 self-stretch">
        <span className="flex size-[45px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-400">
          <img
            src={BandDefaultProfileImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h2 className="m-0 line-clamp-2 flex-1 font-body text-body1 text-neutral-900">
              {notification.title}
            </h2>
            {!notification.isRead ? (
              <span
                aria-label="읽지 않은 알림"
                className="mt-1 size-2 shrink-0 rounded-full bg-primary-400"
              />
            ) : null}
          </div>
          {notification.body ? (
            <p className="m-0 mt-1 line-clamp-2 font-body text-caption2 text-neutral-700">
              {notification.body}
            </p>
          ) : null}
          {time ? (
            <p className="m-0 mt-1 font-body text-caption2 text-neutral-600">
              {time}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
};

const NotificationPage = () => {
  const navigate = useNavigate();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useNotificationsInfiniteQuery(NOTIFICATION_PAGE_SIZE);
  const notifications = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.items)
        .filter((notification) => isNotificationForMode(notification, "FAN")) ??
      [],
    [data],
  );
  const hasNotifications = notifications.length > 0;
  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[393px] bg-primary-0">
      <header className="flex h-[60px] items-center justify-between bg-neutral-0 px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">알림</h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      {isLoading ? (
        <section className="flex flex-col gap-3 pl-[23px] pr-[22px] pt-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[93px] rounded-xl bg-neutral-0 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
            />
          ))}
        </section>
      ) : isError ? (
        <section className="flex h-[calc(100dvh-60px)] flex-col items-center justify-center px-5 text-center">
          <h2 className="m-0 font-body text-label1 text-neutral-900">
            알림을 불러오지 못했어요
          </h2>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-[8px] bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      ) : hasNotifications ? (
        <section className="flex flex-col gap-3 pl-[23px] pr-[22px] pt-6">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.notificationId}
              notification={notification}
            />
          ))}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage ? (
            <p className="m-0 text-center font-body text-caption2 text-neutral-600">
              알림을 더 불러오고 있어요
            </p>
          ) : null}
        </section>
      ) : (
        <section className="flex h-[calc(100dvh-60px)] flex-col items-center pt-[274px] text-center">
          <h2 className="m-0 font-body text-label1 text-neutral-900">
            밴드 알림이 없어요
          </h2>
          <p className="m-0 mt-3 font-body text-caption1 text-neutral-600">
            팔로우한 밴드가 없거나,
            <br />
            밴드의 새로운 소식이 없어요
          </p>
        </section>
      )}
    </main>
  );
};

export default NotificationPage;
