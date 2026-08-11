import AirplaneIcon from "@/assets/icons/band/band-airplane.svg";
import SearchIcon from "@/assets/icons/band/band-search.svg";

interface SessionPageHeaderProps {
  showSearch?: boolean;
  onSearch: () => void;
  onMessages: () => void;
}

export const SessionPageHeader = ({
  showSearch = true,
  onSearch,
  onMessages,
}: SessionPageHeaderProps) => {
  return (
    <header className="relative flex h-12 w-full shrink-0 items-center justify-center bg-neutral-0">
      <h1 className="text-label2 text-[#1D1A1A]">세션</h1>

      <div className="absolute top-1/2 right-6 flex h-8 -translate-y-1/2 items-center gap-4">
        {showSearch ? (
          <button
            type="button"
            aria-label="세션 검색"
            onClick={onSearch}
            className="flex size-8 items-center justify-center"
          >
            <img
              src={SearchIcon}
              alt=""
              className="size-[23px] object-contain"
            />
          </button>
        ) : null}

        <button
          type="button"
          aria-label="쪽지함 열기"
          onClick={onMessages}
          className="flex size-8 items-center justify-center"
        >
          <img
            src={AirplaneIcon}
            alt=""
            className="size-[23px] object-contain"
          />
        </button>
      </div>
    </header>
  );
};