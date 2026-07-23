import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/band/home/Header";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { Toast } from "@/components/common/Toast/Toast";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { useBandMembersStore } from "@/stores/useBandMembersStore";

const InviteMemberPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useBandProfileStore((state) => state.profile);
  const bandName = profile.name.trim() || "WAVY";

  const members = useBandMembersStore((state) => state.members);
  const pendingInvites = useBandMembersStore((state) => state.pendingInvites);
  const removeMember = useBandMembersStore((state) => state.removeMember);
  const cancelPendingInvite = useBandMembersStore(
    (state) => state.cancelPendingInvite,
  );

  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(
    () => Boolean((location.state as { invited?: boolean } | null)?.invited),
  );

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="멤버 관리" />

      <div className="flex flex-col gap-6">
        <div className="px-6 pt-4">
          <NotificationBandBanner
            bandName={bandName}
            description={`현재 선택된 밴드 · 멤버 ${profile.memberCount}명`}
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
            {members.map((member) => (
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
                    <span className="truncate text-body6 text-neutral-900">
                      {member.name}
                      {member.isSelf ? " (나)" : ""}
                    </span>
                    <span className="truncate text-caption2 text-neutral-600">
                      {member.roleLabel}
                    </span>
                  </div>
                </div>

                {member.isSelf ? (
                  <span className="shrink-0 rounded-full border border-secondary-500 px-3 py-1 text-caption3 text-secondary-500">
                    운영자
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRemoveTargetId(member.id)}
                    className="shrink-0 text-caption4 text-neutral-500"
                  >
                    내보내기
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {pendingInvites.length > 0 ? (
          <>
            <div className="h-4 bg-neutral-200" />

            <div className="flex flex-col gap-4">
              <h2 className="px-5.75 text-body1 text-neutral-700">
                초대 대기 멤버
              </h2>

              <div className="flex flex-col gap-3.5 px-8">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-4 rounded-lg bg-neutral-0 p-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <img
                        src={DefaultAvatar}
                        alt=""
                        className="size-10 shrink-0 rounded-full object-cover"
                      />

                      <div className="flex min-w-0 flex-col gap-0.75">
                        <span className="truncate text-body6 text-neutral-900">
                          {invite.nickname}
                        </span>
                        <span className="truncate text-caption2 text-neutral-600">
                          초대 발송됨
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => cancelPendingInvite(invite.id)}
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
          onConfirm={() => {
            if (removeTargetId) removeMember(removeTargetId);
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
