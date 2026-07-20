import ArrowRightIcon from "@/assets/Arrow.svg";
import BandProfileImage from "@/assets/Img_Band.png";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import type { SessionRecruitmentPost } from "../types";

interface SessionRecruitmentDetailScreenProps {
  post: SessionRecruitmentPost;
  onBack: () => void;
  onToggleBookmark: (postId: number) => void;
}

const DETAIL_DESCRIPTION = [
  "안녕하세요. WAVY입니다.",
  "WAVY와 함께 장기적으로 활동할 드러머를 찾습니다.",
  "라이브와 앨범 작업을 함께할 열정적인 분을 기다리고 있어요!",
].join("\n");

export const SessionRecruitmentDetailScreen = ({
  post,
  onBack,
}: SessionRecruitmentDetailScreenProps) => {
  const [part = "드럼"] = post.tags;
  const shortLocation = post.location.split(" ")[0] ?? post.location;
  const infoRows = [
    { label: "모집 파트", value: part },
    { label: "장르", value: "락" },
    { label: "활동 지역", value: post.location },
    { label: "연습 일정", value: "주 1~2회 (평일 저녁/주말 협의)" },
    { label: "연습 장소", value: "합정역 인근 연습실" },
    { label: "지원 자격", value: "20~30대, 밴드 활동 경험 1년 이상" },
  ];

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+92px)]">
      <DetailTopBar onBack={onBack} />

      <section className="pt-[56px] pb-4">
        <div className="mx-auto flex w-[330px] flex-col items-start gap-1">
          <span className="inline-flex h-4 items-center justify-center rounded-[3px] bg-secondary-500 px-[5px] text-[8px] leading-[10px] font-semibold text-neutral-0">
            NEW
          </span>
          <h1 className="text-label1 text-neutral-900">{post.title}</h1>
          <div className="flex items-center gap-[10px] text-caption2 text-neutral-600">
            <span>2026.05.17. 18:00 마감</span>
            <span className="h-3.5 w-px bg-neutral-300" aria-hidden="true" />
            <span className="text-secondary-500">{post.deadline}</span>
          </div>
        </div>
      </section>
      <div className="h-0.5 w-[393px] max-w-full bg-neutral-300" aria-hidden="true" />

      <section className="mx-auto flex w-[330px] flex-col gap-3 pt-5">
        <button
          type="button"
          className="flex h-[60px] w-full items-center rounded-[8px] bg-neutral-0 py-3 pr-[15px] pl-3 text-left shadow-[0_0_8px_rgba(0,0,0,0.08)]"
        >
          <img
            src={BandProfileImage}
            alt=""
            className="size-9 shrink-0 rounded-full object-cover"
          />
          <div className="ml-5 min-w-0 flex-1">
            <strong className="block truncate text-body1 text-neutral-900">{post.bandName}</strong>
            <span className="mt-0.5 block truncate text-caption2 text-neutral-600">
              {post.genre} · {shortLocation}
            </span>
          </div>
          <img src={ArrowRightIcon} alt="" className="size-6 shrink-0" />
        </button>

        <article className="rounded-[8px] bg-neutral-0 px-3 py-3 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
          <h2 className="text-body1 text-neutral-900">상세 내용</h2>
          <p className="mt-3 whitespace-pre-line text-caption2 text-neutral-800">
            {DETAIL_DESCRIPTION}
          </p>
        </article>

        <article className="rounded-[8px] bg-neutral-0 px-3 py-3 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
          <dl className="grid grid-cols-[128px_minmax(0,1fr)] gap-y-[14px]">
            {infoRows.map((row) => (
              <DetailInfoRow key={row.label} label={row.label} value={row.value} />
            ))}
          </dl>
        </article>
      </section>

      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-20 bg-neutral-0 px-5 py-5">
        <button
          type="button"
          className="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-secondary-500 text-label2 text-neutral-0"
        >
          지원 하기
        </button>
      </div>
    </main>
  );
};

interface DetailTopBarProps {
  onBack: () => void;
}

const DetailTopBar = ({ onBack }: DetailTopBarProps) => {
  return (
    <header className="relative flex h-12 w-full items-center justify-center bg-neutral-0 px-[15px] py-[5px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute left-[15px] top-[5px] flex size-[38px] items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>
      <h1 className="text-body1 text-neutral-900">모집 공고</h1>
    </header>
  );
};

interface DetailInfoRowProps {
  label: string;
  value: string;
}

const DetailInfoRow = ({ label, value }: DetailInfoRowProps) => {
  return (
    <>
      <dt className="text-body1 text-neutral-900">{label}</dt>
      <dd className="min-w-0 text-caption2 font-medium text-neutral-900">{value}</dd>
    </>
  );
};
