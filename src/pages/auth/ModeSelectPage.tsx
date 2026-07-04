import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/Button/Button";

type Mode = "fan" | "band" | "both";

const MODE_OPTIONS: {
  value: Mode;
  title: string;
  description: string;
}[] = [
  {
    value: "fan",
    title: "팬으로 시작",
    description: "밴드 탐색 · 공연 발견 · 라이브 청취",
  },
  {
    value: "band",
    title: "밴드로 시작",
    description: "밴드 운영 · 세션 모집 · 라이브 송출",
  },
  {
    value: "both",
    title: "둘 다",
    description: "팬 활동 + 밴드 운영 모두",
  },
];

const ModeSelectPage = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<Mode | null>("fan");

  const isNextEnabled = useMemo(() => Boolean(selectedMode), [selectedMode]);

  const handleNext = () => {
    if (!selectedMode) return;

    if (selectedMode === "fan") {
      navigate("/onboarding/fan-nickname");
      return;
    }

    if (selectedMode === "band") {
      navigate("/onboarding/band-nickname");
      return;
    }

    navigate("/onboarding/fan-nickname");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 px-5 pb-[96px]">
      <header className="flex h-12 items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
          aria-label="뒤로가기"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
      </header>

      <section className="mt-8">
        <h1 className="text-h2 text-neutral-900">
          어떤 목적으로
          <br />
          사용하시나요?
        </h1>

        <p className="mt-2 text-body2 text-neutral-600">
          나중에 언제든 변경할 수 있어요
        </p>

        <div className="mt-10 flex flex-col gap-[10px]">
          {MODE_OPTIONS.map((option) => {
            const isSelected = selectedMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedMode(option.value)}
                className={`flex h-[72px] w-full flex-col items-start justify-center gap-[2px] rounded-xl border bg-neutral-0 px-[25px] py-[17px] text-left ${
                  isSelected
                    ? "border-[1.5px] border-primary-400"
                    : "border border-neutral-400"
                }`}
              >
                <span
                  className={`text-label1 ${
                    isSelected ? "text-primary-400" : "text-neutral-400"
                  }`}
                >
                  {option.title}
                </span>

                <span
                  className={`text-caption1 ${
                    isSelected ? "text-neutral-600" : "text-neutral-400"
                  }`}
                >
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-9 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-5">
        <Button
          size="large"
          type="button"
          disabled={!isNextEnabled}
          tone={isNextEnabled ? "pink" : "gray"}
          className="w-full"
          onClick={() => navigate("/onboarding/fan-nickname")}
        >
          다음
        </Button>
      </div>
    </main>
  );
};

export default ModeSelectPage;