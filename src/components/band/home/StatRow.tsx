import { Fragment } from "react";

export interface StatItem {
  label: string;
  value: number;
  onClick?: () => void;
}

interface StatRowProps {
  stats: StatItem[];
}

export const StatRow = ({ stats }: StatRowProps) => {
  return (
    <div className="flex items-center rounded-2xl bg-neutral-0 px-[clamp(1rem,6vw,2.5rem)] py-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
      {stats.map((stat, index) => {
        const content = (
          <>
            <span className="text-label1 text-neutral-900">{stat.value}</span>
            <span className="text-body5 whitespace-nowrap text-neutral-600">
              {stat.label}
            </span>
          </>
        );

        return (
          <Fragment key={stat.label}>
            {index > 0 ? (
              <div className="mx-[clamp(1rem,4vw,2.375rem)] h-10 w-px shrink-0 bg-neutral-300" />
            ) : null}

            {stat.onClick ? (
              <button
                type="button"
                onClick={stat.onClick}
                className="flex flex-1 flex-col items-center gap-1"
              >
                {content}
              </button>
            ) : (
              <div className="flex flex-1 flex-col items-center gap-1">
                {content}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
