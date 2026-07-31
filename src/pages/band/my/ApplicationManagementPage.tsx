import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApplyMemberIcon from "@/assets/icons/band/apply-member.svg";
import ArrowRightIcon from "@/assets/icons/band/arrow-right-my.svg";
import DefaultAvatar from "@/assets/icons/band/user-default-profile.svg";
import { Header } from "@/components/band/home/Header";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { useBandMyPageQuery } from "@/hooks/api/user/useBandMyPage";
import { useReceivedApplicationsQuery } from "@/hooks/api/user/useReceivedApplications";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import { useTodayTick } from "@/hooks/useTodayTick";
import { formatDDayLabel, getDDay } from "@/utils/getDDay";
import type { RecruitmentStatusFilter } from "@/types/user/receivedApplications";

const TABS: { code: RecruitmentStatusFilter; label: string }[] = [
  { code: "OPEN", label: "진행중인 공고" },
  { code: "CLOSE", label: "마감된 공고" },
];

const ApplicationManagementPage = () => {
  const navigate = useNavigate();
  const { data: bandMyPage } = useBandMyPageQuery();
  const bandName = bandMyPage?.bandName ?? "";
  const today = useTodayTick();

  const [activeTab, setActiveTab] = useState<RecruitmentStatusFilter>("OPEN");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReceivedApplicationsQuery(activeTab);

  const postings = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const applicantCount = postings.reduce(
    (sum, posting) => sum + posting.recruiters.length,
    0,
  );

  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  return (
    <main className="relative min-h-dvh bg-neutral-0">
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
              {postings.length}
            </span>{" "}
            · 지원자{" "}
            <span className="text-h3 tracking-[0.72px] text-secondary-500">
              {applicantCount}
            </span>
          </span>
        </div>

        <div className="flex rounded-md bg-[#FFF6E5] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.code}
              type="button"
              onClick={() => setActiveTab(tab.code)}
              className={`flex flex-1 items-center justify-center gap-2.5 rounded-md border border-transparent px-10.75 py-1.25 text-center text-caption3 text-black ${
                activeTab === tab.code
                  ? "border-black/4 bg-neutral-0 shadow-[0_3px_8px_0_rgba(0,0,0,0.12),0_3px_1px_0_rgba(0,0,0,0.04)]"
                  : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {postings.length === 0 ? (
          <EmptyState
            title={
              activeTab === "CLOSE"
                ? "마감된 공고가 없어요"
                : "진행중인 공고가 없어요"
            }
            description={
              activeTab === "CLOSE"
                ? "마감된 모집 공고가 여기에 표시돼요"
                : "진행중인 모집 공고가 여기에 표시돼요"
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {postings.map((posting) => (
              <div
                key={posting.recruitmentPostId}
                className="flex flex-col gap-7 rounded-lg bg-neutral-0 px-3.75 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
              >
                <div className="flex flex-col gap-3">
                  <span className="self-start rounded-full border border-secondary-500 px-3 py-0.5 text-center text-caption3 text-secondary-400">
                    {formatDDayLabel(getDDay(posting.dueDate.split(" ")[0], today))}
                  </span>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-label1 text-neutral-900">
                      {posting.title}
                    </h3>
                    <p className="text-caption3 text-neutral-600">
                      {`${posting.part} · ${posting.genre} · ${posting.region}`}
                      <span className="mx-1.5 text-neutral-300">|</span>
                      <span className="text-secondary-500">
                        지원자 {posting.recruiters.length}명
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {posting.recruiters.map((applicant, index) => (
                    <Fragment key={applicant.applySubmissionId}>
                      {index > 0 ? (
                        <div className="h-px bg-neutral-400" />
                      ) : null}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <img
                            src={applicant.profileImageUrl ?? DefaultAvatar}
                            alt=""
                            className="size-10 shrink-0 rounded-full object-cover"
                          />

                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="truncate text-label1 text-black">
                              {applicant.nickname}
                            </span>
                            <span className="truncate text-caption2 text-neutral-600">
                              {`${applicant.part} · ${applicant.level} · ${applicant.region}`}{" "}
                              <span className="mx-1.5 text-neutral-300">|</span>
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/band/my/applications/${applicant.applySubmissionId}`,
                                    { state: { status: applicant.status } },
                                  )
                                }
                                className="text-caption3 text-secondary-500"
                              >
                                지원서 확인
                              </button>
                            </span>
                          </div>
                        </div>

                        {applicant.status === "PENDING" ? (
                          <button type="button" className="shrink-0">
                            <img src={ArrowRightIcon} alt="" />
                          </button>
                        ) : applicant.status === "BAND_ACCEPTED" ? (
                          <span className="flex py-0.5 px-3.75 shrink-0 items-center justify-center rounded-full bg-secondary-400 text-center text-caption3 text-neutral-0">
                            수락
                          </span>
                        ) : (
                          <span className="flex py-0.5 px-3.75 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-center text-caption3 text-neutral-600">
                            거절
                          </span>
                        )}
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>
    </main>
  );
};

export default ApplicationManagementPage;
