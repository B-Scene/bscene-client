import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { StatRow } from "@/components/band/home/StatRow";
import { ModeSwitchSheet } from "@/components/band/home/ModeSwitchSheet";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { ProfileSummary } from "@/components/band/my/ProfileSummary";
import { MenuSection } from "@/components/band/my/MenuSection";
import { useBandMyPageQuery } from "@/hooks/api/user/useBandMyPage";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { useLeaveBand } from "@/hooks/api/band/useBandMember";
import { useLogoutAndRedirect } from "@/hooks/useLogoutAndRedirect";
import { getPartLabel } from "@/utils/bandLabels";

const MyPage = () => {
  const navigate = useNavigate();
  const { data } = useBandMyPageQuery();
  const logout = useLogoutAndRedirect();
  const activeBandId = useActiveBandId();
  const leaveBand = useLeaveBand(activeBandId ?? NaN);

  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLeaveBandOpen, setIsLeaveBandOpen] = useState(false);

  const bandName = data?.bandName ?? "";
  const partsLabel = data?.parts.map(getPartLabel).join(" · ") ?? "";

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0">
      <Header title="마이" showBack={false} variant="main" />

      <section className="bg-secondary-0 px-5 py-6">
        <ProfileSummary
          name={data?.nickname ?? ""}
          subtitle={[bandName, partsLabel].filter(Boolean).join(" · ")}
          bandLabel={bandName}
          onSwitchBand={() => setIsModeSwitchOpen(true)}
        />

        <div className="mt-4">
          <StatRow
            stats={[
              { label: "팔로워", value: data?.follower ?? 0 },
              { label: "지원자", value: data?.applicant ?? 0 },
              { label: "공연", value: data?.performance ?? 0 },
            ]}
          />
        </div>
      </section>

      <div className="flex flex-col gap-4 pt-4.5 pb-5">
        {data?.isBandMember ? (
          <>
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
                {
                  id: "leave-band",
                  label: "밴드 탈퇴", // FIXME: 디자인 확정 전 임시 문구
                  onClick: () => setIsLeaveBandOpen(true),
                },
              ]}
            />

            <div className="h-px bg-neutral-400" />
          </>
        ) : null}

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
            logout();
          }}
        />
      </ModalOverlay>

      <ModalOverlay
        open={isLeaveBandOpen}
        onClose={() => setIsLeaveBandOpen(false)}
      >
        <Modal
          tone="orange"
          title="밴드를 탈퇴할까요?" // FIXME: 디자인 확정 전 임시 문구
          description="탈퇴하면 밴드 멤버 자격이 사라져요" // FIXME: 디자인 확정 전 임시 문구
          confirmLabel="탈퇴" // FIXME: 디자인 확정 전 임시 문구
          onCancel={() => setIsLeaveBandOpen(false)}
          onConfirm={async () => {
            await leaveBand.mutateAsync();
            setIsLeaveBandOpen(false);
            navigate("/band/my", { replace: true });
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
