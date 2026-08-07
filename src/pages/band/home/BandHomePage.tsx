import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SwapIcon from "@/assets/icons/swap.svg";
import DefaultBandAvatar from "@/assets/icons/band/band-default-profile.svg";
import { HomeHeader } from "@/components/common/Header/HomeHeader";
import { NotificationBellIcon } from "@/components/common/Header/NotificationBellIcon";
import {
  useActiveBandId,
  useMyProfilesQuery,
} from "@/hooks/api/user/useMyProfiles";
import { useBandQuery } from "@/hooks/api/band/useBand";
import {
  useDeletePerformance,
  usePerformancesQuery,
} from "@/hooks/api/band/usePerformance";
import { useDeletePost, usePostsQuery } from "@/hooks/api/band/usePost";
import { useMusicLinksQuery } from "@/hooks/api/band/useMusicLink";
import { useNotificationsInfiniteQuery } from "@/hooks/api/useNotifications";
import {
  isNotificationForMode,
  isNotificationWithinRetention,
  isPostRegistrationNotification,
} from "@/utils/notificationDeepLink";
import { BAND_GENRE_LABELS, BAND_REGION_LABELS } from "@/utils/bandLabels";
import { BandProfileCard } from "@/components/band/home/BandProfileCard";
import { StatRow } from "@/components/band/home/StatRow";
import { Tabs } from "@/components/band/home/Tabs";
import { ModeSwitchSheet } from "@/components/band/home/ModeSwitchSheet";
import { PostCard } from "@/components/band/home/PostCard";
import { MusicLinksSection } from "@/components/band/home/MusicLinksSection";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import type { PerformanceListItem } from "@/types/band/performance";

const HOME_TABS = [
  { id: "content", label: "콘텐츠" },
  { id: "schedule", label: "일정" },
  { id: "music", label: "음원" },
];

const MONTH_ABBREVIATIONS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const getPerformanceCardProps = (performance: PerformanceListItem) => {
  const [, month, day] = performance.performanceDate.split("-");

  return {
    month: MONTH_ABBREVIATIONS[Number(month) - 1] ?? "",
    day: day ?? "",
    dateTime: `${performance.performanceDate.replaceAll("-", ".")}.`,
  };
};

