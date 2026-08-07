import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/common/Header/Header";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { Toast } from "@/components/common/Toast/Toast";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { useBandQuery } from "@/hooks/api/band/useBand";
import {
  useBandMembersQuery,
  useRemoveBandMember,
} from "@/hooks/api/band/useBandMember";
import { useBandMemberProfileQuery } from "@/hooks/api/band/useBandMemberProfile";
import { getStoredAuthUser } from "@/utils/authUser";
import { getPartLabel } from "@/utils/bandLabels";
import { getCachedNickname } from "@/utils/bandMemberNicknameCache";
import type {
  BandMemberListItem,
  BandMemberType,
} from "@/types/band/bandMember";

const MEMBER_TYPE_LABELS: Record<BandMemberType, string> = {
  MEMBER: "멤버",
  SESSION: "세션",
};

interface MemberRowProps {
  member: BandMemberListItem;
  isSelf: boolean;
  isOwner: boolean;
  onRemoveClick: (userId: number) => void;
}

const MemberRow = ({ member, isSelf, isOwner, onRemoveClick }: MemberRowProps) => {
  const profileQuery = useBandMemberProfileQuery(
    member.bandMemberProfileId ?? NaN,
  );
  const profile = profileQuery.data;

  const name = profile?.nickname ?? member.profileNickname ?? "닉네임 없음";
  const roleLabel = profile?.part
    ? `${MEMBER_TYPE_LABELS[member.memberType]} · ${getPartLabel(profile.part)}`
    : MEMBER_TYPE_LABELS[member.memberType];

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-neutral-0 p-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={DefaultAvatar}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />

        <div className="flex min-w-0 flex-col gap-0.75">
          <span className="truncate text-caption3 text-neutral-900">
            {name}
            {isSelf ? " (나)" : ""}
          </span>
          <span className="truncate text-caption2 text-neutral-600">
            {roleLabel}
          </span>
        </div>
      </div>

      {isOwner ? (
        <span className="shrink-0 rounded-full border border-secondary-500 px-3 py-1 text-caption3 text-secondary-500">
          운영자
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onRemoveClick(member.userId)}
          className="shrink-0 text-caption4 text-neutral-500"
        >
          내보내기
        </button>
      )}
    </div>
  );
};

const InviteMemberPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeBandId = useActiveBandId();
  const bandId = activeBandId ?? NaN;
  const myUserId = getStoredAuthUser()?.userId;

  const { data: band } = useBandQuery(bandId);
  const { data: members = [] } = useBandMembersQuery(bandId);
  const removeMember = useRemoveBandMember(bandId);

  const bandName = band?.name ?? "";
  const activeMembers = members.filter((member) => member.status !== "INVITED");
  const pendingMembers = members.filter(
    (member) => member.status === "INVITED",
  );

  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);

  const [toastOpen, setToastOpen] = useState(
    () => Boolean((location.state as { invited?: boolean } | null)?.invited),
  );

  const getPendingMemberName = (member: BandMemberListItem) => {
    return (
      member.profileNickname ?? getCachedNickname(member.userId) ?? "닉네임 없음"
    );
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="멤버 관리" />

      <div className="flex flex-col gap-6">
        <div className="px-6 pt-4">
          <NotificationBandBanner
            bandName={bandName}
            description={`현재 선택된 밴드 · 멤버 ${band?.memberCount ?? 0}명`}
            profileImageUrl={band?.profileImageUrl}
            action={
              <button
                type="button"
                onClick={() => navigate("/band/profile/invite/search")}
                className="rounded-lg bg-secondary-400 px-3.75 py-1 text-caption3 text-neutral-0"
              >
                멤버 초대
              </button>
            }
          />

          <div className="mt-6 flex flex-col gap-3.5 px-2">
            {activeMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isSelf={member.userId === myUserId}
                isOwner={member.userId === band?.ownerId}
                onRemoveClick={setRemoveTargetId}
              />
            ))}
          </div>
        </div>

        {pendingMembers.length > 0 ? (
          <>
            <div className="h-4 bg-neutral-200" />

            <div className="flex flex-col gap-4">
              <h2 className="px-5.75 text-body1 text-neutral-700">
                초대 대기 멤버
              </h2>

              <div className="flex flex-col gap-3.5 px-8">
                {pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-4 rounded-lg bg-neutral-0 p-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <img
                        src={DefaultAvatar}
                        alt=""
                        className="size-10 shrink-0 rounded-full object-cover"
                      />

                      <div className="flex min-w-0 flex-col gap-0.75">
                        <span className="truncate text-caption3 text-neutral-900">
                          {getPendingMemberName(member)}
                        </span>
                        <span className="truncate text-caption2 text-neutral-600">
                          초대 발송됨
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMember.mutate(member.userId)}
                      className="shrink-0 text-right text-caption3 text-error"
                    >
                      취소
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <ModalOverlay
        open={removeTargetId !== null}
        onClose={() => setRemoveTargetId(null)}
      >
        <Modal
          tone="orange"
          title="해당 멤버를 내보낼까요?"
          description="내보낸 멤버는 밴드에서 제거됩니다."
          confirmLabel="내보내기"
          onCancel={() => setRemoveTargetId(null)}
          onConfirm={async () => {
            if (removeTargetId !== null) {
              await removeMember.mutateAsync(removeTargetId);
            }
            setRemoveTargetId(null);
          }}
        />
      </ModalOverlay>

      <Toast
        open={toastOpen}
        message="초대장을 발송했어요"
        onClose={() => setToastOpen(false)}
      />
    </main>
  );
};

export default InviteMemberPage;
