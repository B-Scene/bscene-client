import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/common/Header/Header";
import { StatRow } from "@/components/band/home/StatRow";
import { ModeSwitchSheet } from "@/components/band/home/ModeSwitchSheet";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { ProfileSummary } from "@/components/band/my/ProfileSummary";
import { MenuSection } from "@/components/band/my/MenuSection";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { useBandMyPageQuery } from "@/hooks/api/user/useBandMyPage";
import { useMyProfilesQuery } from "@/hooks/api/user/useMyProfiles";
import { useLogoutAndRedirect } from "@/hooks/useLogoutAndRedirect";
import { getPartLabel } from "@/utils/bandLabels";

const MyPage = () => {
  const navigate = useNavigate();
  const { data } = useBandMyPageQuery();
  const {
    data: bandProfiles,
    isLoading: isBandProfilesLoading,
    isError: isBandProfilesError,
  } = useMyProfilesQuery({ type: "band" });
  const logout = useLogoutAndRedirect();

  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const activeBandProfile = bandProfiles?.bandProfiles.find(
    (band) => band.isActive,
  );
  const hasBand = Boolean(activeBandProfile);
  const showNoBandState =
    !hasBand && !isBandProfilesLoading && !isBandProfilesError;

  const bandName = hasBand ? (data?.bandName ?? "") : "";
  const partsLabel = (data?.parts ?? []).map(getPartLabel).join(" · ");

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <Header title="마이" showBack={false} variant="main" />

      <section className="bg-secondary-0 px-5 py-6">
        <ProfileSummary
          name={data?.nickname ?? ""}
          subtitle={[bandName, partsLabel].filter(Boolean).join(" · ")}
          bandLabel={bandName}
          profileImageUrl={activeBandProfile?.profileImageUrl}
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
        {hasBand ? (
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
              ]}
            />

            <div className="h-px bg-neutral-400" />
          </>
        ) : showNoBandState ? (
          <>
            <div className="px-6 py-8">
              <EmptyState
                title="등록된 밴드가 없어요"
                description={
                  <>
                    밴드를 등록하면 콘텐츠, 공연, 라이브 등
                    <br />
                    다양한 활동을 관리할 수 있어요
                  </>
                }
                actionLabel="밴드 등록하기"
                onAction={() => navigate("/band/profile/new")}
              />
            </div>

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

      <ModeSwitchSheet
        open={isModeSwitchOpen}
        onClose={() => setIsModeSwitchOpen(false)}
      />
    </main>
  );
};

export default MyPage;
