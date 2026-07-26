import { Header } from "@/components/band/home/Header";
import { SessionApplicationProfile } from "@/components/band/my/SessionApplicationProfile";
import type { SessionApplicationProfileData } from "@/components/band/my/SessionApplicationProfile";

const MOCK_IS_BAND_OWNER = true;

const MOCK_APPLICATION = {
  recruitmentTitle: "드럼 세션 구합니다",
  bandName: "WAVY",
  dueDate: "2026. 05. 24. 18:00",
};

const MOCK_APPLICANT: SessionApplicationProfileData = {
  part: "드럼",
  nickname: "정하람",
  level: "중급",
  region: "서울",
  profileImageUrl: null,
  introQuote: "선명한 리듬과 안정적인 합주",
  introText:
    "안녕하세요. 드럼 세션으로 활동 중인 정하람입니다.\n정기 합주와 소규모 라이브 경험을 바탕으로 밴드의 전체 사운드를 해치지 않으면서 안정적으로 리듬을 잡는 편입니다.\n\n인디팝과 록 장르를 주로 연주하며, 공연과 앨범 작업 일정에 맞춰 꾸준히 참여할 수 있습니다.",
  preferredGenres: ["인디", "팝"],
  availableActivities: ["정기 합주", "라이브 공연", "앨범 작업"],
  careers: [
    {
      id: 1,
      period: "2026.01 ~ 현재",
      title: "B밴드 드러머 활동",
      description:
        "정기 합주, 소규모 라이브 8회, 공연 셋리스트 구성과 리듬 편곡 참여",
    },
    {
      id: 2,
      period: "2025.09",
      title: "홍대 라이브클럽 드럼 세션",
      description: "A밴드 단독 공연 세션 참여",
    },
  ],
  portfolioLinks: [
    {
      id: 1,
      title: "2025 봄 정기공연 합주 영상",
      url: "youtube.com/@haramdrums",
      thumbnailUrl: null,
    },
  ],
};

const ApplicationDetailPage = () => {
  return (
    <main className="relative min-h-dvh bg-neutral-0">
      <Header title="" />

      <section className="flex flex-col gap-4 px-6 pt-4">
        <span className="text-body1 text-neutral-900">지원 공고</span>
        <div className="flex flex-col gap-1">
          <h1 className="text-label1 text-neutral-900">
            {MOCK_APPLICATION.recruitmentTitle} · {MOCK_APPLICATION.bandName}
          </h1>
          <span className="text-caption3 text-neutral-600">
            모집 마감 {MOCK_APPLICATION.dueDate}
          </span>
        </div>
      </section>

      <div className="mt-4 h-4 bg-secondary-0" aria-hidden="true" />

      <SessionApplicationProfile
        data={MOCK_APPLICANT}
        isBandOwner={MOCK_IS_BAND_OWNER}
      />

      <div className="flex items-center justify-center gap-4 px-8 pt-3 pb-9">
        <button
          type="button"
          className="flex h-9.5 w-39.25 items-center justify-center rounded-lg border border-secondary-500 text-body1 text-secondary-500"
        >
          거절
        </button>
        <button
          type="button"
          className="flex h-9.5 w-39.25 items-center justify-center rounded-lg bg-secondary-500 text-body1 text-neutral-0"
        >
          수락
        </button>
      </div>
    </main>
  );
};

export default ApplicationDetailPage;
