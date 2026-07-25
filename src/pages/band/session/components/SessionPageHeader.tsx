import AirplaneIcon from "@/assets/icons/band/band-airplane.svg";
import SearchIcon from "@/assets/icons/band/band-search.svg";

interface SessionPageHeaderProps {
  onSearch: () => void;
}

export const SessionPageHeader = ({ onSearch }: SessionPageHeaderProps) => {
  return (
    <header className="relative flex h-[88px] w-full shrink-0 items-end justify-center bg-neutral-0 pb-[23px]">
      <h1 className="text-[18px] leading-5 font-bold text-neutral-900">세션</h1>

      <div className="absolute right-6 bottom-[18px] flex items-center gap-4">
        <button
          type="button"
          aria-label="세션 검색"
          onClick={onSearch}
          className="flex size-8 items-center justify-center"
        >
          <img src={SearchIcon} alt="" className="h-5 w-[21px]" />
        </button>
        <button type="button" aria-label="보낸 메시지" className="flex size-8 items-center justify-center">
          <img src={AirplaneIcon} alt="" className="size-8" />
        </button>
      </div>
    </header>
  );
};
