import { useState, type ReactNode } from "react";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import SearchIcon from "@/assets/icons/band/search.svg";
import BandProfileIcon from "@/assets/icons/band/band-default-profile.svg";
import UserProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import CompleteIcon from "@/assets/icons/band/check-circle-yellow.svg";
import ImgBand from "@/assets/Img_Band.png";

type SessionScreen = "list" | "detail" | "create" | "complete" | "empty" | "inbox";
type SessionTab = "notice" | "profile";

interface SessionPost {
  id: number;
  title: string;
  bandName: string;
  meta: string;
  deadline: string;
}

const sessionPosts: SessionPost[] = [
  {
    id: 1,
    title: "드럼 세션 구합니다",
    bandName: "WAVY",
    meta: "드럼 · 인디 · 서울",
    deadline: "D-18",
  },
  {
    id: 2,
    title: "기타 세션 모집해요",
    bandName: "밴드명",
    meta: "기타 · 락 · 서울",
    deadline: "D-12",
  },
  {
    id: 3,
    title: "키보드 세션 찾습니다",
    bandName: "밴드명",
    meta: "키보드 · 팝 · 경기",
    deadline: "D-08",
  },
];

const parts = ["전체", "보컬", "기타", "베이스", "키보드", "드럼"];
const genres = ["전체", "락", "인디", "팝", "재즈", "R&B", "힙합", "클래식", "기타"];
const regions = ["전체", "서울", "경기", "인천", "기타"];
const skillLevels = ["상관없음", "입문", "취미", "공연 가능", "프로"];

const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");

const BandSessionPage = () => {
  const [screen, setScreen] = useState<SessionScreen>("list");
  const [activeTab, setActiveTab] = useState<SessionTab>("notice");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState("전체");
  const [selectedGenre, setSelectedGenre] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const goList = () => {
    setScreen("list");
    setIsApplyModalOpen(false);
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+28px)]">
      {screen === "list" ? (
        <SessionListScreen
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          isFilterOpen={isFilterOpen}
          onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
          selectedPart={selectedPart}
          selectedGenre={selectedGenre}
          selectedRegion={selectedRegion}
          onSelectPart={setSelectedPart}
          onSelectGenre={setSelectedGenre}
          onSelectRegion={setSelectedRegion}
          onOpenDetail={() => setScreen("detail")}
          onOpenCreate={() => setScreen("create")}
          onOpenInbox={() => setScreen("inbox")}
          onOpenEmpty={() => setScreen("empty")}
        />
      ) : null}

      {screen === "detail" ? (
        <SessionDetailScreen
          onBack={goList}
          onApply={() => setIsApplyModalOpen(true)}
        />
      ) : null}

      {screen === "create" ? (
        <SessionCreateScreen
          onBack={goList}
          onComplete={() => setScreen("complete")}
        />
      ) : null}

      {screen === "complete" ? (
        <SessionCompleteScreen
          onGoList={goList}
          onOpenDetail={() => setScreen("detail")}
        />
      ) : null}

      {screen === "empty" ? (
        <SessionEmptyScreen
          onBack={goList}
          onOpenCreate={() => setScreen("create")}
        />
      ) : null}

      {screen === "inbox" ? <SessionInboxScreen onBack={goList} /> : null}

      {isApplyModalOpen ? (
        <ApplyModal
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={() => setIsApplyModalOpen(false)}
        />
      ) : null}
    </main>
  );
};

interface TopBarProps {
  title: string;
  align?: "left" | "center";
  onBack?: () => void;
  right?: ReactNode;
}

const TopBar = ({ title, align = "center", onBack, right }: TopBarProps) => (
  <header
    className={cx(
      "relative flex h-16 items-center bg-neutral-0 px-5",
      align === "center" ? "justify-center" : "justify-start",
    )}
  >
    {onBack ? (
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute left-4 flex size-9 items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>
    ) : null}

    <h1
      className={cx(
        align === "center" ? "text-h4" : "text-[28px] leading-[38px] font-bold",
        "text-neutral-900",
      )}
    >
      {title}
    </h1>

    {right ? <div className="absolute right-5">{right}</div> : null}
  </header>
);

