import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import BandDefaultProfileImage from "@/assets/icons/band/band-default-profile.svg";
import InviteAlertIcon from "@/assets/icons/band/invite-alert.svg";
import CheckIcon from "@/assets/icons/band/Monochrome.svg";
import { Input } from "@/components/common/Input/Input";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Select } from "@/components/common/Select/Select";
import {
  useMarkNotificationAsReadMutation,
  useNotificationsInfiniteQuery,
} from "@/hooks/api/useNotifications";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type {
  NotificationBandInvite,
  NotificationItem,
} from "@/types/notification";

const PART_OPTIONS = ["보컬", "기타", "베이스", "드럼", "키보드"];
const NOTIFICATION_PAGE_SIZE = 20;

const formatNotificationTime = (createdAt: string) => {
  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) return "";

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / 60_000),
  );

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return `${createdDate.getFullYear()}.${createdDate.getMonth() + 1}.${createdDate.getDate()}.`;
};

const getStringField = (
  value: NotificationBandInvite | null,
  field: string,
): string | null => {
  const fieldValue = value?.[field];

  return typeof fieldValue === "string" && fieldValue.length > 0
    ? fieldValue
    : null;
};

const getNumberField = (
  value: NotificationBandInvite | null,
  field: string,
): number | null => {
  const fieldValue = value?.[field];

  return typeof fieldValue === "number" && Number.isFinite(fieldValue)
    ? fieldValue
    : null;
};

const formatBandTag = (bandInvite: NotificationBandInvite | null) => {
  const genre = getStringField(bandInvite, "genre");
  const region = getStringField(bandInvite, "region");
  const memberCount = getNumberField(bandInvite, "memberCount");

  return [genre, region, memberCount != null ? `멤버 ${memberCount}명` : null]
    .filter(Boolean)
    .join(" · ");
};

const getBandInviteImage = (bandInvite: NotificationBandInvite | null) =>
  getStringField(bandInvite, "profileImageUrl") ??
  getStringField(bandInvite, "bandProfileImageUrl") ??
  BandDefaultProfileImage;

