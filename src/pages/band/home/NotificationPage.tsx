import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import BandDefaultProfileImage from "@/assets/icons/band/band-default-profile.svg";
import InviteAlertIcon from "@/assets/icons/band/invite-alert.svg";
import CheckIcon from "@/assets/icons/band/Monochrome.svg";
import { Input } from "@/components/common/Input/Input";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Select } from "@/components/common/Select/Select";

const PART_OPTIONS = ["보컬", "기타", "베이스", "드럼", "키보드"];

type NotificationItem =
  | {
      id: string;
      type: "info";
      title: string;
      time: string;
    }
  | {
      id: string;
      type: "invite";
      bandName: string;
      position: string;
      time: string;
      bandTag: string;
      role: string;
    };

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notification-invite-1",
    type: "invite",
    bandName: "WAVY",
    position: "보컬",
    time: "1시간 전",
    bandTag: "인디팝 · 서울 · 멤버 5명",
    role: "밴드 멤버 · 보컬",
  },
  {
    id: "notification-1",
    type: "info",
    title: "WAVY의 라이브가 지금 시작했어요!",
    time: "1시간 전",
  },
  {
    id: "notification-2",
    type: "info",
    title: "WAVY의 새로운 공연이 등록되었어요!",
    time: "7일 전",
  },
  {
    id: "notification-3",
    type: "info",
    title: "WAVY 단독 공연이 내일이에요!",
    time: "2026.6.8.",
  },
];

const NotificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasNotifications = searchParams.get("status") !== "empty";

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [part, setPart] = useState("");
  const canConfirmRole = activityName.trim().length > 0 && part.length > 0;

  return (
    <main className="min-h-dvh bg-secondary-0">
      <header className="flex h-[60px] items-center justify-between bg-neutral-0 px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1
          className="m-0"
          style={{
            color: "var(--Gray-Scale-900, #1D1A1A)",
            fontFamily: "Pretendard",
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "28px",
          }}
        >
          알림
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      {hasNotifications ? (
        <section className="flex flex-col gap-3 pl-[23px] pr-[22px] pt-6">
          {NOTIFICATIONS.map((notification) =>
            notification.type === "invite" ? (
              <article
                key={notification.id}
                className="flex w-full flex-col gap-4 self-stretch rounded-xl bg-neutral-0 px-4 py-6 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
              >
                <div className="mx-auto flex w-71.5 items-start gap-4">
                  <img
                    src={InviteAlertIcon}
                    alt=""
                    className="shrink-0 rounded-full object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <h2 className="font-body text-body1 text-neutral-900">
                      {notification.bandName}에서 멤버 초대를 보냈어요
                    </h2>
                    <p className="font-body text-caption2 text-neutral-600">
                      {notification.position} 포지션으로 함께 활동해 주세요
                    </p>
                    <p className="font-body text-caption3 text-neutral-400">
                      {notification.time}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-neutral-400" />

                <div className="mx-auto flex w-71.5 items-center gap-3">
                  <img
                    src={BandDefaultProfileImage}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-body text-body6 text-neutral-900">
                      {notification.bandName}
                    </p>
                    <p className="m-0 truncate font-body text-caption2 text-neutral-600">
                      {notification.bandTag}
                    </p>
                  </div>
                </div>

                <div className="mx-auto flex w-71.5 items-center gap-3 rounded-md border border-neutral-300 px-4 py-3">
                  <span className="font-body text-caption3 text-neutral-500">
                    역할
                  </span>
                  <span className="font-body text-body6 text-secondary-500">
                    {notification.role}
                  </span>
                </div>

                <div className="mx-auto flex gap-5 w-75">
                  <button
                    type="button"
                    className="flex h-7.5 w-35 flex-1 items-center justify-center rounded-md border border-secondary-500 bg-neutral-0 text-caption3 text-secondary-500"
                  >
                    거절
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(true)}
                    className="flex h-7.5 w-35 flex-1 items-center justify-center rounded-md bg-secondary-500 text-caption3 text-neutral-0"
                  >
                    수락
                  </button>
                </div>
              </article>
            ) : (
              <article
                key={notification.id}
                className="flex w-full flex-col items-start gap-2.5 self-stretch rounded-xl bg-neutral-0 px-4 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
              >
                <div className="flex items-center gap-4 self-stretch">
                  <span className="flex size-11.25 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-400">
                    <img
                      src={BandDefaultProfileImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>

                  <div className="min-w-0">
                    <h2 className="m-0 truncate font-body text-body1 text-neutral-900">
                      {notification.title}
                    </h2>
                    <p className="m-0 mt-1 font-body text-caption2 text-neutral-600">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </article>
            ),
          )}
        </section>
      ) : (
        <section className="flex h-[calc(100dvh-60px)] flex-col items-center pt-[274px] text-center">
          <h2 className="m-0 font-body text-label1 text-neutral-900">
            밴드 알림이 없어요
          </h2>
          <p className="m-0 mt-3 font-body text-caption1 text-neutral-600">
            팔로우한 밴드가 없거나,
            <br />
            밴드의 새로운 소식이 없어요
          </p>
        </section>
      )}

      <ModalOverlay
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        clipContent={false}
      >
        <div className="box-border flex w-88.5 max-w-full flex-col gap-6 rounded-2xl bg-neutral-0 px-4 py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="m-0 font-body text-label1 text-neutral-900">
              활동명과 파트를 입력해주세요
            </h3>
            <p className="m-0 font-body text-caption2 text-neutral-600">
              밴드 프로필에 표시될 정보를 입력해 주세요
              <br />
              밴드 프로필 관리에서 활동명과 파트를 수정할 수 있어요
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className="font-body text-body6 text-neutral-900">
                활동명
              </span>
              <Input
                value={activityName}
                onChange={(event) => setActivityName(event.target.value)}
                placeholder="활동명을 입력해주세요"
                className="w-full rounded-[5px] py-1.25 pl-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-body text-body6 text-neutral-900">
                파트
              </span>
              <Select
                value={part}
                onChange={setPart}
                options={PART_OPTIONS}
                placeholder="파트를 선택해주세요"
              />
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="flex h-9.5 flex-1 items-center justify-center rounded-md border border-secondary-500 bg-neutral-0 text-body1 text-secondary-500"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canConfirmRole}
              onClick={() => {
                setIsRoleModalOpen(false);
                setIsCompleteModalOpen(true);
              }}
              className="flex h-9.5 flex-1 items-center justify-center rounded-md bg-secondary-500 text-body1 text-neutral-0 disabled:opacity-60"
            >
              확인
            </button>
          </div>
        </div>
      </ModalOverlay>

      <ModalOverlay
        open={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
      >
        <div className="box-border flex w-88.5 max-w-full flex-col items-center gap-4 rounded-2xl bg-neutral-0 px-4 py-6 text-center">
          <img src={CheckIcon} alt="" />

          <div className="flex flex-col gap-2">
            <h3 className="m-0 font-body text-label1 text-neutral-900">
              초대가 완료되었습니다
            </h3>
            <p className="m-0 font-body text-caption2 text-neutral-600">
              이제 WAVY의 멤버로 활동할 수 있어요.
              <br />내 밴드와 밴드 프로필 관리에서 확인해 주세요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCompleteModalOpen(false)}
            className="flex w-78.25 h-9.5 items-center justify-center rounded-md bg-secondary-500 text-body1 text-neutral-0"
          >
            확인
          </button>
        </div>
      </ModalOverlay>
    </main>
  );
};

export default NotificationPage;
