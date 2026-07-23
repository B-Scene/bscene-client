import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@/assets/icons/band/search.svg";
import SearchActiveIcon from "@/assets/icons/band/search-active.svg";
import InviteCloseIcon from "@/assets/icons/band/delete-circle.svg";
import LinkIcon from "@/assets/icons/band/link-icon.svg";
import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/band/home/Header";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import Modal from "@/components/Modal/Modal";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { useBandMembersStore } from "@/stores/useBandMembersStore";

type InviteStatus = "invite" | "member" | "pending";

interface SearchUser {
  id: string;
  nickname: string;
  part: string;
  status: InviteStatus;
}

const INITIAL_RESULTS: SearchUser[] = [
  { id: "1", nickname: "이름", part: "파트", status: "invite" },
  { id: "2", nickname: "이름", part: "파트", status: "invite" },
  { id: "3", nickname: "이름", part: "파트", status: "member" },
  { id: "4", nickname: "이름", part: "파트", status: "pending" },
];

const MemberInviteSearchPage = () => {
  const navigate = useNavigate();
  const profile = useBandProfileStore((state) => state.profile);
  const bandName = profile.name.trim() || "WAVY";
  const addPendingInvite = useBandMembersStore(
    (state) => state.addPendingInvite,
  );

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [inviteTargetId, setInviteTargetId] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const isSearchActive = isFocused || search.length > 0;
  const showResults = search.trim().length > 0;
  const filteredResults = results.filter((user) =>
    user.nickname.includes(search.trim()),
  );
  const inviteTarget = results.find((user) => user.id === inviteTargetId);

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyToast(true);
    } catch {
      // clipboard access denied or unavailable
    }
  };

  const handleConfirmInvite = () => {
    if (!inviteTarget) return;

    setResults((prev) =>
      prev.map((user) =>
        user.id === inviteTarget.id ? { ...user, status: "pending" } : user,
      ),
    );
    addPendingInvite(inviteTarget.nickname);
    navigate("/band/profile/invite", { state: { invited: true } });
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="멤버 초대" />

      <div className="px-6 pt-4">
        <div
          className={`flex h-9 w-full items-center gap-2 rounded-full border bg-neutral-0 px-4 ${
            isSearchActive
              ? "border-secondary-500 shadow-[0_0_4px_0_rgba(252,193,63,0.50)]"
              : "border-neutral-500"
          }`}
        >
          <img
            src={isSearchActive ? SearchActiveIcon : SearchIcon}
            alt=""
            className="size-4 shrink-0"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="닉네임 검색"
            className="w-full bg-transparent text-body2 text-neutral-900 outline-none placeholder:text-body2 placeholder:text-neutral-500"
          />
          {search ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => setSearch("")}
            >
              <img src={InviteCloseIcon} alt="" />
            </button>
          ) : null}
        </div>

        {showResults && filteredResults.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-6 px-4 text-center">
            <div className="flex flex-col gap-3">
              <h3 className="text-label1 text-neutral-900">
                검색 결과가 없어요
              </h3>
              <p className="text-caption1 text-neutral-600">
                회원가입하지 않았거나 세션 프로필이 없는 경우
                <br />
                초대 링크를 공유해 멤버로 초대할 수 있어요
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="flex w-67.5 h-9.5 items-center justify-center gap-4 rounded-lg bg-secondary-400 text-body1 text-neutral-0"
            >
              <img src={LinkIcon} alt="" />
              초대링크 복사하기
            </button>
          </div>
        ) : showResults ? (
          <div className="mt-6 flex flex-col gap-4 px-4">
            {filteredResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <img
                    src={DefaultAvatar}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />

                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-body6 text-neutral-900">
                      {user.nickname}
                    </span>
                    <span className="truncate text-caption2 text-neutral-600">
                      {user.part}
                    </span>
                  </div>
                </div>

                {user.status === "invite" ? (
                  <button
                    type="button"
                    onClick={() => setInviteTargetId(user.id)}
                    className="flex h-6.5 w-13.25 shrink-0 items-center justify-center rounded-lg border border-secondary-500 text-caption3 text-secondary-500"
                  >
                    초대
                  </button>
                ) : user.status === "member" ? (
                  <span className="flex h-6.5 w-13.25 shrink-0 items-center justify-center rounded-lg bg-secondary-400 text-caption3 text-neutral-0">
                    멤버
                  </span>
                ) : (
                  <span className="flex h-6.5 w-13.25 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-caption3 text-secondary-400">
                    대기
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <ModalOverlay
        open={inviteTargetId !== null}
        onClose={() => setInviteTargetId(null)}
      >
        <Modal
          tone="orange"
          title={`${inviteTarget?.nickname ?? ""}님을 초대할까요?`}
          description={
            <>
              초대장을 보내면 상대방이 수락 후
              <br />
              {bandName}의 멤버로 참여하게 됩니다.
            </>
          }
          confirmLabel="확인"
          onCancel={() => setInviteTargetId(null)}
          onConfirm={handleConfirmInvite}
        />
      </ModalOverlay>

      <Toast
        open={showCopyToast}
        message="초대링크가 복사되었습니다"
        onClose={() => setShowCopyToast(false)}
      />
    </main>
  );
};

export default MemberInviteSearchPage;
