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
import {
  useAcceptBandInviteMutation,
  useRejectBandInviteMutation,
} from "@/hooks/api/band/useBandMember";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import {
  BAND_NOTIFICATION_ROUTES,
  formatNotificationTime,
  getNotificationTargetPath,
  isNotificationForMode,
  isNotificationWithinRetention,
  isPostRegistrationNotification,
} from "@/utils/notificationDeepLink";
import { getGenreLabel, getRegionLabel } from "@/utils/bandLabels";
import type { BandMemberPart } from "@/types/band/bandMember";
import type {
  NotificationBandInvite,
  NotificationItem,
} from "@/types/notification";

const PART_OPTIONS = ["보컬", "기타", "베이스", "드럼", "키보드"];
const NOTIFICATION_PAGE_SIZE = 20;
const PART_LABEL_TO_ENUM: Record<string, BandMemberPart> = {
  보컬: "VOCAL",
  기타: "GUITAR",
  베이스: "BASS",
  드럼: "DRUM",
  키보드: "KEYBOARD",
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
  const memberCount =
    getNumberField(bandInvite, "memberCount") ??
    getNumberField(bandInvite, "acceptedMemberCount");

  return [
    genre ? getGenreLabel(genre) : null,
    region ? getRegionLabel(region) : null,
    memberCount != null ? `멤버 ${memberCount}명` : null,
  ]
    .filter(Boolean)
    .join(" · ");
};

const getBandInviteImage = (bandInvite: NotificationBandInvite | null) =>
  getStringField(bandInvite, "profileImageUrl") ??
  getStringField(bandInvite, "bandProfileImageUrl") ??
  BandDefaultProfileImage;

const getBandInviteBandId = (notification: NotificationItem) =>
  getNumberField(notification.bandInvite, "bandId");

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
  const acceptBandInvite = useAcceptBandInviteMutation();
  const rejectBandInvite = useRejectBandInviteMutation();
  const notifications = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.items)
        .filter(
          (notification) =>
            isNotificationWithinRetention(notification) &&
            isNotificationForMode(notification, "BAND") &&
            !isPostRegistrationNotification(notification),
        ) ??
      [],
    [data],
  );
  const hasNotifications = notifications.length > 0;
  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedInviteNotification, setSelectedInviteNotification] =
    useState<NotificationItem | null>(null);
  const [activityName, setActivityName] = useState("");
  const [part, setPart] = useState("");
  const canConfirmRole = activityName.trim().length > 0 && part.length > 0;
  const isInviteActionPending =
    acceptBandInvite.isPending || rejectBandInvite.isPending;

  const handleNotificationClick = (notification: NotificationItem) => {
    const targetPath = getNotificationTargetPath(
      notification,
      BAND_NOTIFICATION_ROUTES,
    );

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

  const handleRejectInvite = async (notification: NotificationItem) => {
    const bandId = getBandInviteBandId(notification);

    if (bandId == null) return;

    if (!notification.isRead) {
      markNotificationAsRead.mutate(notification.notificationId);
    }

    await rejectBandInvite.mutateAsync({ bandId });
    void refetch();
  };

  const handleAcceptInviteConfirm = async () => {
    const notification = selectedInviteNotification;
    const bandId = notification ? getBandInviteBandId(notification) : null;
    const partEnum = PART_LABEL_TO_ENUM[part];

    if (!notification || bandId == null || !partEnum || !activityName.trim()) {
      return;
    }

    if (!notification.isRead) {
      markNotificationAsRead.mutate(notification.notificationId);
    }

    await acceptBandInvite.mutateAsync({
      bandId,
      body: {
        nickname: activityName.trim(),
        part: partEnum,
      },
    });
    void refetch();
    setIsRoleModalOpen(false);
    setIsCompleteModalOpen(true);
    setSelectedInviteNotification(null);
    setActivityName("");
    setPart("");
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
            const targetPath = getNotificationTargetPath(
              notification,
              BAND_NOTIFICATION_ROUTES,
            );

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
                        disabled={isInviteActionPending}
                        onClick={(event) => {
                          event.stopPropagation();

                          void handleRejectInvite(notification);
                        }}
                        className="flex h-7.5 w-35 flex-1 items-center justify-center rounded-md border border-secondary-500 bg-neutral-0 text-caption3 text-secondary-500 disabled:opacity-60"
                      >
                        거절
                      </button>
                      <button
                        type="button"
                        disabled={isInviteActionPending}
                        onClick={(event) => {
                          event.stopPropagation();

                          if (!notification.isRead) {
                            markNotificationAsRead.mutate(
                              notification.notificationId,
                            );
                          }

                          setSelectedInviteNotification(notification);
                          setIsRoleModalOpen(true);
                        }}
                        className="flex h-7.5 w-35 flex-1 items-center justify-center rounded-md bg-secondary-500 text-caption3 text-neutral-0 disabled:opacity-60"
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
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedInviteNotification(null);
        }}
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
              onClick={() => {
                setIsRoleModalOpen(false);
                setSelectedInviteNotification(null);
              }}
              className="flex h-9.5 flex-1 items-center justify-center rounded-md border border-secondary-500 bg-neutral-0 text-body1 text-secondary-500"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canConfirmRole || isInviteActionPending}
              onClick={() => void handleAcceptInviteConfirm()}
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
