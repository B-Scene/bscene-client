import { Fragment } from 'react';

export interface StatItem {
  label: string;
  value: number;
}

interface StatRowProps {
  stats: StatItem[];
}

export const StatRow = ({ stats }: StatRowProps) => {
  return (
    <div className="flex items-center rounded-2xl bg-neutral-0 px-10 py-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
      {stats.map((stat, index) => (
        <Fragment key={stat.label}>
          {index > 0 ? (
            <div className="mx-9.5 h-10 w-px shrink-0 bg-neutral-300" />
          ) : null}

          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-label1 text-neutral-900">{stat.value}</span>
            <span className="text-body5 text-neutral-600">{stat.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
};
