import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/common/Header/Header";
import { StatRow } from "@/components/band/home/StatRow";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { ProfileSummary } from "@/components/fan/my/ProfileSummary";
import { MenuSection } from "@/components/band/my/MenuSection";
import { useFanMyPageQuery } from "@/hooks/api/user/useFanMyPage";
import { useFanInformationQuery } from "@/hooks/api/user/useFanInformation";
import { useGenres, useRegions } from "@/hooks/api/onboarding/useOnboarding";
import { useLogoutAndRedirect } from "@/hooks/useLogoutAndRedirect";
import type { CodeName } from "@/types/onboarding/onboarding";

const getCodeName = (codeNames: CodeName[], code: string) =>
  codeNames.find((item) => item.code === code)?.name ?? code;

const buildSubtitle = (
  data: {
    genre: string;
    additionalGenreCount: number;
    regions: string[];
  },
  genres: CodeName[],
  regions: CodeName[],
) => {
  const genreLabel = data.genre ? getCodeName(genres, data.genre) : "";
  const genreText =
    data.additionalGenreCount > 0
      ? `${genreLabel} 외 ${data.additionalGenreCount}`
      : genreLabel;
  const regionText = (data.regions ?? [])
    .map((region) => getCodeName(regions, region))
    .join(", ");

  return [genreText, regionText].filter(Boolean).join(" · ");
};

const MyPage = () => {
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { data } = useFanMyPageQuery();
  const { data: fanInformation } = useFanInformationQuery();
  const logout = useLogoutAndRedirect();
  const { data: genres = [] } = useGenres();
  const { data: regions = [] } = useRegions();

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <Header title="마이" showBack={false} variant="main" />

      <section className="bg-primary-0 px-5 py-6">
        <ProfileSummary
          name={data?.nickname ?? ""}
          subtitle={data ? buildSubtitle(data, genres, regions) : ""}
          profileImageUrl={fanInformation?.profileImageUrl}
        />

        <div className="mt-4">
          <StatRow
            stats={[
              {
                label: "팔로잉",
                value: data?.followingCount ?? 0,
                onClick: () => navigate("/fan/my/followed-bands"),
              },
              {
                label: "관심 공연",
                value: data?.interestedPerformanceCount ?? 0,
                onClick: () => navigate("/fan/my/interested-concerts"),
              },
              {
                label: "참여 공연",
                value: data?.participatedPerformanceCount ?? 0,
                onClick: () => navigate("/fan/my/attended-concerts"),
              },
            ]}
          />
        </div>
      </section>

      <div className="flex flex-col gap-4 pt-4.5 pb-5">
        <MenuSection
          title="탐색 활동"
          items={[
            {
              id: "followed-bands",
              label: "팔로우한 밴드",
              onClick: () => navigate("/fan/my/followed-bands"),
            },
            {
              id: "interested-concerts",
              label: "관심 공연 목록",
              onClick: () => navigate("/fan/my/interested-concerts"),
            },
            {
              id: "attended-concerts",
              label: "공연 참여 기록",
              onClick: () => navigate("/fan/my/attended-concerts"),
            },
          ]}
        />

        <div className="h-px bg-neutral-400" />

        <MenuSection
          title="알림"
          items={[
            {
              id: "concert-alert",
              label: "공연 알림 설정",
              onClick: () => navigate("/fan/my/concert-alert"),
            },
            {
              id: "live-alert",
              label: "라이브 알림 설정",
              onClick: () => navigate("/fan/my/live-alert"),
            },
          ]}
        />

        <div className="h-px bg-neutral-400" />

        <MenuSection
          title="계정"
          items={[
            {
              id: "edit-profile",
              label: "내 정보 수정",
              onClick: () => navigate("/fan/my/profile/edit"),
            },
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
    </main>
  );
};

export default MyPage;
