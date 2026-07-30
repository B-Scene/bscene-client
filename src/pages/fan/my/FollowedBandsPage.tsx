import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import DefaultAvatar from "@/assets/images/IMG_my.svg";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import { useUnfollowExploreBand } from "@/hooks/api/fan/useFanExplore";
import { useFollowedBandsQuery } from "@/hooks/api/user/useFollowedBands";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type { FollowedBandItem } from "@/types/user/followedBands";
import { getGenreLabel, getRegionLabel } from "@/utils/bandLabels";

const getBandId = (band: FollowedBandItem) => {
  if (typeof band.bandId === "number") return band.bandId;
  if (typeof band.band?.bandId === "number") return band.band.bandId;
  if (typeof band.band?.id === "number") return band.band.id;

  const nestedNumericId = Number(band.band?.id);
  if (Number.isFinite(nestedNumericId)) return nestedNumericId;

  if (typeof band.targetBandId === "number") return band.targetBandId;
  if (typeof band.followingBandId === "number") return band.followingBandId;
  if (typeof band.followedBandId === "number") return band.followedBandId;

  return null;
};

const FollowedBandsPage = () => {
  const navigate = useNavigate();
  const unfollowBandMutation = useUnfollowExploreBand();
  const [unfollowTargetId, setUnfollowTargetId] = useState<number | null>(null);
  const [removedBandIds, setRemovedBandIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [removedBandIdsUpdatedAt, setRemovedBandIdsUpdatedAt] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, dataUpdatedAt, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFollowedBandsQuery();

  const rawTotalCount = data?.pages[0]?.totalCount ?? 0;
  const shouldApplyRemovedBandIds = removedBandIdsUpdatedAt > dataUpdatedAt;
  const activeRemovedBandIds = useMemo(
    () => (shouldApplyRemovedBandIds ? removedBandIds : new Set<number>()),
    [removedBandIds, shouldApplyRemovedBandIds],
  );
  const bands = useMemo(
    () =>
      (data?.pages.flatMap((page) => page.items) ?? []).filter((band) => {
        const bandId = getBandId(band);

        return bandId == null || !activeRemovedBandIds.has(bandId);
      }),
    [activeRemovedBandIds, data],
  );
  const totalCount = Math.max(0, rawTotalCount - activeRemovedBandIds.size);
  const unfollowTarget = bands.find(
    (band) => getBandId(band) === unfollowTargetId,
  );

  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => setToastMessage(null), 2000);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  const confirmUnfollow = async () => {
    if (unfollowTargetId == null || unfollowBandMutation.isPending) return;

    const bandInfo = unfollowTarget?.band ?? unfollowTarget;
    const bandName = bandInfo?.name ?? bandInfo?.bandName ?? "밴드";

    setRemovedBandIds((currentIds) => {
      const nextIds = new Set(
        shouldApplyRemovedBandIds ? currentIds : undefined,
      );
      nextIds.add(unfollowTargetId);
      return nextIds;
    });
    setRemovedBandIdsUpdatedAt(Date.now());
    setUnfollowTargetId(null);

    try {
      await unfollowBandMutation.mutateAsync(unfollowTargetId);
      setToastMessage(`${bandName} 팔로우를 취소했어요`);
    } catch {
      setRemovedBandIds((currentIds) => {
        const nextIds = new Set(
          shouldApplyRemovedBandIds ? currentIds : undefined,
        );
        nextIds.delete(unfollowTargetId);
        return nextIds;
      });
      setRemovedBandIdsUpdatedAt(Date.now());
      setToastMessage("팔로우 취소에 실패했어요");
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="-mx-5 flex h-15 items-center justify-between px-3.75">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">
          팔로우한 밴드
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <p className="mt-4 text-caption3 text-neutral-700">
        팔로우한 밴드 {totalCount}팀
      </p>

      <div className="mt-4 px-3">
        <ul className="flex flex-col gap-5">
          {bands.map((band) => {
            const bandId = getBandId(band);
            const bandInfo = band.band ?? band;
            const bandName = bandInfo.name ?? bandInfo.bandName ?? "밴드";
            const followerCount =
              bandInfo.followerCount ?? bandInfo.followers ?? 0;

            return (
              <li
                key={String(bandId ?? bandName)}
                onClick={() => {
                  if (bandId == null) return;

                  navigate(`/fan/bands/${bandId}`, {
                    state: {
                      bandPreview: {
                        bandId,
                        name: bandName,
                        genre: bandInfo.genre,
                        region: bandInfo.region,
                        profileImageUrl:
                          band.profileImageUrl ??
                          band.bandProfileImageUrl ??
                          band.imageUrl ??
                          band.band?.profileImageUrl ??
                          band.band?.bandProfileImageUrl ??
                          band.band?.imageUrl ??
                          null,
                        followerCount,
                        isFollowing: true,
                      },
                    },
                  });
                }}
                className="flex cursor-pointer items-center gap-4"
              >
                <img
                  src={
                    band.profileImageUrl ??
                    band.bandProfileImageUrl ??
                    band.imageUrl ??
                    band.band?.profileImageUrl ??
                    band.band?.bandProfileImageUrl ??
                    band.band?.imageUrl ??
                    DefaultAvatar
                  }
                  alt=""
                  className="size-8.75 shrink-0 rounded-full object-cover"
                />

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-caption3 text-black">
                    {bandName}
                  </span>
                  <span className="truncate text-caption2 text-neutral-600">
                    {`${bandInfo.genre ? getGenreLabel(bandInfo.genre) : "장르"} · ${
                      bandInfo.region ? getRegionLabel(bandInfo.region) : "지역"
                    } · 팔로워 ${followerCount.toLocaleString()}명`}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={unfollowBandMutation.isPending}
                  onClick={(event) => {
                    event.stopPropagation();

                    if (bandId == null) return;

                    setUnfollowTargetId(bandId);
                  }}
                  className="flex shrink-0 items-center justify-center rounded-lg bg-primary-50 py-1 px-3.75 text-caption3 text-primary-400 disabled:opacity-60"
                >
                  팔로잉
                </button>
              </li>
            );
          })}
        </ul>

        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>

      <ModalOverlay
        open={unfollowTargetId !== null}
        onClose={() => setUnfollowTargetId(null)}
      >
        <Modal
          title="팔로우를 취소할까요?"
          description={
            <>
              이 밴드의 소식이
              <br />
              홈피드에서 사라져요
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setUnfollowTargetId(null)}
          onConfirm={() => void confirmUnfollow()}
        />
      </ModalOverlay>

      <Toast
        open={toastMessage !== null}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        tone={toastMessage?.includes("실패") ? "error" : "success"}
      />
    </main>
  );
};

export default FollowedBandsPage;
