import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/Button/Button";
import { useRegions } from "@/hooks/api/onboarding/useOnboarding";

const RegionSelectPage = () => {
  const navigate = useNavigate();
  const { data: regions = [], isLoading } = useRegions();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleRegion = (code: string) => {
    if (selected.includes(code)) {
      setSelected(selected.filter((regionCode) => regionCode !== code));
      return;
    }

    if (selected.length >= 2) return;

    setSelected([...selected, code]);
  };

  const handleNext = () => {
    if (!selected.length) return;

    sessionStorage.setItem("onboardingRegions", JSON.stringify(selected));
    navigate("/onboarding/complete");
  };

  const regionRows = [
    regions.slice(0, 5),
    regions.slice(5, 10),
    regions.slice(10, 15),
    regions.slice(15),
  ].filter((row) => row.length > 0);

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
          {isLoading ? (
            <p className="text-body2 text-neutral-500">지역 불러오는 중...</p>
          ) : (
            regionRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map((region) => {
                  const isSelected = selected.includes(region.code);

                  return (
                    <Button
                      key={region.code}
                      size="chipLarge"
                      variant="solid"
                      tone={isSelected ? "pink" : "gray"}
                      onClick={() => toggleRegion(region.code)}
                    >
                      {region.name}
                    </Button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-9 px-5">
        <Button
          size="large"
          disabled={!selected.length}
          tone={selected.length ? "pink" : "gray"}
          className="w-full"
          onClick={handleNext}
        >
          다음
        </Button>
      </div>
    </main>
  );
};

export default RegionSelectPage;