const normalizeDeepLink = (deepLink: string) => {
  if (/^https?:\/\//i.test(deepLink)) {
    try {
      const url = new URL(deepLink);

      if (url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      return deepLink;
    }

    return deepLink;
  }

  return deepLink.startsWith("/") ? deepLink : `/${deepLink}`;
};

const getRouteSuffix = (path: string) => path.match(/[?#].*$/)?.[0] ?? "";

const getMappedDeepLink = (deepLink: string) => {
  const path = normalizeDeepLink(deepLink);

  if (/^https?:\/\//i.test(path)) return path;

  const postId = path.match(
    /\/(?:posts?|contents?|news)\/(\d+)(?=[/?#]|$)/i,
  )?.[1];

  if (postId) {
    return `/fan/explore/contents/${postId}${getRouteSuffix(path)}`;
  }

  const concertId = path.match(
    /\/(?:performances?|concerts?)\/(\d+)(?=[/?#]|$)/i,
  )?.[1];

  if (concertId) {
    return `/fan/home/concerts/${concertId}${getRouteSuffix(path)}`;
  }

  const liveId = path.match(/\/lives?\/(\d+)(?=[/?#]|$)/i)?.[1];

  if (liveId) {
    return `/fan/live/room/${liveId}${getRouteSuffix(path)}`;
  }

  const bandId = path.match(/\/bands?\/(\d+)(?=[/?#]|$)/i)?.[1];

  if (bandId) {
    return `/fan/bands/${bandId}${getRouteSuffix(path)}`;
  }

  const knownPrefixes = [
    "/fan/explore/contents/",
    "/fan/home/concerts/",
    "/fan/live/room/",
    "/fan/bands/",
    "/band/session/messages/",
  ];

  if (knownPrefixes.some((prefix) => path.startsWith(prefix))) {
    return path;
  }

  return null;
};

const getNotificationTargetPath = (notification: NotificationItem) => {
  const deepLink = notification.deepLink?.trim();

  if (deepLink) {
    const mappedPath = getMappedDeepLink(deepLink);

    if (mappedPath) return mappedPath;
  }

  if (notification.referenceId == null) return null;

  const type = notification.type.toUpperCase();

  if (type.includes("INVITE")) return null;

  if (
    type.includes("POST") ||
    type.includes("CONTENT") ||
    type.includes("NEWS")
  ) {
    return `/fan/explore/contents/${notification.referenceId}`;
  }

  if (type.includes("PERFORMANCE") || type.includes("CONCERT")) {
    return `/fan/home/concerts/${notification.referenceId}`;
  }

  if (type.includes("LIVE")) {
    return `/fan/live/room/${notification.referenceId}`;
  }

  return `/fan/explore/contents/${notification.referenceId}`;
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
  const markNotificationAsRead = useMarkNotificationAsReadMutation();
  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const hasNotifications = notifications.length > 0;
  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [part, setPart] = useState("");
  const canConfirmRole = activityName.trim().length > 0 && part.length > 0;

  const handleNotificationClick = (notification: NotificationItem) => {
    const targetPath = getNotificationTargetPath(notification);

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

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[393px] bg-secondary-0">
      <header className="flex h-[60px] items-center justify-between bg-neutral-0 px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1
          className="m-0"
          style={{
            color: "var(--Gray-Scale-900, #1D1A1A)",
            fontFamily: "Pretendard",
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "28px",
          }}
        >
          알림
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      {isLoading ? (
        <section className="flex flex-col gap-3 pl-[23px] pr-[22px] pt-6 pb-6">
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
            className="mt-4 rounded-[8px] bg-secondary-500 px-4 py-2 font-body text-caption3 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      ) : hasNotifications ? (
        <section className="flex flex-col gap-3 pl-[23px] pr-[22px] pt-6 pb-6">
          {notifications.map((notification) => {
            const time = formatNotificationTime(notification.createdAt);
            const isBandInvite =
              notification.type === "BAND_INVITE" && notification.bandInvite;
            const targetPath = getNotificationTargetPath(notification);

            if (isBandInvite) {
              const bandInvite = notification.bandInvite;
              const bandName =
                getStringField(bandInvite, "bandName") ?? "밴드";
              const position =
                getStringField(bandInvite, "position") ??
                getStringField(bandInvite, "part");
              const role =
                getStringField(bandInvite, "role") ??
                (position ? `밴드 멤버 · ${position}` : "밴드 멤버");
              const bandTag = formatBandTag(bandInvite);

              return (
                <article
                  key={notification.notificationId}
                  className={`flex w-full flex-col gap-4 self-stretch rounded-xl bg-neutral-0 px-4 py-6 shadow-[0_0_8px_0_rgba(0,0,0,0.10)] ${
                    targetPath ? "cursor-pointer" : ""
                  } ${
                    notification.isRead ? "opacity-80" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mx-auto flex w-full max-w-71.5 items-start gap-4">
                    <img
                      src={InviteAlertIcon}
                      alt=""
                      className="shrink-0 rounded-full object-cover"
                    />

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <h2 className="line-clamp-2 font-body text-body1 text-neutral-900">
                        {notification.title ||
                          `${bandName}에서 멤버 초대를 보냈어요`}
                      </h2>
                      {notification.body || position ? (
                        <p className="font-body text-caption2 text-neutral-600">
                          {notification.body ||
                            `${position} 포지션으로 함께 활동해 주세요`}
                        </p>
                      ) : null}
                      <p className="font-body text-caption2 text-neutral-600">
                        {time}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <span
                        aria-label="읽지 않은 알림"
                        className="mt-1 size-2 shrink-0 rounded-full bg-secondary-500"
                      />
                    ) : null}
                  </div>

                  <div className="h-px bg-neutral-400" />

                  <div className="mx-auto flex w-full max-w-71.5 items-center gap-3">
                    <img
                      src={getBandInviteImage(bandInvite)}
                      alt=""
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 font-body text-body6 text-neutral-900">
                        {bandName}
                      </p>
                      {bandTag ? (
                        <p className="m-0 truncate font-body text-caption2 text-neutral-600">
                          {bandTag}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mx-auto flex w-full max-w-71.5 items-center gap-3 rounded-md border border-neutral-300 px-4 py-3">
                    <span className="font-body text-caption3 text-neutral-500">
                      역할
                    </span>
                    <span className="font-body text-body6 text-secondary-500">
                      {role}
                    </span>
                  </div>

                  {notification.actionable ? (
                    <div className="mx-auto flex w-full max-w-75 gap-5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          if (!notification.isRead) {
                            markNotificationAsRead.mutate(
                              notification.notificationId,
                            );
                          }
                        }}
                        className="flex h-7.5 w-35 flex-1 items-center justify-center rounded-md border border-secondary-500 bg-neutral-0 text-caption3 text-secondary-500"
                      >
                        거절
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          if (!notification.isRead) {
                            markNotificationAsRead.mutate(
                              notification.notificationId,
                            );
                          }

                          setIsRoleModalOpen(true);
                        }}
                        className="flex h-7.5 w-35 flex-1 items-center justify-center rounded-md bg-secondary-500 text-caption3 text-neutral-0"
                      >
                        수락
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            }

            const canNavigate = Boolean(targetPath);

            return (
              <article
                key={notification.notificationId}
                className={`flex w-full flex-col items-start gap-2.5 self-stretch rounded-xl bg-neutral-0 px-4 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)] ${
                  canNavigate ? "cursor-pointer" : ""
                } ${notification.isRead ? "opacity-80" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center gap-4 self-stretch">
                  <span className="flex size-11.25 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-400">
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
                          className="mt-1 size-2 shrink-0 rounded-full bg-secondary-500"
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
          })}
          <div ref={sentinelRef} aria-hidden="true" className="h-4" />
          {isFetchingNextPage ? (
            <p className="m-0 text-center font-body text-caption2 text-neutral-600">
              더 불러오는 중이에요
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

      <ModalOverlay
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        clipContent={false}
      >
        <div className="box-border flex w-88.5 max-w-full flex-col gap-6 rounded-2xl bg-neutral-0 px-4 py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="m-0 font-body text-label1 text-neutral-900">
              활동명과 파트를 입력해주세요
            </h3>
            <p className="m-0 font-body text-caption2 text-neutral-600">
              밴드 프로필에 표시될 정보를 입력해 주세요
              <br />
              밴드 프로필 관리에서 활동명과 파트를 수정할 수 있어요
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className="font-body text-body6 text-neutral-900">
                활동명
              </span>
              <Input
                value={activityName}
                onChange={(event) => setActivityName(event.target.value)}
                placeholder="활동명을 입력해주세요"
                className="w-full rounded-[5px] py-1.25 pl-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-body text-body6 text-neutral-900">
                파트
              </span>
              <Select
                value={part}
                onChange={setPart}
                options={PART_OPTIONS}
                placeholder="파트를 선택해주세요"
              />
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="flex h-9.5 flex-1 items-center justify-center rounded-md border border-secondary-500 bg-neutral-0 text-body1 text-secondary-500"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canConfirmRole}
              onClick={() => {
                setIsRoleModalOpen(false);
                setIsCompleteModalOpen(true);
              }}
              className="flex h-9.5 flex-1 items-center justify-center rounded-md bg-secondary-500 text-body1 text-neutral-0 disabled:opacity-60"
            >
              확인
            </button>
          </div>
        </div>
      </ModalOverlay>

      <ModalOverlay
        open={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
      >
        <div className="box-border flex w-88.5 max-w-full flex-col items-center gap-4 rounded-2xl bg-neutral-0 px-4 py-6 text-center">
          <img src={CheckIcon} alt="" />

          <div className="flex flex-col gap-2">
            <h3 className="m-0 font-body text-label1 text-neutral-900">
              초대가 완료되었습니다
            </h3>
            <p className="m-0 font-body text-caption2 text-neutral-600">
              이제 WAVY의 멤버로 활동할 수 있어요.
              <br />내 밴드와 밴드 프로필 관리에서 확인해 주세요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCompleteModalOpen(false)}
            className="flex w-78.25 h-9.5 items-center justify-center rounded-md bg-secondary-500 text-body1 text-neutral-0"
          >
            확인
          </button>
        </div>
      </ModalOverlay>
    </main>
  );
};

export default NotificationPage;
