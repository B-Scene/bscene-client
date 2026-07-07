import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/Button/Button";

const REGION_ROWS = [
  ["서울", "경기", "인천", "부산", "대구"],
  ["광주", "대전", "울산", "세종", "충남"],
  ["충북", "전남", "전북", "경남", "경북"],
  ["강원", "제주"],
];

const RegionSelectPage = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleRegion = (region: string) => {
    if (selected.includes(region)) {
      setSelected(selected.filter((g) => g !== region));
      return;
    }

    if (selected.length >= 2) return;

    setSelected([...selected, region]);
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
        <h1 className="text-h2 text-neutral-900">활동 지역을 선택하세요</h1>

        <p className="mt-2 text-body2 text-neutral-600">최대 2개</p>

        <div className="mt-8 flex flex-col items-center gap-2">
          {REGION_ROWS.map((row) => (
            <div key={row.join("-")} className="flex justify-center gap-2">
              {row.map((region) => {
                const isSelected = selected.includes(region);

                return (
                  <Button
                    key={region}
                    size="chipLarge"
                    variant="solid"
                    tone={isSelected ? "pink" : "gray"}
                    onClick={() => toggleRegion(region)}
                  >
                    {region}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-9 px-5">
        <Button
          size="large"
          disabled={!selected.length}
          tone={selected.length ? "pink" : "gray"}
          className="w-full"
          onClick={() => navigate("/onboarding/complete")}
        >
          다음
        </Button>
      </div>
    </main>
  );
};

export default RegionSelectPage;