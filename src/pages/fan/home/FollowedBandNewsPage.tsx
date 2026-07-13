import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import { FollowedNewsCard } from "@/components/fan/home/FollowedNewsCard";

const FEED_ITEMS = [
  { id: "feed-1", variant: "gallery" as const },
  { id: "feed-2", variant: "video" as const },
  { id: "feed-3", variant: "image" as const, tags: [] },
  { id: "feed-4", variant: "text" as const },
];

const FollowedBandNewsPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="-mx-5 flex h-[60px] items-center justify-between px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">
          팔로우한 밴드 소식
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <section className="mt-6 flex flex-col gap-3">
        {FEED_ITEMS.map((item) => (
          <FollowedNewsCard
            key={item.id}
            variant={item.variant}
            tags={item.tags}
          />
        ))}
      </section>
    </main>
  );
};

export default FollowedBandNewsPage;
