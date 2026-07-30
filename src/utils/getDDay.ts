export const getDDay = (performanceDate: string, today: Date) => {
  const [year, month, day] = performanceDate.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.round(
    (target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24),
  );
};

export const formatDDayLabel = (diffDays: number) => {
  if (diffDays === 0) return "D-DAY";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
};
