import ApproveIcon from "@/assets/icons/band/approve.svg";

interface SessionRecruitmentCompleteSummary {
  title: string;
  part: string;
  skill: string;
  genre: string;
  region: string;
  deadlineDate: string;
  deadlineTime: string;
}

interface SessionRecruitmentCompleteScreenProps {
  summary: SessionRecruitmentCompleteSummary;
  onBackToSession: () => void;
  onConfirmPost: () => void;
}

export const SessionRecruitmentCompleteScreen = ({
  summary,
  onBackToSession,
  onConfirmPost,
}: SessionRecruitmentCompleteScreenProps) => {
  const rows = [
    ["공고 제목", summary.title],
    ["모집 파트", summary.part],
    ["실력대", summary.skill],
    ["장르", summary.genre],
    ["활동 지역", summary.region],
    ["모집 마감", formatDeadline(summary.deadlineDate, summary.deadlineTime)],
  ];

  return (
    <main className="min-h-dvh bg-neutral-0 px-[30px] pb-[calc(var(--bottom-nav-height)+30px)] pt-[147px]">
      <section className="flex flex-col items-center">
        <img src={ApproveIcon} alt="" className="size-[120px]" />
        <h1 className="mt-[58px] w-[328px] text-center text-[28px] leading-[38px] font-bold tracking-[0.84px] text-[#111111]">
          세션 모집 공고가 등록됐어요
        </h1>
        <p className="mt-4 text-center text-body1 text-neutral-600">
          조건에 맞는 세션 뮤지션들이
          <br />
          공고를 볼 수 있어요
        </p>

        <dl className="mt-[58px] w-[330px] rounded-[8px] bg-neutral-0 px-4 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
          {rows.map(([label, value], index) => (
            <div
              key={label}
              className={
                index === rows.length - 1
                  ? "flex h-[31px] items-center justify-between"
                  : "flex h-[31px] items-center justify-between border-b border-neutral-300"
              }
            >
              <dt className="text-body1 text-neutral-600">{label}</dt>
              <dd className="text-right text-body1 font-semibold text-neutral-900">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-[34px] grid w-[330px] grid-cols-2 gap-5">
          <button
            type="button"
            onClick={onBackToSession}
            className="flex h-[48px] items-center justify-center rounded-[10px] border-[1.5px] border-secondary-500 bg-neutral-0 text-label2 text-secondary-500"
          >
            세션 탭으로
          </button>
          <button
            type="button"
            onClick={onConfirmPost}
            className="flex h-[48px] items-center justify-center rounded-[10px] bg-secondary-500 text-label2 text-neutral-0"
          >
            공고 확인하기
          </button>
        </div>
      </section>
    </main>
  );
};

const formatDeadline = (dateValue: string, timeValue: string) => {
  const dateLabel = formatDate(dateValue) || "2024.05.24. (금)";
  const timeLabel = timeValue || "18:00";

  return `${dateLabel} ${timeLabel}`;
};

const formatDate = (value: string) => {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  const weekDay = ["일", "월", "화", "수", "목", "금", "토"][new Date(year, month - 1, day).getDay()];
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}. (${weekDay})`;
};
