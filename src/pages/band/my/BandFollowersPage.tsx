import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { useBandFollowersQuery } from "@/hooks/api/band/useBandFollowers";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

const BandFollowersPage = () => {
  const navigate = useNavigate();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useBandFollowersQuery();

  const followers = data?.pages.flatMap((page) => page.items) ?? [];

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
          내 밴드 팔로워
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <p className="mt-4 text-caption3 text-neutral-700">
        팔로워 {followers.length}명
      </p>

      <div className="mt-4 px-3">
        {isLoading ? (
          <p className="py-6 text-center text-caption2 text-neutral-600">
            팔로워를 불러오고 있어요
          </p>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="m-0 text-caption2 text-neutral-600">
              {getApiErrorMessage(
                error,
                "팔로워 목록을 불러오지 못했어요",
              )}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
            >
              다시 시도
            </button>
          </div>
        ) : followers.length === 0 ? (
          <p className="py-6 text-center text-caption2 text-neutral-600">
            아직 팔로워가 없어요
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {followers.map((follower) => (
              <li key={follower.userId} className="flex items-center gap-4">
                <img
                  src={follower.fanProfileImageUrl ?? DefaultAvatar}
                  alt=""
                  className="size-8.75 shrink-0 rounded-full object-cover"
                />

                <span className="truncate text-caption3 text-black">
                  {follower.nickname}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>
    </main>
  );
};

export default BandFollowersPage;
