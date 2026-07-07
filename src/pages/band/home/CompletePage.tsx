import { Fragment } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import CheckCircleIcon from "@/assets/icons/check-circle-complete.svg";

interface CompleteRow {
  label: string;
  value: string;
}

interface CompleteState {
  title: string;
  description: string;
  rows: CompleteRow[];
  primaryLabel: string;
  primaryTo: string;
}

const CompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CompleteState | null;

  if (!state) {
    return <Navigate to="/band/home" replace />;
  }

  const { title, description, rows, primaryLabel, primaryTo } = state;

  return (
    <main className="relative flex min-h-dvh flex-col items-center gap-12 bg-neutral-0 px-5 pt-31 pb-24">
      <div className="flex flex-col items-center gap-6">
        <img src={CheckCircleIcon} alt="" />

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-center text-h1 text-neutral-900">{title}</h1>

          <p className="text-center text-body2 text-neutral-600">
            {description.split("\n").map((line, index) => (
              <Fragment key={index}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex w-82.5 flex-col items-start gap-2 rounded-lg bg-neutral-0 p-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          {rows.map((row, index) => (
            <Fragment key={row.label}>
              {index > 0 ? <div className="h-px w-full bg-[#E4E4E7]" /> : null}
              <div className="flex w-full items-center justify-between">
                <span className="text-center text-caption2 text-neutral-700">
                  {row.label}
                </span>
                <span className="text-right text-caption3 text-neutral-900">
                  {row.value}
                </span>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex w-full justify-center gap-5">
          <button
            type="button"
            onClick={() => navigate("/band/home")}
            className="flex h-12 w-38.75 shrink-0 items-center justify-center gap-2.5 rounded-[10px] border-[1.5px] border-secondary-500 bg-neutral-0 px-3 py-2 text-label2 text-secondary-500"
          >
            내 밴드로
          </button>
          <button
            type="button"
            onClick={() => navigate(primaryTo)}
            className="flex h-12 w-38.75 shrink-0 items-center justify-center gap-2.5 rounded-[10px] bg-secondary-500 px-3 py-2 text-center text-label2 text-neutral-0"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </main>
  );
};

export default CompletePage;
