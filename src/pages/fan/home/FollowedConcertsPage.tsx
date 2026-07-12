import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";

const INTEREST_CONCERTS = Array.from({ length: 7 }, (_, index) => ({
  id: `interest-concert-${index + 1}`,
  month: "MAY",
  day: "17",
  title: "WAVY 단독 공연",
  location: "홍대 롤링홀",
  dateTime: "2026.05.17. 18:00",
  status: "D-7",
  showThumbnail: index !== 1,
}));

const SORT_OPTIONS = ["공연임박순", "최신순", "인기순"] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M19 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V12H20V19ZM20 10H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V10Z"
      fill="currentColor"
    />
  </svg>
);

const SortArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="7"
    viewBox="0 0 12 7"
    fill="none"
    aria-hidden="true"
    className="h-[7px] w-[12px]"
  >
    <path
      d="M1 1L6 6L11 1"
      stroke="var(--color-primary-400)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12.5L9.5 17L19 7"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FollowedConcertsPage = () => {
  const navigate = useNavigate();
  const [selectedSort, setSelectedSort] = useState<SortOption>("공연임박순");
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  return (
    <main className="min-h-dvh bg-neutral-0 px-[15px] pb-[calc(var(--bottom-nav-height)+24px)] pt-7">
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
          관심 공연
        </h1>

        <button
          type="button"
          aria-label="공연 일정"
          onClick={() => navigate("/fan/home/concerts/calendar")}
          className="flex size-6 items-center justify-center text-neutral-900"
        >
          <CalendarIcon />
        </button>
      </header>

      <div className="mt-[11px] flex h-10 items-center justify-between pl-0.5 pr-[3px]">
        <p className="m-0 font-body text-caption3 text-neutral-600">
          관심 공연 7개
        </p>

        <button
          type="button"
          onClick={() => setIsSortSheetOpen(true)}
          className="flex items-center gap-2 font-body text-caption3 text-primary-400"
        >
          {selectedSort}
          <SortArrowIcon />
        </button>
      </div>

      <section className="mt-2 flex flex-col items-center gap-3">
        {INTEREST_CONCERTS.map((concert) => (
          <ConcertCard
            key={concert.id}
            month={concert.month}
            day={concert.day}
            title={concert.title}
            location={concert.location}
            dateTime={concert.dateTime}
            status={<span className="text-primary-500">{concert.status}</span>}
            dateBadgeClassName="bg-primary-300"
            showThumbnail={concert.showThumbnail}
            onClick={() => navigate(`/fan/home/concerts/${concert.id}`)}
            ariaLabel={`${concert.title} 상세보기`}
          />
        ))}
      </section>

      {isSortSheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end bg-neutral-900/50">
          <button
            type="button"
            aria-label="정렬 옵션 닫기"
            className="absolute inset-0"
            onClick={() => setIsSortSheetOpen(false)}
          />

          <section
            aria-label="공연 정렬 옵션"
            className="relative z-10 flex w-full flex-col items-start gap-2.5 rounded-t-[24px] bg-neutral-0 px-[30px] pb-12 pt-8"
          >
            <div className="flex w-[330px] flex-col items-start gap-6">
              {SORT_OPTIONS.map((option) => {
                const isSelected = option === selectedSort;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedSort(option);
                      setIsSortSheetOpen(false);
                    }}
                    className={`flex w-full items-center justify-between text-left font-body text-label2 ${
                      isSelected ? "text-primary-400" : "text-neutral-900"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center text-primary-400">
                        <CheckIcon />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
};

export default FollowedConcertsPage;
