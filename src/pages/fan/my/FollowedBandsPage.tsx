import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import DefaultAvatar from "@/assets/images/IMG_my.svg";
import { useFollowedBandsQuery } from "@/hooks/api/user/useFollowedBands";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import { getGenreLabel, getRegionLabel } from "@/utils/bandLabels";

const FollowedBandsPage = () => {
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFollowedBandsQuery();

  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const bands = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

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
          {bands.map((band) => (
            <li
              key={band.bandId}
              onClick={() => navigate(`/fan/bands/${band.bandId}`)}
              className="flex cursor-pointer items-center gap-4"
            >
              <img
                src={band.profileImageUrl ?? DefaultAvatar}
                alt=""
                className="size-8.75 shrink-0 rounded-full object-cover"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-caption3 text-black">
                  {band.name}
                </span>
                <span className="truncate text-caption2 text-neutral-600">
                  {`${getGenreLabel(band.genre)} · ${getRegionLabel(band.region)} · 팔로워 ${band.followerCount.toLocaleString()}명`}
                </span>
              </div>

              <span className="flex shrink-0 items-center justify-center rounded-lg bg-primary-50 py-1 px-3.75 text-caption3 text-primary-400">
                팔로잉
              </span>
            </li>
          ))}
        </ul>

        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>
    </main>
  );
};

export default FollowedBandsPage;