interface SessionListScreenProps {
  activeTab: SessionTab;
  onChangeTab: (tab: SessionTab) => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  selectedPart: string;
  selectedGenre: string;
  selectedRegion: string;
  onSelectPart: (value: string) => void;
  onSelectGenre: (value: string) => void;
  onSelectRegion: (value: string) => void;
  onOpenDetail: () => void;
  onOpenCreate: () => void;
  onOpenInbox: () => void;
  onOpenEmpty: () => void;
}

const SessionListScreen = ({
  activeTab,
  onChangeTab,
  isFilterOpen,
  onToggleFilter,
  selectedPart,
  selectedGenre,
  selectedRegion,
  onSelectPart,
  onSelectGenre,
  onSelectRegion,
  onOpenDetail,
  onOpenCreate,
  onOpenInbox,
  onOpenEmpty,
}: SessionListScreenProps) => (
  <>
    <TopBar
      title="세션"
      align="left"
      right={
        <button
          type="button"
          aria-label="쪽지함"
          onClick={onOpenInbox}
          className="flex size-9 items-center justify-center"
        >
          <EnvelopeIcon />
        </button>
      }
    />

    <section className="px-5 pt-3">
      <div className="grid grid-cols-2 border-b border-neutral-300">
        <TabButton active={activeTab === "notice"} onClick={() => onChangeTab("notice")}>
          모집 공고
        </TabButton>
        <TabButton active={activeTab === "profile"} onClick={() => onChangeTab("profile")}>
          세션 프로필
        </TabButton>
      </div>

      <div className="mt-5 flex h-11 items-center gap-2 rounded-xl bg-neutral-200 px-4">
        <img src={SearchIcon} alt="" className="size-4" />
        <input
          type="search"
          placeholder="파트, 장르, 지역 검색"
          className="w-full bg-transparent text-caption1 text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </div>

      {activeTab === "notice" ? (
        <>
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={onToggleFilter}
            selectedPart={selectedPart}
            selectedGenre={selectedGenre}
            selectedRegion={selectedRegion}
            onSelectPart={onSelectPart}
            onSelectGenre={onSelectGenre}
            onSelectRegion={onSelectRegion}
          />

          <div className="mt-4 flex flex-col gap-3">
            {sessionPosts.map((post) => (
              <SessionPostCard key={post.id} post={post} onClick={onOpenDetail} />
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenEmpty}
            className="mt-5 w-full rounded-xl border border-secondary-500 py-3 text-caption3 text-secondary-500"
          >
            빈 상태 미리보기
          </button>
        </>
      ) : (
        <SessionProfileTab onOpenCreate={onOpenCreate} />
      )}
    </section>

    <button
      type="button"
      aria-label="세션 모집 공고 등록"
      onClick={onOpenCreate}
      className="fixed right-[calc(50%-176px)] bottom-[calc(var(--bottom-nav-height)+20px)] flex size-14 items-center justify-center rounded-full bg-secondary-500 text-neutral-0 shadow-[0_8px_20px_rgba(251,177,14,0.35)] max-[767px]:right-5"
    >
      <PlusIcon />
    </button>
  </>
);

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

const TabButton = ({ active, onClick, children }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      "relative h-11 text-body1",
      active ? "text-secondary-500" : "text-neutral-500",
    )}
  >
    {children}
    {active ? (
      <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-secondary-500" />
    ) : null}
  </button>
);

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedPart: string;
  selectedGenre: string;
  selectedRegion: string;
  onSelectPart: (value: string) => void;
  onSelectGenre: (value: string) => void;
  onSelectRegion: (value: string) => void;
}

