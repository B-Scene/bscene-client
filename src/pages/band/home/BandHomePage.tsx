import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BSceneLogo from "@/assets/bscene-logo.svg";
import HamburgerIcon from "@/assets/icons/hamburger.svg";
import RefreshIcon from "@/assets/icons/band/menu-reload.svg";
import MembersIcon from "@/assets/icons/band/menu-members.svg";
import ContentIcon from "@/assets/icons/band/menu-content.svg";
import ScheduleIcon from "@/assets/icons/band/menu-schedule.svg";
import MusicIcon from "@/assets/icons/band/menu-music.svg";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { BandProfileCard } from "@/components/band/home/BandProfileCard";
import { StatRow } from "@/components/band/home/StatRow";
import { Tabs } from "@/components/band/home/Tabs";
import { ModeSwitchSheet } from "@/components/band/home/ModeSwitchSheet";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import ConcertCard from "@/components/common/Card/ConcertCard";

const HOME_TABS = [
  { id: "content", label: "콘텐츠" },
  { id: "schedule", label: "일정" },
  { id: "music", label: "음원" },
];

const INITIAL_CONCERTS = [
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
  const [concerts, setConcerts] = useState(INITIAL_CONCERTS);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);

  const subtitle = `${profile.genre} · ${profile.regions.join(", ")} · 멤버 ${profile.memberCount}명`;

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0 px-5 pb-24">
      <header className="relative flex h-12 items-center justify-end">
        <img
          src={BSceneLogo}
          alt="B:Scene"
          className="absolute left-1/2 h-7.5 w-24 -translate-x-1/2"
        />

        <div className="relative">
          <button
            type="button"
            aria-label="메뉴"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <img src={HamburgerIcon} alt="" className="size-6" />
          </button>

          {isMenuOpen ? (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />

              <div className="absolute right-0 top-full z-50 mt-2 flex flex-col gap-4 rounded-2xl bg-neutral-0 p-4 shadow-[0_4px_20px_0_rgba(0,0,0,0.12)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsModeSwitchOpen(true);
                  }}
                  className="flex w-full items-start gap-2 text-left"
                >
                  <img src={RefreshIcon} alt="" />
                  <span className="flex flex-col items-start gap-1.5">
                    <span className="text-body1 text-neutral-900">
                      모드 및 밴드 전환
                    </span>
                    <span className="text-caption4 text-neutral-600">
                      현재 : 밴드모드 · {profile.name}
                    </span>
                  </span>
                </button>

                <div className="h-px w-32.5 bg-neutral-400" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/band/profile/invite");
                  }}
                  className="flex w-full items-center gap-2 text-left text-body1 text-neutral-900"
                >
                  <img src={MembersIcon} alt="" />
                  멤버 관리
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab("content");
                  }}
                  className="flex w-full items-center gap-2 text-left text-body1 text-neutral-900"
                >
                  <img src={ContentIcon} alt="" />
                  콘텐츠 관리
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab("schedule");
                  }}
                  className="flex w-full items-center gap-2 text-left text-body1 text-neutral-900"
                >
                  <img src={ScheduleIcon} alt="" />
                  일정 관리
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab("music");
                  }}
                  className="flex w-full items-center gap-2 text-left text-body1 text-neutral-900"
                >
                  <img src={MusicIcon} alt="" />
                  음원 관리
                </button>
              </div>
            </>
          ) : null}
        </div>
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
            onClick={() => navigate("/band/concerts/new")}
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            일정 등록
          </button>
          <button
            type="button"
            onClick={() => navigate("/band/music/new")}
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            음원 등록
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
                {concerts.map((concert) => (
                  <ConcertCard
                    key={concert.id}
                    month={concert.month}
                    day={concert.day}
                    title={concert.title}
                    location={concert.location}
                    dateTime={concert.dateTime}
                    status={concert.status}
                    isPending={concert.status === "준비중"}
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
                actionLabel="등록하기"
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
            setConcerts((prev) => prev.filter((concert) => concert.id !== deleteTargetId));
            setDeleteTargetId(null);
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

export default BandHomePage;
