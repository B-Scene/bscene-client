import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SwapIcon from "@/assets/icons/swap.svg";
import DefaultBandAvatar from "@/assets/icons/band/band-default-profile.svg";
import { HomeHeader } from "@/components/common/Header/HomeHeader";
import { NotificationBellIcon } from "@/components/common/Header/NotificationBellIcon";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { useConcertsStore, type Concert } from "@/stores/useConcertsStore";
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

const MONTH_ABBREVIATIONS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const CONCERT_STATUS_LABELS: Record<Concert["status"], string> = {
  scheduled: "등록 완료",
  draft: "준비중",
};

const getConcertCardProps = (concert: Concert) => {
  const [, month, day] = concert.startDate.split("-");
  const dateLabel = `${concert.startDate.replaceAll("-", ".")}.`;

  return {
    month: MONTH_ABBREVIATIONS[Number(month) - 1] ?? "",
    day: day ?? "",
    dateTime: concert.time ? `${dateLabel} ${concert.time}` : dateLabel,
    statusLabel: CONCERT_STATUS_LABELS[concert.status],
  };
};

const BandHomePage = () => {
  const navigate = useNavigate();
  const profile = useBandProfileStore((state) => state.profile);
  const concerts = useConcertsStore((state) => state.concerts);
  const removeConcert = useConcertsStore((state) => state.removeConcert);

  const [activeTab, setActiveTab] = useState("content");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);

  const hasBand = Boolean(profile.name.trim());
  const subtitle = `${profile.genre} · ${profile.regions.join(", ")} · 멤버 ${profile.memberCount}명`;
  const goToCreateBand = () => navigate("/band/profile/new");

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0 px-5 pb-24">
      <HomeHeader
        rightAction={
          <>
            <button
              type="button"
              aria-label="알림"
              onClick={() => navigate("/band/notifications")}
              className="text-neutral-900"
            >
              <NotificationBellIcon hasUnread={false} />
            </button>

            <button
              type="button"
              aria-label="모드 전환"
              onClick={() => setIsModeSwitchOpen(true)}
            >
              <img src={SwapIcon} alt="" className="size-6" />
            </button>
          </>
        }
      />

      <section className="mt-6 flex flex-1 flex-col">
        {hasBand ? (
          <BandProfileCard
            name={profile.name}
            avatarUrl={profile.avatarUrl}
            verified={profile.verified}
            subtitle={subtitle}
            onEditProfile={() => navigate("/band/profile/edit")}
          />
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={DefaultBandAvatar}
              alt=""
              className="size-18 shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-[20px] leading-5 font-bold text-black">
                등록된 밴드가 없어요
              </h2>
              <p className="text-caption1 text-neutral-700">
                새로운 밴드를 등록하고
                <br />
                팬들과 소통해보세요!
              </p>
            </div>
          </div>
        )}

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
            onClick={
              hasBand ? () => navigate("/band/videos/new") : goToCreateBand
            }
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            콘텐츠 등록
          </button>
          <button
            type="button"
            onClick={
              hasBand ? () => navigate("/band/concerts/new") : goToCreateBand
            }
            className="flex h-9.5 flex-1 items-center justify-center rounded-lg bg-secondary-400 px-3 py-2 text-body1 text-white"
          >
            일정 등록
          </button>
          <button
            type="button"
            onClick={
              hasBand ? () => navigate("/band/music/new") : goToCreateBand
            }
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
            {!hasBand ? (
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
                onAction={goToCreateBand}
              />
            ) : null}

            {hasBand && activeTab === "content" ? (
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

            {hasBand && activeTab === "schedule" && concerts.length === 0 ? (
              <EmptyState
                title="등록된 일정이 없어요"
                description={
                  <>
                    공연 일정을 등록하면 팬들이
                    <br />
                    소식을 받아볼 수 있어요
                  </>
                }
                actionLabel="등록하기"
                onAction={() => navigate("/band/concerts/new")}
              />
            ) : null}

            {hasBand && activeTab === "schedule" && concerts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {concerts.map((concert) => {
                  const cardProps = getConcertCardProps(concert);

                  return (
                    <ConcertCard
                      key={concert.id}
                      month={cardProps.month}
                      day={cardProps.day}
                      title={concert.title}
                      location={concert.location}
                      dateTime={cardProps.dateTime}
                      status={cardProps.statusLabel}
                      isPending={concert.status === "draft"}
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/band/concerts/${concert.id}/edit`)
                            }
                            className="flex h-6.5 items-center justify-center gap-2.5 rounded-lg bg-[#FFF6E5] px-3.75 py-1.75 text-center text-caption3 text-neutral-600"
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
                  );
                })}
              </div>
            ) : null}

            {hasBand && activeTab === "music" ? (
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
            if (deleteTargetId) removeConcert(deleteTargetId);
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