const FilterPanel = ({
  isOpen,
  onToggle,
  selectedPart,
  selectedGenre,
  selectedRegion,
  onSelectPart,
  onSelectGenre,
  onSelectRegion,
}: FilterPanelProps) => (
  <section className="mt-4 rounded-2xl bg-neutral-0 px-4 py-3 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-1.5 text-caption2 text-neutral-700">
        <span>{selectedPart}</span>
        <span className="text-neutral-400">·</span>
        <span>{selectedGenre}</span>
        <span className="text-neutral-400">·</span>
        <span>{selectedRegion}</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 text-caption3 text-secondary-500"
      >
        {isOpen ? "접기" : "필터 변경"}
        <ChevronIcon direction={isOpen ? "up" : "down"} />
      </button>
    </div>

    {isOpen ? (
      <div className="mt-4 flex flex-col gap-4">
        <ChipGroup title="파트" options={parts} value={selectedPart} onChange={onSelectPart} />
        <ChipGroup title="장르" options={genres} value={selectedGenre} onChange={onSelectGenre} />
        <ChipGroup title="지역" options={regions} value={selectedRegion} onChange={onSelectRegion} />
      </div>
    ) : null}
  </section>
);

interface ChipGroupProps {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const ChipGroup = ({ title, options, value, onChange }: ChipGroupProps) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-caption3 text-neutral-900">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cx(
            "h-8 rounded-full border px-3 text-caption2",
            option === value
              ? "border-secondary-500 bg-secondary-100 text-secondary-600"
              : "border-neutral-300 bg-neutral-0 text-neutral-700",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

interface SessionPostCardProps {
  post: SessionPost;
  onClick: () => void;
}

const SessionPostCard = ({ post, onClick }: SessionPostCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="relative flex min-h-24 w-full items-center gap-3 rounded-2xl bg-neutral-0 px-4 py-3 text-left shadow-[0_0_12px_rgba(0,0,0,0.08)]"
  >
    <img src={ImgBand} alt="" className="size-16 shrink-0 rounded-full object-cover" />
    <div className="min-w-0 flex-1 pr-12">
      <h2 className="truncate text-body1 text-neutral-900">{post.title}</h2>
      <p className="mt-1 truncate text-caption2 text-neutral-700">{post.bandName}</p>
      <p className="mt-1 truncate text-caption2 text-secondary-500">{post.meta}</p>
    </div>
    <span className="absolute right-4 bottom-3 flex h-6 w-13 items-center justify-center rounded-full border border-secondary-500 text-caption3 text-secondary-500">
      {post.deadline}
    </span>
  </button>
);

interface SessionProfileTabProps {
  onOpenCreate: () => void;
}

const SessionProfileTab = ({ onOpenCreate }: SessionProfileTabProps) => (
  <section className="mt-4 flex flex-col gap-3">
    <div className="rounded-2xl bg-neutral-0 px-4 py-5 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3">
        <img src={UserProfileIcon} alt="" className="size-16" />
        <div>
          <h2 className="text-body1 text-neutral-900">내 세션 프로필</h2>
          <p className="mt-1 text-caption2 text-neutral-600">드럼 · 인디 · 서울</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenCreate}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-secondary-500 text-body1 text-neutral-0"
      >
        모집 공고 등록하기
      </button>
    </div>
  </section>
);

interface SessionDetailScreenProps {
  onBack: () => void;
  onApply: () => void;
}

