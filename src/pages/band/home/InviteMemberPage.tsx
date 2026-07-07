import { Fragment, useState, type ReactNode } from "react";
import SearchIcon from "@/assets/icons/search.svg";
import DefaultAvatar from "@/assets/icons/user-default-profile.svg";
import { Header } from "@/components/band/home/Header";
import { Toast } from "@/components/common/Toast/Toast";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";

interface Member {
  id: string;
  nickname: string;
  role: string;
  isSelf: boolean;
}

interface PendingInvite {
  id: string;
  nickname: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: "1", nickname: "이름", role: "파트", isSelf: true },
  { id: "2", nickname: "이름", role: "파트", isSelf: false },
];

interface MemberRowProps {
  primaryText: string;
  secondaryText: string;
  trailing: ReactNode;
}

const MemberRow = ({
  primaryText,
  secondaryText,
  trailing,
}: MemberRowProps) => (
  <div className="flex h-15 w-full shrink-0 flex-col items-start gap-2.5 self-stretch rounded-lg bg-neutral-0 p-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
    <div className="flex w-full flex-1 items-center justify-between">
      <div className="flex flex-1 items-center gap-3">
        <img
          src={DefaultAvatar}
          alt={primaryText}
          className="size-9.5 shrink-0 rounded-full object-cover"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-0.75">
          <span className="truncate text-caption3 text-neutral-900">
            {primaryText}
          </span>
          <span className="truncate text-caption2 text-neutral-600">
            {secondaryText}
          </span>
        </div>
      </div>

      {trailing}
    </div>
  </div>
);

interface MemberListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderRow: (item: T) => ReactNode;
}

const MemberList = <T,>({ items, getKey, renderRow }: MemberListProps<T>) => (
  <div className="flex w-full flex-col gap-3.5 px-2.25">
    {items.map((item) => (
      <Fragment key={getKey(item)}>{renderRow(item)}</Fragment>
    ))}
  </div>
);

const InviteMemberPage = () => {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    { id: "3", nickname: "이름" },
  ]);
  const [toastOpen, setToastOpen] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);

  const handleInvite = () => {
    if (!search.trim()) return;

    setPendingInvites((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nickname: search.trim() },
    ]);
    setSearch("");
    setToastOpen(true);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
    setRemoveTargetId(null);
  };

  const handleCancelInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((invite) => invite.id !== id));
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="멤버 관리" />

      <section className="flex flex-col items-center gap-6 px-5.75 pt-2">
        <div className="flex h-9 w-87 max-w-full items-center gap-2 rounded-full border border-neutral-500 bg-neutral-0 py-2.25 pl-3.75 pr-4 focus-within:border-secondary-500">
          <img src={SearchIcon} alt="" className="size-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleInvite();
            }}
            placeholder="닉네임 검색"
            className="w-full bg-transparent text-caption3 text-neutral-900 outline-none placeholder:text-caption3 placeholder:text-neutral-500"
          />
        </div>

        <div className="flex w-full flex-col gap-9">
          <div className="flex w-full flex-col gap-4">
            <h2 className="text-body1 text-neutral-700">현재 멤버</h2>

            <MemberList
              items={members}
              getKey={(member) => member.id}
              renderRow={(member) => (
                <MemberRow
                  primaryText={member.nickname}
                  secondaryText={member.role}
                  trailing={
                    member.isSelf ? (
                      <span className="shrink-0 text-caption3 text-neutral-900">
                        운영자
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRemoveTargetId(member.id)}
                        className="shrink-0 text-right text-caption4 text-neutral-600"
                      >
                        내보내기
                      </button>
                    )
                  }
                />
              )}
            />
          </div>

          {pendingInvites.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <h2 className="text-body1 text-neutral-700">초대 대기 멤버</h2>

              <MemberList
                items={pendingInvites}
                getKey={(invite) => invite.id}
                renderRow={(invite) => (
                  <MemberRow
                    primaryText={invite.nickname}
                    secondaryText="초대 발송됨"
                    trailing={
                      <button
                        type="button"
                        onClick={() => handleCancelInvite(invite.id)}
                        className="shrink-0 text-right text-caption3 text-error"
                      >
                        취소
                      </button>
                    }
                  />
                )}
              />
            </div>
          ) : null}
        </div>
      </section>

      <Toast
        open={toastOpen}
        message="초대장을 발송했어요"
        onClose={() => setToastOpen(false)}
      />

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
            if (removeTargetId) handleRemoveMember(removeTargetId);
          }}
        />
      </ModalOverlay>
    </main>
  );
};

export default InviteMemberPage;
