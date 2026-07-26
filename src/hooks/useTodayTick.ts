import { useEffect, useState } from "react";

const getMsUntilNextMidnight = (from: Date) => {
  const nextMidnight = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + 1,
    0,
    0,
    0,
    0,
  );

  return nextMidnight.getTime() - from.getTime();
};

export const useTodayTick = () => {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setToday(new Date());
    }, getMsUntilNextMidnight(today));

    return () => clearTimeout(timeout);
  }, [today]);

  return today;
};
