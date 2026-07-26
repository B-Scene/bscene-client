export const joinClassNames = (
  ...classNames: Array<string | false | null | undefined>
) => classNames.filter(Boolean).join(" ");

export const getStoredBandMemberId = () => {
  const storedBandMemberId =
    localStorage.getItem("bandMemberId") ??
    localStorage.getItem("currentBandMemberId") ??
    localStorage.getItem("selectedBandMemberId");

  const parsedBandMemberId = Number(storedBandMemberId);

  return Number.isFinite(parsedBandMemberId) && parsedBandMemberId > 0
    ? parsedBandMemberId
    : null;
};

export const toRecruitmentDeadlineAt = (
  dateValue: string,
  timeValue: string,
) => `${dateValue}T${timeValue}:00`;

export const splitRecruitmentDeadlineAt = (deadlineAt?: string) => ({
  deadlineDate: deadlineAt?.slice(0, 10) ?? "",
  deadlineTime: deadlineAt?.slice(11, 16) ?? "",
});

export const isFutureRecruitmentDeadline = (
  dateValue: string,
  timeValue: string,
) => {
  if (!dateValue || !timeValue) return false;

  const deadline = new Date(toRecruitmentDeadlineAt(dateValue, timeValue));

  return !Number.isNaN(deadline.getTime()) && deadline.getTime() > Date.now();
};

export const formatRecruitmentDeadlineDate = (value: string) => {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  const weekDay = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(year, month - 1, day).getDay()
  ];

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
    2,
    "0",
  )}. (${weekDay})`;
};