const BandHomePage = () => {
  const navigate = useNavigate();
  const activeBandId = useActiveBandId();
  const bandProfilesQuery = useMyProfilesQuery({ type: "band" });
  const isBandStatusLoading = bandProfilesQuery.isLoading;
  const isBandStatusError = bandProfilesQuery.isError;
  const hasBand = activeBandId !== null;
  const showNoBandState = !hasBand && !isBandStatusLoading && !isBandStatusError;
  const bandId = activeBandId ?? NaN;

  const { data: band } = useBandQuery(bandId);
  const { data: performancesData } = usePerformancesQuery(bandId);
  const { data: postsData } = usePostsQuery(bandId);
  const { data: musicLinks } = useMusicLinksQuery(bandId);
  const deletePerformance = useDeletePerformance();
  const deletePost = useDeletePost();

  const { data: notificationsData } = useNotificationsInfiniteQuery();
  const hasUnreadNotification = useMemo(
    () =>
      notificationsData?.pages
        .flatMap((page) => page.items)
        .some(
          (notification) =>
            !notification.isRead &&
            isNotificationWithinRetention(notification) &&
            isNotificationForMode(notification, "BAND") &&
            !isPostRegistrationNotification(notification),
        ) ?? false,
    [notificationsData],
  );

  const performances = performancesData?.performances ?? [];
  const posts = postsData?.posts ?? [];

  const spotifyUrl = musicLinks?.spotifyUrl ?? "";
  const youtubeUrl = musicLinks?.youtubeUrl ?? "";
  const soundcloudUrl = musicLinks?.soundcloudUrl ?? "";
  const etcPlatform = musicLinks?.etcPlatform ?? null;
  const etcUrl = musicLinks?.etcUrl ?? "";
  const otherUrl = musicLinks?.otherUrl ?? "";
  const hasMusicLinks = Boolean(
    spotifyUrl ||
      youtubeUrl ||
      soundcloudUrl ||
      (etcPlatform && etcUrl) ||
      otherUrl,
  );

  const [activeTab, setActiveTab] = useState("content");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deletePostTargetId, setDeletePostTargetId] = useState<number | null>(
    null,
  );
  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);

  const subtitle = band
    ? `${BAND_GENRE_LABELS[band.genre] ?? band.genre} · ${BAND_REGION_LABELS[band.region] ?? band.region} · 멤버 ${band.memberCount}명`
    : "";
  const goToCreateBand = () => navigate("/band/profile/new");

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0 px-5 pb-24">
      <HomeHeader
        rightAction={
          <>
            <button
              type="button"
              aria-label="알림"
              onClick={() => navigate("/band/notifications")}
              className="text-neutral-900"
            >
              <NotificationBellIcon
                hasUnread={hasUnreadNotification}
                dotColor="var(--color-secondary-400)"
              />
            </button>

            <button
              type="button"
              aria-label="모드 전환"
              onClick={() => setIsModeSwitchOpen(true)}
            >
              <img src={SwapIcon} alt="" className="size-6" />
            </button>
          </>
        }
      />

      <section className="mt-6 flex flex-1 flex-col">
        {hasBand && band ? (
          <BandProfileCard
            name={band.name}
            avatarUrl={band.profileImageUrl ?? ""}
            verified={false}
            subtitle={subtitle}
            onEditProfile={() => navigate("/band/profile/edit")}
          />
        ) : null}

        {showNoBandState ? (
          <div className="flex items-center gap-3">
            <img
              src={DefaultBandAvatar}
              alt=""
              className="size-18 shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-[20px] leading-5 font-bold text-black">
                등록된 밴드가 없어요
              </h2>
              <p className="text-caption1 text-neutral-700">
                새로운 밴드를 등록하고
                <br />
                팬들과 소통해보세요!
              </p>
            </div>
          </div>
        ) : null}

        {isBandStatusError ? (
          <p className="text-caption1 text-neutral-500">
            밴드 정보를 불러오지 못했어요
          </p>
        ) : null}

        <div className="mt-4">
          <StatRow
            stats={[
              { label: "팔로워", value: band?.followerCount ?? 0 },
              { label: "공연", value: band?.performanceCount ?? 0 },
              { label: "콘텐츠", value: posts.length },
            ]}
          />
        </div>

        <div className="mt-4 flex gap-2.25">
          <button
            type="button"
            onClick={
              hasBand ? () => navigate("/band/videos/new") : goToCreateBand
            }
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            콘텐츠 등록
          </button>
          <button
            type="button"
            onClick={
              hasBand ? () => navigate("/band/concerts/new") : goToCreateBand
            }
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            일정 등록
          </button>
          <button
            type="button"
            onClick={
              hasBand ? () => navigate("/band/music/new") : goToCreateBand
            }
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            음원 등록
          </button>
        </div>

        <div className="mt-6 flex flex-1 flex-col gap-4">
          <Tabs
            tabs={HOME_TABS}
            activeTabId={activeTab}
            onChange={setActiveTab}
          />

          <div className="flex flex-1 flex-col">
            {showNoBandState ? (
              <EmptyState
                title="등록된 밴드가 없어요"
                description={
                  <>
                    밴드를 등록하면 콘텐츠, 공연, 라이브 등
                    <br />
                    다양한 활동을 관리할 수 있어요
                  </>
                }
                actionLabel="밴드 등록하기"
                onAction={goToCreateBand}
              />
            ) : null}

            {hasBand && activeTab === "content" && posts.length === 0 ? (
              <EmptyState
                title="등록된 콘텐츠가 없어요"
                description={
                  <>
                    콘텐츠를 등록하면 팬들이
                    <br />
                    소식을 받아볼 수 있어요
                  </>
                }
                actionLabel="등록하기"
                onAction={() => navigate("/band/videos/new")}
              />
            ) : null}

            {hasBand && activeTab === "content" && posts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.postId}
                    bandName={band?.name ?? ""}
                    avatarUrl={band?.profileImageUrl ?? undefined}
                    metaLabel={
                      band
                        ? `${BAND_GENRE_LABELS[band.genre]} · ${BAND_REGION_LABELS[band.region]} · ${formatRelativeTime(post.createdAt)}`
                        : formatRelativeTime(post.createdAt)
                    }
                    mediaItems={
                      post.thumbnailUrl
                        ? [
                            {
                              type: post.type === "VIDEO" ? "video" : "image",
                              url: post.thumbnailUrl,
                            },
                          ]
                        : []
                    }
                    caption={
                      post.description?.trim() ||
                      post.title ||
                      "팬분들께 전하고 싶은 소식을 적어보세요"
                    }
                    onClick={() => navigate(`/band/contents/${post.postId}`)}
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/band/contents/${post.postId}/edit`);
                          }}
                          className="flex h-6.5 items-center justify-center gap-2.5 rounded-lg bg-[#FFF6E5] px-3.75 py-1.75 text-center text-caption3 text-neutral-600"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeletePostTargetId(post.postId);
                          }}
                          className="flex h-6.5 items-center justify-center gap-2.5 rounded-lg bg-neutral-300 px-3.75 py-1.75 text-caption3 text-neutral-600"
                        >
                          삭제
                        </button>
                      </>
                    }
                  />
                ))}
              </div>
            ) : null}

            {hasBand && activeTab === "schedule" && performances.length === 0 ? (
              <EmptyState
                title="등록된 일정이 없어요"
                description={
                  <>
                    공연 일정을 등록하면 팬들이
                    <br />
                    소식을 받아볼 수 있어요
                  </>
                }
                actionLabel="등록하기"
                onAction={() => navigate("/band/concerts/new")}
              />
            ) : null}

            {hasBand && activeTab === "schedule" && performances.length > 0 ? (
              <div className="flex flex-col gap-3">
                {performances.map((performance) => {
                  const cardProps = getPerformanceCardProps(performance);

                  return (
                    <ConcertCard
                      key={performance.performanceId}
                      onClick={() =>
                        navigate(`/band/concerts/${performance.performanceId}`)
                      }
                      month={cardProps.month}
                      day={cardProps.day}
                      title={performance.title}
                      location={performance.venue}
                      dateTime={cardProps.dateTime}
                      status="등록 완료"
                      showThumbnail={Boolean(performance.posterImageUrl)}
                      thumbnailSrc={performance.posterImageUrl ?? undefined}
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(
                                `/band/concerts/${performance.performanceId}/edit`,
                              );
                            }}
                            className="flex h-6.5 items-center justify-center gap-2.5 rounded-lg bg-[#FFF6E5] px-3.75 py-1.75 text-center text-caption3 text-neutral-600"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteTargetId(performance.performanceId);
                            }}
                            className="flex h-6.5 items-center justify-center gap-2.5 rounded-lg bg-neutral-300 px-3.75 py-1.75 text-caption3 text-neutral-600"
                          >
                            삭제
                          </button>
                        </>
                      }
                    />
                  );
                })}
              </div>
            ) : null}

            {hasBand && activeTab === "music" && !hasMusicLinks ? (
              <EmptyState
                title="등록된 음원이 없어요"
                description={
                  <>
                    음원 링크를 등록하면 팬들이
                    <br />
                    바로 들으러 갈 수 있어요
                  </>
                }
                actionLabel="등록하기"
                onAction={() => navigate("/band/music/new")}
              />
            ) : null}

            {hasBand && activeTab === "music" && hasMusicLinks ? (
              <MusicLinksSection
                spotifyUrl={spotifyUrl}
                youtubeUrl={youtubeUrl}
                soundcloudUrl={soundcloudUrl}
                etcPlatform={etcPlatform}
                etcUrl={etcUrl}
                otherUrl={otherUrl}
                onAddLink={() => navigate("/band/music/new")}
              />
            ) : null}
          </div>
        </div>
      </section>

      <ModalOverlay
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
      >
        <Modal
          tone="orange"
          title="공연을 삭제할까요?"
          description={<>삭제된 공연 정보는 복구할 수 없어요</>}
          confirmLabel="삭제"
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={() => {
            if (deleteTargetId !== null) {
              deletePerformance.mutate(deleteTargetId);
            }
            setDeleteTargetId(null);
          }}
        />
      </ModalOverlay>

      <ModalOverlay
        open={deletePostTargetId !== null}
        onClose={() => setDeletePostTargetId(null)}
      >
        <Modal
          tone="orange"
          title="콘텐츠를 삭제할까요?"
          description={<>삭제된 콘텐츠는 복구할 수 없어요</>}
          confirmLabel="삭제"
          onCancel={() => setDeletePostTargetId(null)}
          onConfirm={() => {
            if (deletePostTargetId !== null) {
              deletePost.mutate(deletePostTargetId);
            }
            setDeletePostTargetId(null);
          }}
        />
      </ModalOverlay>

      <ModeSwitchSheet
        open={isModeSwitchOpen}
        onClose={() => setIsModeSwitchOpen(false)}
      />
    </main>
  );
};

export default BandHomePage;
