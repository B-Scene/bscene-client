import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import BandDefaultProfileImage from "@/assets/icons/band/band-default-profile.svg";

const NOTIFICATIONS = [
  {
    id: "notification-1",
    title: "WAVY의 라이브가 지금 시작했어요!",
    time: "1시간 전",
  },
  {
    id: "notification-2",
    title: "WAVY의 새로운 공연이 등록되었어요!",
    time: "7일 전",
  },
  {
    id: "notification-3",
    title: "WAVY 단독 공연이 내일이에요!",
    time: "2026.6.8.",
  },
];

const NotificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasNotifications = searchParams.get("status") !== "empty";

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
          {NOTIFICATIONS.map((notification) => (
            <article
              key={notification.id}
              className="flex w-full flex-col items-start gap-2.5 self-stretch rounded-[12px] bg-neutral-0 px-4 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
            >
              <div className="flex items-center gap-4 self-stretch">
                <span className="flex size-[45px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-400">
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
          ))}
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
    </main>
  );
};

export default NotificationPage;
