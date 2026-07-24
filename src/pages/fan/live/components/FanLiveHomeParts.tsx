import { useState } from "react";
import MoreArrowIcon from "@/assets/icons/Icon Frame.svg";
import PlayIcon from "@/assets/icons/band/play-button.svg";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import SearchIcon from "@/assets/icons/band/search.svg";
import CloseIcon from "@/assets/icons/close.svg";

export type FanLiveFilter = "followed" | "all";

export function FanLiveListHeader({
  title,
  onBack,
  searchValue = "",
  onSearchChange,
}: {
  title: string;
  onBack: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = () => {
    if (searchOpen) onSearchChange?.("");
    setSearchOpen((current) => !current);
  };

  return (
    <header className="relative flex h-12 items-center justify-center bg-neutral-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="absolute left-[15px] flex size-6 items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>
      {searchOpen ? (
        <input
          autoFocus
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder={`${title} 검색`}
          aria-label={`${title} 검색어`}
          className="mx-14 h-9 min-w-0 flex-1 rounded-full border border-neutral-300 bg-neutral-0 px-4 font-body text-body3 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400"
        />
      ) : (
        <h1 className="m-0 font-body text-label2 text-neutral-900">{title}</h1>
      )}
      <button
        type="button"
        onClick={toggleSearch}
        aria-label={searchOpen ? "검색 닫기" : `${title} 검색`}
        className="absolute right-6 flex size-6 items-center justify-center"
      >
        <img
          src={searchOpen ? CloseIcon : SearchIcon}
          alt=""
          className="size-5 object-contain brightness-0"
        />
      </button>
    </header>
  );
}

export function FanLiveFilterTabs({
  value,
  onChange,
}: {
  value: FanLiveFilter;
  onChange: (value: FanLiveFilter) => void;
}) {
  return (
    <div className="flex h-12 border-b border-neutral-400 px-[15px]">
      {([
        ["followed", "팔로우한 밴드"],
        ["all", "전체 밴드"],
      ] as const).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`relative flex flex-1 items-center justify-center font-body text-body1 ${
            value === id ? "text-primary-400" : "text-neutral-400"
          }`}
        >
          {label}
          {value === id ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-400" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  onMoreClick?: () => void;
};

export function FanLiveSectionHeader({
  title,
  onMoreClick,
}: SectionHeaderProps) {
  return (
    <div className="flex h-6 items-center justify-between">
      <h2 className="m-0 font-body text-label1 text-neutral-900">{title}</h2>
      <button
        type="button"
        onClick={onMoreClick}
        className="flex items-center font-body text-body1 text-neutral-400"
      >
        더보기
        <img src={MoreArrowIcon} alt="" className="size-6" />
      </button>
    </div>
  );
}

type ReplayPreviewCardProps = {
  imageSrc: string;
  title: string;
  bandName: string;
  viewCount: string;
  duration: string;
};

export function ReplayPreviewCard({
  imageSrc,
  title,
  bandName,
  viewCount,
  duration,
}: ReplayPreviewCardProps) {
  return (
    <article className="w-[88px] shrink-0">
      <div className="relative h-[62px] w-[88px] overflow-hidden rounded-[8px] bg-neutral-200">
        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        <span className="absolute right-1 bottom-1 rounded-[3px] bg-neutral-900/80 px-1 font-body text-caption6 text-neutral-0">
          {duration}
        </span>
      </div>
      <h3 className="mt-2 truncate font-body text-body4 text-neutral-900">
        {title}
      </h3>
      <p className="mt-0.5 truncate font-body text-caption4 text-neutral-600">
        {bandName}
      </p>
      <p className="mt-1 flex items-center gap-0.5 font-body text-caption4 text-neutral-400">
        <img src={PlayIcon} alt="" className="size-2.5 opacity-40" />
        {viewCount}
      </p>
    </article>
  );
}