const SessionDetailScreen = ({ onBack, onApply }: SessionDetailScreenProps) => (
  <>
    <TopBar title="모집 공고" onBack={onBack} />
    <section className="px-5 pt-4 pb-24">
      <span className="inline-flex h-7 items-center rounded-full bg-secondary-100 px-3 text-caption3 text-secondary-600">
        모집중
      </span>
      <h1 className="mt-3 text-[24px] leading-[32px] font-bold text-neutral-900">
        드럼 세션 구합니다
      </h1>
      <p className="mt-2 text-caption2 text-neutral-600">
        2026.05.17. 18:00 마감 · D-18
      </p>

      <button
        type="button"
        className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-neutral-0 px-4 py-4 text-left shadow-[0_0_12px_rgba(0,0,0,0.08)]"
      >
        <img src={ImgBand} alt="" className="size-14 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-body1 text-neutral-900">WAVY</p>
          <p className="mt-1 text-caption2 text-neutral-600">인디 락 · 서울</p>
        </div>
        <ChevronIcon direction="right" />
      </button>

      <DetailSection title="상세 내용">
        <p className="text-caption1 text-neutral-700">
          안녕하세요, WAVY입니다. 6월부터 함께 합주와 공연을 준비할 드럼 세션을
          찾고 있어요. 밴드 사운드에 대한 이해가 있고 꾸준히 연습에 참여하실 수
          있는 분이면 좋아요.
        </p>
      </DetailSection>

      <section className="mt-6 rounded-2xl bg-neutral-0 px-4 py-4 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
        <InfoRow label="모집 파트" value="드럼" />
        <InfoRow label="장르" value="락" />
        <InfoRow label="활동 지역" value="서울 마포구" />
        <InfoRow label="활동 범위" value="주 1-2회 (합주/지역공연 포함)" />
        <InfoRow label="연습 장소" value="합정 인근 연습실" />
        <InfoRow label="모집 마감" value="2026.05.24. (금) 18:00" last />
      </section>

      <DetailSection title="지원 자격">
        <ul className="flex flex-col gap-2 text-caption1 text-neutral-700">
          <li>20-30대 남성</li>
          <li>밴드 활동 경험 1년 이상</li>
          <li>라이브 공연 가능</li>
        </ul>
      </DetailSection>
    </section>

    <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] px-5">
      <button
        type="button"
        onClick={onApply}
        className="flex h-13 w-full items-center justify-center rounded-xl bg-secondary-500 text-label1 text-neutral-0"
      >
        지원하기
      </button>
    </div>
  </>
);

interface DetailSectionProps {
  title: string;
  children: ReactNode;
}

const DetailSection = ({ title, children }: DetailSectionProps) => (
  <section className="mt-6">
    <h2 className="mb-3 text-body1 text-neutral-900">{title}</h2>
    {children}
  </section>
);

interface InfoRowProps {
  label: string;
  value: string;
  last?: boolean;
}

const InfoRow = ({ label, value, last }: InfoRowProps) => (
  <div
    className={cx(
      "flex items-center justify-between gap-4 py-3",
      !last && "border-b border-neutral-300",
    )}
  >
    <span className="shrink-0 text-caption2 text-neutral-600">{label}</span>
    <span className="text-right text-caption3 text-neutral-900">{value}</span>
  </div>
);

interface SessionCreateScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

