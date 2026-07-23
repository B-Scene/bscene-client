import { Header } from "@/components/band/home/Header";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import { useBandProfileStore } from "@/stores/useBandProfileStore";

interface Posting {
  id: string;
  dDay: string;
  title: string;
  tags: string;
  time: string;
  description: string;
}

const POSTINGS: Posting[] = [
  {
    id: "1",
    dDay: "D-18",
    title: "드럼 세션 구합니다",
    tags: "인디 · 서울",
    time: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
  },
  {
    id: "2",
    dDay: "D-18",
    title: "드럼 세션 구합니다",
    tags: "인디 · 서울",
    time: "2일 전",
    description:
      "장기적으로 함께 활동할 드러머를 찾습니다. 라이브와 앨범 작업 경험자 우대",
  },
];

const PostingManagementPage = () => {
  const profile = useBandProfileStore((state) => state.profile);
  const bandName = profile.name.trim() || "WAVY";

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="모집 공고 관리" />

      <div className="px-6 pt-4">
        <NotificationBandBanner
          bandName={bandName}
          description="현재 선택된 밴드의 모집 공고"
        />

        <div className="mt-6 flex flex-col gap-3">
          {POSTINGS.map((posting) => (
            <div
              key={posting.id}
              className="flex flex-col gap-2.5 rounded-lg bg-neutral-0 py-3 px-6 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
            >
              <div className="flex flex-col gap-3">
                <span className="self-start rounded-full px-3 py-0.5 bg-secondary-500 text-center text-caption3 text-white">
                  {posting.dDay}
                </span>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-label1 text-neutral-900">
                      {posting.title}
                    </h3>
                    <p className="text-caption3 text-neutral-600">
                      {bandName} · {posting.tags}
                      <span className="mx-1.5 text-neutral-300">|</span>
                      <span className="text-caption2 text-secondary-500">
                        {posting.time}
                      </span>
                    </p>
                  </div>
                  <p className="text-caption2 text-neutral-800">
                    {posting.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <button
                  type="button"
                  className="flex h-7.5 flex-1 items-center justify-center rounded-md bg-secondary-0 text-caption3 text-neutral-600"
                >
                  수정
                </button>
                <button
                  type="button"
                  className="flex h-7.5 flex-1 items-center justify-center rounded-md bg-neutral-300 text-caption3 text-neutral-600"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PostingManagementPage;
