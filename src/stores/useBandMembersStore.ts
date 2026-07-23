import { create } from "zustand";

export interface BandMember {
  id: string;
  name: string;
  isSelf: boolean;
  roleLabel: string;
}

export interface PendingInvite {
  id: string;
  nickname: string;
}

const INITIAL_MEMBERS: BandMember[] = [
  { id: "1", name: "민정", isSelf: true, roleLabel: "멤버 · 보컬" },
  { id: "2", name: "김윤호", isSelf: false, roleLabel: "멤버 · 기타" },
  { id: "3", name: "김진호", isSelf: false, roleLabel: "세션 · 베이스" },
];

interface BandMembersState {
  members: BandMember[];
  pendingInvites: PendingInvite[];
  removeMember: (id: string) => void;
  updateSelfMember: (updates: { name: string; part: string }) => void;
  addPendingInvite: (nickname: string) => void;
  cancelPendingInvite: (id: string) => void;
}

export const useBandMembersStore = create<BandMembersState>((set) => ({
  members: INITIAL_MEMBERS,
  pendingInvites: [],
  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((member) => member.id !== id),
    })),
  updateSelfMember: ({ name, part }) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.isSelf
          ? {
              ...member,
              name,
              roleLabel: `${member.roleLabel.split(" · ")[0]} · ${part}`,
            }
          : member,
      ),
    })),
  addPendingInvite: (nickname) =>
    set((state) => ({
      pendingInvites: [
        ...state.pendingInvites,
        { id: crypto.randomUUID(), nickname },
      ],
    })),
  cancelPendingInvite: (id) =>
    set((state) => ({
      pendingInvites: state.pendingInvites.filter(
        (invite) => invite.id !== id,
      ),
    })),
}));