const SessionCreateScreen = ({ onBack, onComplete }: SessionCreateScreenProps) => {
  const [selectedPart, setSelectedPart] = useState("드럼");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("공연 가능");
  const [selectedGenre, setSelectedGenre] = useState("락");
  const [selectedRegion, setSelectedRegion] = useState("서울");

  return (
    <>
      <TopBar title="세션 모집 공고 등록" onBack={onBack} />
      <section className="flex flex-col gap-3 bg-secondary-0 px-5 pt-4 pb-24">
        <FormCard title="모집 소개">
          <FormField label="공고 제목" required>
            <input
              defaultValue="드럼 세션 구합니다"
              className="h-10 w-full rounded-[5px] border border-neutral-300 px-3 text-caption2 text-neutral-900 outline-none focus:border-secondary-500"
              placeholder="공고 제목을 입력해주세요"
            />
          </FormField>
          <FormField label="모집 소개">
            <textarea
              defaultValue="함께 공연을 준비할 드럼 세션을 찾고 있어요."
              className="h-20 w-full resize-none rounded-[5px] border border-neutral-300 px-3 py-2 text-caption2 text-neutral-900 outline-none focus:border-secondary-500"
              placeholder="모집 내용을 작성해주세요"
            />
          </FormField>
        </FormCard>

        <FormCard title="모집 파트">
          <ChipGroup options={parts.slice(1)} title="파트" value={selectedPart} onChange={setSelectedPart} />
        </FormCard>

        <FormCard title="실력대">
          <ChipGroup
            options={skillLevels}
            title="실력"
            value={selectedSkillLevel}
            onChange={setSelectedSkillLevel}
          />
        </FormCard>

        <FormCard title="장르">
          <ChipGroup options={genres.slice(1)} title="장르" value={selectedGenre} onChange={setSelectedGenre} />
        </FormCard>

        <FormCard title="활동 지역">
          <ChipGroup options={regions.slice(1)} title="지역" value={selectedRegion} onChange={setSelectedRegion} />
        </FormCard>

        <FormCard title="연습 일정">
          <SelectLike label="활동 범위" value="주 1-2회" />
          <SelectLike label="연습 시간" value="평일 저녁" />
        </FormCard>

        <FormCard title="연습 장소">
          <input
            defaultValue="합정 인근 연습실"
            className="h-10 w-full rounded-[5px] border border-neutral-300 px-3 text-caption2 text-neutral-900 outline-none focus:border-secondary-500"
            placeholder="연습 장소를 입력해주세요"
          />
        </FormCard>

        <FormCard title="모집 마감일">
          <SelectLike label="날짜 선택" value="2026.05.24. (금)" />
          <SelectLike label="마감 시간" value="18:00" />
        </FormCard>

        <FormCard title="지원 자격">
          <textarea
            defaultValue={"20-30대 남성\n밴드 활동 경험 1년 이상\n라이브 공연 가능"}
            className="h-24 w-full resize-none rounded-[5px] border border-neutral-300 px-3 py-2 text-caption2 text-neutral-900 outline-none focus:border-secondary-500"
            placeholder="지원 자격을 작성해주세요"
          />
        </FormCard>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] px-5">
        <button
          type="button"
          onClick={onComplete}
          className="flex h-13 w-full items-center justify-center rounded-xl bg-secondary-500 text-label1 text-neutral-0"
        >
          모집 공고 등록
        </button>
      </div>
    </>
  );
};

interface FormCardProps {
  title: string;
  children: ReactNode;
}

const FormCard = ({ title, children }: FormCardProps) => (
  <section className="flex flex-col gap-3 rounded-2xl bg-neutral-0 px-4 py-4 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
    <h2 className="text-body1 text-neutral-900">{title}</h2>
    {children}
  </section>
);

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

const FormField = ({ label, required, children }: FormFieldProps) => (
  <label className="flex flex-col gap-2">
    <span className="text-caption3 text-neutral-900">
      {label}
      {required ? <span className="ml-1 text-error">*</span> : null}
    </span>
    {children}
  </label>
);

interface SelectLikeProps {
  label: string;
  value: string;
}

const SelectLike = ({ label, value }: SelectLikeProps) => (
  <button
    type="button"
    className="flex h-12 w-full items-center justify-between rounded-[5px] border border-neutral-300 px-3 text-left"
  >
    <span>
      <span className="block text-caption2 text-neutral-600">{label}</span>
      <span className="block text-caption1 text-neutral-900">{value}</span>
    </span>
    <ChevronIcon direction="down" />
  </button>
);

interface SessionCompleteScreenProps {
  onGoList: () => void;
  onOpenDetail: () => void;
}

const SessionCompleteScreen = ({ onGoList, onOpenDetail }: SessionCompleteScreenProps) => (
  <section className="flex min-h-[calc(100dvh-var(--bottom-nav-height))] flex-col items-center px-5 pt-28 text-center">
    <img src={CompleteIcon} alt="" className="size-24" />
    <h1 className="mt-10 text-[28px] leading-[38px] font-bold text-neutral-900">
      세션 모집 공고가 등록됐어요
    </h1>
    <p className="mt-3 whitespace-pre-line text-caption1 text-neutral-700">
      조건에 맞는 세션 유저분들이{"\n"}공고를 볼 수 있어요
    </p>

    <div className="mt-10 w-full rounded-2xl bg-neutral-0 px-4 py-4 text-left shadow-[0_0_12px_rgba(0,0,0,0.08)]">
      <InfoRow label="모집 파트" value="드럼" />
      <InfoRow label="장르" value="락" />
      <InfoRow label="활동 지역" value="서울 마포구" last />
    </div>

    <div className="mt-8 grid w-full grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onGoList}
        className="flex h-13 items-center justify-center rounded-xl border border-secondary-500 text-body1 text-secondary-500"
      >
        세션 탭으로
      </button>
      <button
        type="button"
        onClick={onOpenDetail}
        className="flex h-13 items-center justify-center rounded-xl bg-secondary-500 text-body1 text-neutral-0"
      >
        공고 확인하기
      </button>
    </div>
  </section>
);

