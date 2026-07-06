import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BSceneLogo from "@/assets/bscene-logo.svg";
import HamburgerIcon from "@/assets/icons/hamburger.svg";
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { BandProfileCard } from "@/components/band/BandProfileCard/BandProfileCard";
import { StatRow } from "@/components/band/StatRow/StatRow";
import { Tabs } from "@/components/band/Tabs/Tabs";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import ConcertCard from "@/components/common/Card/ConcertCard";

const HOME_TABS = [
  { id: "content", label: "콘텐츠" },
  { id: "schedule", label: "일정" },
  { id: "music", label: "음원" },
];

// TODO: API 연동 후 실제 공연 목록으로 교체
const MOCK_CONCERTS = [
  {
    id: "1",
    month: "MAY",
    day: "17",
    title: "공연명",
    location: "공연 정보",
    dateTime: "2026.05.17. 18:00",
    status: "등록 완료",
  },
  {
    id: "2",
    month: "MAY",
    day: "17",
    title: "공연명",
    location: "공연 정보",
    dateTime: "2026.05.17. 18:00",
    status: "준비중",
  },
];

const BandHomePage = () => {
  const navigate = useNavigate();
  const profile = useBandProfileStore((state) => state.profile);

  const [activeTab, setActiveTab] = useState("content");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const subtitle = `${profile.genre} · ${profile.regions.join(", ")} · 멤버 ${profile.memberCount}명`;

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0 px-5 pb-24">
      <header className="relative flex h-12 items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-secondary-500 px-2.25 py-1.5 text-caption1 font-semibold text-white"
        >
          밴드 모드
          <img src={ArrowDownIcon} />
        </button>

        <img
          src={BSceneLogo}
          alt="B:Scene"
          className="absolute left-1/2 h-7.5 w-24 -translate-x-1/2"
        />

        <button type="button" aria-label="메뉴">
          <img src={HamburgerIcon} alt="" className="size-6" />
        </button>
      </header>

      <section className="mt-6 flex flex-1 flex-col">
        <BandProfileCard
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          verified={profile.verified}
          subtitle={subtitle}
          onEditProfile={() => navigate("/band/profile/edit")}
        />

        <div className="mt-4">
          <StatRow
            stats={[
              { label: "팔로워", value: profile.stats.followers },
              { label: "공연", value: profile.stats.concerts },
              { label: "영상", value: profile.stats.videos },
            ]}
          />
        </div>

        <div className="mt-4 flex gap-2.25">
          <button
            type="button"
            onClick={() => navigate("/band/videos/new")}
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            콘텐츠 등록
          </button>
          <button
            type="button"
            onClick={() => navigate("/band/concerts/new/step1")}
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            일정 등록
          </button>
          <button
            type="button"
            onClick={() => navigate("/band/music/new")}
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            음원 연결
          </button>
        </div>

        <div className="mt-6 flex flex-1 flex-col gap-4">
          <Tabs
            tabs={HOME_TABS}
            activeTabId={activeTab}
            onChange={setActiveTab}
          />

          <div className="flex flex-1 flex-col">
          {activeTab === "content" ? (
            <EmptyState
              title="등록된 콘텐츠가 없어요"
              description={
                <>
                  콘텐츠를 등록하면 팬들이
                  <br />
                  소식을 받아볼 수 있어요
                </>
              }
              actionLabel="등록하기"
              onAction={() => navigate("/band/videos/new")}
            />
          ) : null}

          {activeTab === "schedule" ? (
            <div className="flex flex-col gap-3">
              {MOCK_CONCERTS.map((concert) => (
                <ConcertCard
                  key={concert.id}
                  month={concert.month}
                  day={concert.day}
                  title={concert.title}
                  location={concert.location}
                  dateTime={concert.dateTime}
                  status={concert.status}
                  actions={
                    <>
                      <button
                        type="button"
                        className="flex h-6.5 items-center justify-center gap-2.5 rounded-lg bg-[#FFF6E5] px-3.75 py-1.75 text-caption3 text-secondary-500"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(concert.id)}
                        className="flex h-6.5 items-center justify-center gap-2.5 rounded-lg bg-neutral-300 px-3.75 py-1.75 text-caption3 text-neutral-600"
                      >
                        삭제
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          ) : null}

          {activeTab === "music" ? (
            <EmptyState
              title="등록된 음원이 없어요"
              description={
                <>
                  음원 링크를 등록하면 팬들이
                  <br />
                  바로 들으러 갈 수 있어요
                </>
              }
              actionLabel="음원 연결하기"
              onAction={() => navigate("/band/music/new")}
            />
          ) : null}
          </div>
        </div>
      </section>

      <ModalOverlay
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
      >
        <Modal
          tone="orange"
          title="공연을 삭제할까요?"
          description={<>삭제된 공연 정보는 복구할 수 없어요</>}
          confirmLabel="삭제"
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={() => {
            // TODO: API 연동 후 실제 삭제 처리
            setDeleteTargetId(null);
          }}
        />
      </ModalOverlay>
    </main>
  );
};

export default BandHomePage;
