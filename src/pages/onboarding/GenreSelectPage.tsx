import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/Button/Button";
import { useGenres } from "@/hooks/api/onboarding/useOnboarding";

const GenreSelectPage = () => {
  const navigate = useNavigate();
  const { data: genres = [], isLoading } = useGenres();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleGenre = (code: string) => {
    if (selected.includes(code)) {
      setSelected(selected.filter((genreCode) => genreCode !== code));
      return;
    }

    if (selected.length >= 3) return;

    setSelected([...selected, code]);
  };

  const handleNext = () => {
    if (!selected.length) return;

    sessionStorage.setItem("onboardingGenres", JSON.stringify(selected));
    navigate("/onboarding/region");
  };

  const genreRows = [
    genres.slice(0, 5),
    genres.slice(5),
  ];

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
        <h1 className="text-h2 text-neutral-900">관심 장르를 선택하세요</h1>

        <p className="mt-2 text-body2 text-neutral-600">최대 3개</p>

        <div className="mt-8 flex flex-col items-center gap-2">
          {isLoading ? (
            <p className="text-body2 text-neutral-500">장르 불러오는 중...</p>
          ) : (
            genreRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map((genre) => {
                  const isSelected = selected.includes(genre.code);

                  return (
                    <Button
                      key={genre.code}
                      size="chipLarge"
                      variant="solid"
                      tone={isSelected ? "pink" : "gray"}
                      onClick={() => toggleGenre(genre.code)}
                    >
                      {genre.name}
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
          onClick={handleNext}
          tone={selected.length ? "pink" : "gray"}
          className="w-full"
        >
          다음
        </Button>
      </div>
    </main>
  );
};

export default GenreSelectPage;