interface SessionEmptyScreenProps {
  onBack: () => void;
  onOpenCreate: () => void;
}

const SessionEmptyScreen = ({ onBack, onOpenCreate }: SessionEmptyScreenProps) => (
  <>
    <TopBar title="세션" align="left" onBack={onBack} />
    <section className="flex min-h-[calc(100dvh-var(--bottom-nav-height)-64px)] flex-col items-center justify-center px-5 pb-20 text-center">
      <EmptyIllustration />
      <h1 className="mt-7 text-h4 text-neutral-900">조건에 맞는 공고가 없어요</h1>
      <p className="mt-2 whitespace-pre-line text-caption1 text-neutral-600">
        필터를 바꾸거나 직접 세션 공고를{"\n"}등록해보세요
      </p>
      <button
        type="button"
        onClick={onOpenCreate}
        className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-secondary-500 text-body1 text-neutral-0"
      >
        공고 등록하기
      </button>
    </section>
  </>
);

interface SessionInboxScreenProps {
  onBack: () => void;
}

const SessionInboxScreen = ({ onBack }: SessionInboxScreenProps) => (
  <>
    <TopBar title="쪽지함" onBack={onBack} />
    <section className="px-5 pt-4">
      {["최진우", "한아영", "유재호"].map((name, index) => (
        <button
          key={name}
          type="button"
          className="flex w-full items-center gap-3 border-b border-neutral-200 py-4 text-left"
        >
          <img src={index === 0 ? ImgBand : UserProfileIcon} alt="" className="size-12 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-body1 text-neutral-900">{name}</p>
            <p className="mt-1 truncate text-caption2 text-neutral-600">
              세션 모집 공고 보고 연락드려요.
            </p>
          </div>
          <span className="text-caption2 text-neutral-500">20:3{index}</span>
        </button>
      ))}
    </section>
  </>
);

interface ApplyModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const ApplyModal = ({ onClose, onSubmit }: ApplyModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/55 px-8">
    <section className="w-full rounded-[24px] bg-neutral-0 px-6 py-7">
      <h2 className="text-center text-h4 text-neutral-900">지원 메시지 작성</h2>
      <p className="mt-2 whitespace-pre-line text-center text-caption1 text-neutral-600">
        밴드에게 보낼 간단한 소개와{"\n"}지원 메시지를 작성해주세요
      </p>
      <textarea
        className="mt-5 h-32 w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-caption1 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-secondary-500"
        placeholder="메시지를 입력해주세요"
      />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 items-center justify-center rounded-xl border border-secondary-500 text-body1 text-secondary-500"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex h-12 items-center justify-center rounded-xl bg-secondary-500 text-body1 text-neutral-0"
        >
          쪽지 보내기
        </button>
      </div>
    </section>
  </div>
);

const EnvelopeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7.5C4 6.12 5.12 5 6.5 5h11C18.88 5 20 6.12 20 7.5v9c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 19 4 17.88 4 16.5v-9Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="m5 7 7 5.5L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M14 6v16M6 14h16" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

interface ChevronIconProps {
  direction: "up" | "down" | "right";
}

const ChevronIcon = ({ direction }: ChevronIconProps) => {
  const rotate = direction === "up" ? "rotate-180" : direction === "right" ? "-rotate-90" : "";

  return (
    <svg
      className={cx("size-4 text-neutral-500", rotate)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const EmptyIllustration = () => (
  <div className="flex size-24 items-center justify-center rounded-full bg-secondary-100">
    <img src={BandProfileIcon} alt="" className="size-14 opacity-70" />
  </div>
);

export default BandSessionPage;
