import ApplyMemberIcon from "@/assets/icons/band/apply-member.svg";
import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/band/home/Header";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import { useBandProfileStore } from "@/stores/useBandProfileStore";

type ApplicantStatus = "pending" | "accepted" | "rejected";

interface Applicant {
  id: string;
  name: string;
  detail: string;
  status: ApplicantStatus;
}

interface Posting {
  id: string;
  dDay: string;
  title: string;
  tags: string;
  applicants: Applicant[];
}

const POSTING_COUNT = 2;
const APPLICANT_COUNT = 4;

const POSTINGS: Posting[] = [
  {
    id: "1",
    dDay: "D-18",
    title: "드럼 세션 구합니다",
    tags: "드럼 · 인디 · 서울",
    applicants: [
      {
        id: "a1",
        name: "정하람",
        detail: "드럼 · 중급 · 서울",
        status: "pending",
      },
      {
        id: "a2",
        name: "김도윤",
        detail: "드럼 · 상급 · 경기",
        status: "accepted",
      },
    ],
  },
  {
    id: "2",
    dDay: "D-9",
    title: "베이스 세션 구합니다",
    tags: "베이스 · 인디 · 서울",
    applicants: [
      {
        id: "a3",
        name: "김도윤",
        detail: "드럼 · 상급 · 경기",
        status: "rejected",
      },
    ],
  },
];

const ChevronRightIcon = () => (
  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
    <path
      d="M1 1L7 7L1 13"
      stroke="#A3A3A3"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ApplicationManagementPage = () => {
  const profile = useBandProfileStore((state) => state.profile);
  const bandName = profile.name.trim() || "WAVY";

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="받은 지원 관리" />

      <div className="flex flex-col gap-6 px-6 pt-4">
        <NotificationBandBanner
          bandName={bandName}
          description="현재 선택된 밴드의 모집 공고 지원자"
        />

        <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-0 p-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-4">
            <div className="flex size-8.75 shrink-0 items-center justify-center rounded-full bg-secondary-400">
              <img src={ApplyMemberIcon} alt="" />
            </div>
            <span className="whitespace-nowrap text-caption3 text-neutral-600">
              지원 현황 요약
            </span>
          </div>
          <span className="whitespace-nowrap text-body1 text-neutral-800">
            공고{" "}
            <span className="text-h3 tracking-[0.72px] text-secondary-500">
              {POSTING_COUNT}
            </span>{" "}
            · 지원자{" "}
            <span className="text-h3 tracking-[0.72px] text-secondary-500">
              {APPLICANT_COUNT}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {POSTINGS.map((posting) => (
            <div
              key={posting.id}
              className="flex flex-col gap-3 rounded-lg bg-neutral-0 p-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
            >
              <div className="flex flex-col gap-3">
                <span className="self-start rounded-full border border-secondary-500 px-3 py-0.5 text-center text-caption3 text-secondary-400">
                  {posting.dDay}
                </span>

                <div className="flex flex-col gap-1">
                  <h3 className="text-label1 text-neutral-900">
                    {posting.title}
                  </h3>
                  <p className="text-caption3 text-neutral-600">
                    {posting.tags}
                    <span className="mx-1.5 text-neutral-300">|</span>
                    <span className="text-secondary-500">
                      지원자 {posting.applicants.length}명
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {posting.applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className={`flex items-center justify-between gap-3`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <img
                        src={DefaultAvatar}
                        alt=""
                        className="size-10 shrink-0 rounded-full object-cover"
                      />

                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-label1 text-black">
                          {applicant.name}
                        </span>
                        <span className="truncate text-caption2 text-neutral-600">
                          {applicant.detail}{" "}
                          <span className="mx-1.5 text-neutral-300">|</span>
                          <button type="button" className="text-secondary-500">
                            지원서 확인
                          </button>
                        </span>
                      </div>
                    </div>

                    {applicant.status === "pending" ? (
                      <button type="button" className="shrink-0">
                        <ChevronRightIcon />
                      </button>
                    ) : applicant.status === "accepted" ? (
                      <span className="flex py-0.5 px-3.75 shrink-0 items-center justify-center rounded-full bg-secondary-400 text-center text-caption3 text-neutral-0">
                        수락
                      </span>
                    ) : (
                      <span className="flex py-0.5 px-3.75 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-center text-caption3 text-neutral-600">
                        거절
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ApplicationManagementPage;
