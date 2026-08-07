import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@/assets/icons/band/search.svg";
import SearchActiveIcon from "@/assets/icons/band/search-active.svg";
import InviteCloseIcon from "@/assets/icons/band/delete-circle.svg";
import LinkIcon from "@/assets/icons/band/link-icon.svg";
import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/common/Header/Header";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import Modal from "@/components/Modal/Modal";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { useBandQuery } from "@/hooks/api/band/useBand";
import {
  useBandMemberCandidatesQuery,
  useCreateBandInviteLink,
  useInviteBandMember,
} from "@/hooks/api/band/useBandMember";
import { cacheNicknames } from "@/utils/bandMemberNicknameCache";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { BandMemberSearchItem } from "@/types/band/bandMember";

type InviteBadge = "invite" | "member" | "pending" | "unavailable";

const getInviteBadge = (candidate: BandMemberSearchItem): InviteBadge => {
  if (candidate.bandMemberStatus === "INVITED") {
    return "pending";
  }

  if (candidate.bandMemberStatus === "ACCEPTED") {
    return "member";
  }

  if (candidate.bandMemberStatus) {
    return "unavailable";
  }

  return candidate.inviteAvailable ? "invite" : "unavailable";
};

const MemberInviteSearchPage = () => {
  const navigate = useNavigate();
  const activeBandId = useActiveBandId();
  const bandId = activeBandId ?? NaN;
  const { data: band } = useBandQuery(bandId);
  const bandName = band?.name ?? "";

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [inviteTargetId, setInviteTargetId] = useState<number | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [copyErrorMessage, setCopyErrorMessage] = useState<string | null>(null);

  const isSearchActive = isFocused || search.length > 0;
  const showResults = search.trim().length > 0;

  const candidatesQuery = useBandMemberCandidatesQuery(bandId, search);
  const candidates = candidatesQuery.data ?? [];
  const inviteMutation = useInviteBandMember(bandId);
  const createInviteLink = useCreateBandInviteLink(bandId);

  useEffect(() => {
    if (!candidatesQuery.data) return;

    cacheNicknames(
      candidatesQuery.data.map((candidate) => ({
        userId: candidate.userId,
        nickname: candidate.nickname,
      })),
    );
  }, [candidatesQuery.data]);

  const inviteTarget = candidates.find(
    (candidate) => candidate.userId === inviteTargetId,
  );

  const handleCopyInviteLink = async () => {
    setCopyErrorMessage(null);

    try {
      const { token } = await createInviteLink.mutateAsync({
        memberType: "MEMBER",
      });
      const inviteUrl = `${window.location.origin}/band/invite-links/${token}`;

      await navigator.clipboard.writeText(inviteUrl);
      setShowCopyToast(true);
    } catch (error) {
      setCopyErrorMessage(
        getApiErrorMessage(
          error,
          "초대 링크를 만들지 못했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    }
  };

  const handleConfirmInvite = async () => {
    if (!inviteTarget) return;

    await inviteMutation.mutateAsync({
      userId: inviteTarget.userId,
      memberType: "MEMBER",
    });
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
            placeholder="이름 검색"
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

        {showResults && candidates.length === 0 ? (
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
              onClick={() => void handleCopyInviteLink()}
              disabled={createInviteLink.isPending}
              className="flex w-67.5 h-9.5 items-center justify-center gap-4 rounded-lg bg-secondary-400 text-body1 text-neutral-0 disabled:opacity-60"
            >
              <img src={LinkIcon} alt="" />
              {createInviteLink.isPending
                ? "링크 생성 중..."
                : "초대링크 복사하기"}
            </button>
            {copyErrorMessage ? (
              <p className="text-caption2 text-error">{copyErrorMessage}</p>
            ) : null}
          </div>
        ) : showResults ? (
          <div className="mt-6 flex flex-col gap-4 px-4">
            {candidates.map((candidate) => {
              const badge = getInviteBadge(candidate);

              return (
                <div
                  key={candidate.userId}
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
                        {candidate.nickname}
                      </span>
                    </div>
                  </div>

                  {badge === "invite" ? (
                    <button
                      type="button"
                      onClick={() => setInviteTargetId(candidate.userId)}
                      className="flex h-6.5 w-13.25 shrink-0 items-center justify-center rounded-lg border border-secondary-500 text-caption3 text-secondary-500"
                    >
                      초대
                    </button>
                  ) : badge === "member" ? (
                    <span className="flex h-6.5 w-13.25 shrink-0 items-center justify-center rounded-lg bg-secondary-400 text-caption3 text-neutral-0">
                      멤버
                    </span>
                  ) : badge === "pending" ? (
                    <span className="flex h-6.5 w-13.25 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-caption3 text-secondary-400">
                      대기
                    </span>
                  ) : (
                    <span className="flex h-6.5 w-13.25 shrink-0 items-center justify-center rounded-lg bg-neutral-300 text-caption3 text-neutral-500">
                      초대불가
                    </span>
                  )}
                </div>
              );
            })}
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
