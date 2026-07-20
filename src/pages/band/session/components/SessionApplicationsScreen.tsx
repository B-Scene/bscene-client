import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";

interface SessionApplicationsScreenProps {
  onEditBasicInfo: () => void;
}

interface AppliedPost {
  id: number;
  title: string;
  bandName: string;
  genre: string;
  location: string;
  status: string;
  date: string;
}

const appliedPosts: AppliedPost[] = [];

export const SessionApplicationsScreen = ({
  onEditBasicInfo,
}: SessionApplicationsScreenProps) => {
  const hasAppliedPosts = appliedPosts.length > 0;

  return (
    <section className="flex flex-col gap-5 bg-neutral-0 px-6 pt-5">
      <article className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <h2 className="text-label1 text-neutral-900">기본 지원서</h2>
          <button
            type="button"
            onClick={onEditBasicInfo}
            className="flex h-[30px] items-center justify-center rounded-[8px] bg-secondary-0 px-3 text-caption3 font-semibold text-secondary-500"
          >
            기본정보 수정
          </button>
        </div>

        <div className="mt-4 flex gap-4">
          <img
            src={UserDefaultProfileIcon}
            alt=""
            className="size-[58px] shrink-0 rounded-full"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <strong className="text-label1 text-neutral-900">정하람</strong>
              <span className="inline-flex h-[22px] min-w-[48px] items-center justify-center rounded-full bg-secondary-0 px-3 text-caption3 font-semibold text-secondary-500">
                중급
              </span>
            </div>
            <p className="mt-1 text-caption2 text-neutral-600">
              드럼 · 인디팝 · 서울 마포구
            </p>
            <p className="mt-3 text-caption2 text-neutral-800">
              라이브와 앨범 작업을 함께할 밴드를 찾고 있어요.
            </p>
          </div>
        </div>
      </article>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-label1 text-neutral-900">내 지원 현황</h2>
          <span className="text-caption2 text-neutral-500">{appliedPosts.length}건</span>
        </div>

        {hasAppliedPosts ? (
          <div className="mt-3 flex flex-col gap-3">
            {appliedPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-label1 text-neutral-900">{post.title}</h3>
                    <p className="mt-1 text-caption3 text-neutral-600">
                      {post.bandName} · {post.genre} · {post.location}
                    </p>
                  </div>
                  <span className="inline-flex h-[24px] shrink-0 items-center justify-center rounded-full bg-secondary-0 px-3 text-caption3 font-semibold text-secondary-500">
                    {post.status}
                  </span>
                </div>

                <p className="mt-4 text-caption2 text-neutral-600">{post.date}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex min-h-[228px] flex-col items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <p className="text-label1 text-neutral-900">아직 지원한 공고가 없어요</p>
            <p className="mt-2 text-caption2 text-neutral-600">
              마음에 드는 세션 모집 공고에 지원하면
              <br />
              내 지원서에서 확인할 수 있어요
            </p>
          </div>
        )}
      </section>
    </section>
  );
};
