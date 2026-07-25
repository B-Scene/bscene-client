import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import { useSessionApplicationDetailQuery } from "@/hooks/api/session/useSessionApplication";

interface SessionApplicationDetailScreenProps {
  sessionApplicationId: number;
  onBack: () => void;
}

export const SessionApplicationDetailScreen = ({
  sessionApplicationId,
  onBack,
}: SessionApplicationDetailScreenProps) => {
  const detailQuery = useSessionApplicationDetailQuery(sessionApplicationId);
  const detail = detailQuery.data;

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="relative flex h-12 w-full items-center justify-center bg-neutral-0 px-[15px] py-[5px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="absolute top-[5px] left-[15px] flex size-[38px] items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
        <h1 className="text-body1 text-neutral-900">세션 지원서</h1>
      </header>

      {detailQuery.isLoading ? (
        <section className="flex min-h-[360px] items-center justify-center text-caption1 text-neutral-500">
          지원서 정보를 불러오고 있어요
        </section>
      ) : detailQuery.isError ? (
        <section className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
          <p className="text-caption1 text-neutral-500">
            지원서 정보를 불러오지 못했어요
          </p>
          <button
            type="button"
            onClick={() => detailQuery.refetch()}
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      ) : detail ? (
        <section className="flex flex-col gap-4 px-6 pt-5">
          <article className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <div className="flex gap-4">
              <img
                src={detail.profileImageUrl || UserDefaultProfileIcon}
                alt=""
                className="size-[58px] shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-label1 text-neutral-900">
                    {detail.nickname}
                  </strong>
                  <span className="inline-flex h-[22px] min-w-[48px] items-center justify-center rounded-full bg-secondary-0 px-3 text-caption3 font-semibold text-secondary-500">
                    {detail.skillLevel}
                  </span>
                </div>
                <p className="mt-1 text-caption2 text-neutral-600">
                  {detail.part} · {detail.genre} · {detail.region}
                </p>
                <p className="mt-3 text-caption2 text-neutral-800">
                  {detail.oneLineIntro}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <h2 className="text-label1 text-neutral-900">{detail.title}</h2>
            <p className="mt-3 whitespace-pre-line text-caption2 text-neutral-800">
              {detail.intro || "자기소개가 없습니다."}
            </p>
          </article>

          <article className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <h2 className="text-label1 text-neutral-900">가능 활동</h2>
            {detail.availableActivities.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {detail.availableActivities.map((activity) => (
                  <span
                    key={activity}
                    className="rounded-full bg-secondary-0 px-3 py-1 text-caption3 font-semibold text-secondary-500"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-caption2 text-neutral-600">
                등록된 가능 활동이 없어요
              </p>
            )}
          </article>

          <article className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <h2 className="text-label1 text-neutral-900">경력</h2>
            {detail.careers.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3">
                {detail.careers.map((career) => (
                  <div key={career.sessionApplicationCareerId}>
                    <h3 className="text-body1 font-semibold text-neutral-900">
                      {career.name}
                    </h3>
                    <p className="mt-1 text-caption3 text-neutral-500">
                      {career.period}
                    </p>
                    <p className="mt-1 text-caption2 text-neutral-800">
                      {career.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-caption2 text-neutral-600">
                등록된 경력이 없어요
              </p>
            )}
          </article>

          <article className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <h2 className="text-label1 text-neutral-900">포트폴리오</h2>
            {detail.portfolioLinks.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3">
                {detail.portfolioLinks.map((link) => (
                  <a
                    key={link.sessionApplicationLinkId}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-[8px] border border-neutral-300 px-3 py-2"
                  >
                    <p className="text-body1 font-semibold text-neutral-900">
                      {link.title}
                    </p>
                    <p className="mt-1 truncate text-caption3 text-neutral-500">
                      {link.url}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-caption2 text-neutral-600">
                등록된 포트폴리오가 없어요
              </p>
            )}
          </article>
        </section>
      ) : null}
    </main>
  );
};