import { Fragment, useState, type ReactNode } from "react";
import SearchIcon from "@/assets/icons/search.svg";
import DefaultAvatar from "@/assets/images/IMG_my.svg";
import { Header } from "@/components/band/home/Header";
import { Toast } from "@/components/common/Toast/Toast";

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
  { id: "1", nickname: "닉네임 (나)", role: "밴드 · 파트", isSelf: true },
  { id: "2", nickname: "닉네임", role: "밴드 · 파트", isSelf: false },
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
  <div className="flex w-79.5 max-w-full items-center justify-between">
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
);

interface MemberListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderRow: (item: T) => ReactNode;
}

const MemberList = <T,>({ items, getKey, renderRow }: MemberListProps<T>) => (
  <div className="flex flex-col items-center gap-3.5">
    {items.map((item, index) => (
      <Fragment key={getKey(item)}>
        {index > 0 ? <div className="h-px w-full bg-neutral-400" /> : null}
        {renderRow(item)}
      </Fragment>
    ))}
  </div>
);

const InviteMemberPage = () => {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    { id: "3", nickname: "닉네임" },
  ]);
  const [toastOpen, setToastOpen] = useState(false);

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
  };

  const handleCancelInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((invite) => invite.id !== id));
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="멤버 초대" />

      <section className="flex flex-col items-center gap-8.5 px-5.75 pt-2">
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
                        onClick={() => handleRemoveMember(member.id)}
                        className="flex h-6.5 w-14 shrink-0 items-center justify-center gap-2.5 rounded-full border border-neutral-600 py-1.75 text-caption3 text-neutral-600"
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
              <h2 className="text-body1 text-neutral-700">초대 대기 중</h2>

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
                        className="flex h-6.5 w-14 shrink-0 items-center justify-center gap-2.5 rounded-full border border-neutral-600 px-3.75 py-1.75 text-caption3 text-neutral-600"
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
    </main>
  );
};

export default InviteMemberPage;
