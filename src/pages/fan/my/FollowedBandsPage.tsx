import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import DefaultAvatar from "@/assets/images/IMG_my.svg";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";

interface FollowedBand {
  id: string;
  name: string;
  meta: string;
}

const FOLLOWED_BANDS: FollowedBand[] = [
  { id: "band-1", name: "WAVY", meta: "인디 · 서울 · 팔로워 560명" },
  {
    id: "band-2",
    name: "Velvet Noise",
    meta: "인디팝 · 서울 · 팔로워 1.2만명",
  },
  { id: "band-3", name: "나는나비", meta: "록 · 서울 · 팔로워 8,421명" },
  { id: "band-4", name: "새소녀", meta: "인디 · 서울 · 팔로워 2.4만명" },
];

const FollowedBandsPage = () => {
  const navigate = useNavigate();
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FOLLOWED_BANDS.map((band) => [band.id, true])),
  );
  const [unfollowTargetId, setUnfollowTargetId] = useState<string | null>(null);

  const handleFollowClick = (id: string) => {
    if (followedIds[id]) {
      setUnfollowTargetId(id);
      return;
    }

    setFollowedIds((prev) => ({ ...prev, [id]: true }));
  };

  const confirmUnfollow = () => {
    if (!unfollowTargetId) return;
    setFollowedIds((prev) => ({ ...prev, [unfollowTargetId]: false }));
    setUnfollowTargetId(null);
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
        팔로우한 밴드 {FOLLOWED_BANDS.length}팀
      </p>

      <div className="mt-4 px-3">
        <ul className="flex flex-col gap-5">
          {FOLLOWED_BANDS.map((band) => {
            const isFollowing = followedIds[band.id] ?? false;

            return (
              <li key={band.id} className="flex items-center gap-4">
                <img
                  src={DefaultAvatar}
                  alt=""
                  className="size-8.75 shrink-0 rounded-full object-cover"
                />

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-caption3 text-black">
                    {band.name}
                  </span>
                  <span className="truncate text-caption2 text-neutral-600">
                    {band.meta}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleFollowClick(band.id)}
                  aria-pressed={isFollowing}
                  className={`flex py-1 px-3.75 shrink-0 items-center justify-center rounded-lg text-caption3 ${
                    isFollowing
                      ? "bg-primary-50 text-primary-400"
                      : "border border-primary-400 bg-neutral-0 text-primary-400"
                  }`}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ModalOverlay
        open={unfollowTargetId !== null}
        onClose={() => setUnfollowTargetId(null)}
      >
        <Modal
          title="팔로우를 취소할까요?"
          description="이 밴드의 소식을 더 이상 받을 수 없어요"
          confirmLabel="확인"
          onCancel={() => setUnfollowTargetId(null)}
          onConfirm={confirmUnfollow}
        />
      </ModalOverlay>
    </main>
  );
};

export default FollowedBandsPage;
