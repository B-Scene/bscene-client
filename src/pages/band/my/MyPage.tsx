import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { StatRow } from "@/components/band/home/StatRow";
import { ModeSwitchSheet } from "@/components/band/home/ModeSwitchSheet";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { ProfileSummary } from "@/components/band/my/ProfileSummary";
import { MenuSection } from "@/components/band/my/MenuSection";

const MEMBER_NAME = "정하람";
const MEMBER_INSTRUMENT = "드럼";
const APPLICANT_COUNT = 24;

const MyPage = () => {
  const navigate = useNavigate();
  const profile = useBandProfileStore((state) => state.profile);

  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const bandName = profile.name.trim() || "WAVY";

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0">
      <Header title="마이" showBack={false} />

      <section className="bg-secondary-0 px-5 py-6">
        <ProfileSummary
          name={MEMBER_NAME}
          subtitle={`${bandName} · ${MEMBER_INSTRUMENT}`}
          bandLabel={bandName}
          onSwitchBand={() => setIsModeSwitchOpen(true)}
        />

        <div className="mt-4">
          <StatRow
            stats={[
              { label: "팔로워", value: profile.stats.followers },
              { label: "지원자", value: APPLICANT_COUNT },
              { label: "공연", value: profile.stats.concerts },
            ]}
          />
        </div>
      </section>

      <div className="flex flex-col gap-4 pt-4.5 pb-5">
        <MenuSection
          title="현재 선택된 밴드 관리"
          items={[
            {
              id: "band-profile",
              label: "밴드 프로필 관리",
              onClick: () => navigate("/band/profile/edit"),
            },
            {
              id: "members",
              label: "멤버 관리",
              onClick: () => navigate("/band/profile/invite"),
            },
            {
              id: "postings",
              label: "모집 공고 관리",
              onClick: () => navigate("/band/profile/postings"),
            },
            {
              id: "applications",
              label: "받은 지원 관리",
              onClick: () => navigate("/band/profile/applications"),
            },
          ]}
        />

        <div className="h-px bg-neutral-400" />

        <MenuSection
          title="알림"
          items={[
            {
              id: "recruit-alert",
              label: "모집 공고 알림 설정",
              onClick: () => navigate("/band/my/recruit-alert"),
            },
            {
              id: "live-alert",
              label: "라이브 알림 설정",
              onClick: () => navigate("/band/my/live-alert"),
            },
          ]}
        />

        <div className="h-px bg-neutral-400" />

        <MenuSection
          title="계정"
          items={[
            {
              id: "logout",
              label: "로그아웃",
              onClick: () => setIsLogoutOpen(true),
            },
          ]}
        />
      </div>

      <ModalOverlay open={isLogoutOpen} onClose={() => setIsLogoutOpen(false)}>
        <Modal
          tone="orange"
          title="로그아웃 할까요?"
          description="언제든지 다시 로그인할 수 있어요"
          confirmLabel="로그아웃"
          onCancel={() => setIsLogoutOpen(false)}
          onConfirm={() => {
            setIsLogoutOpen(false);
            navigate("/login");
          }}
        />
      </ModalOverlay>

      <ModeSwitchSheet
        open={isModeSwitchOpen}
        onClose={() => setIsModeSwitchOpen(false)}
      />
    </main>
  );
};

export default MyPage;
