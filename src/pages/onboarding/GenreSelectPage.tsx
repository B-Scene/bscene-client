import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/Button/Button";
import { useGenres } from "@/hooks/api/onboarding/useOnboarding";

const GENRE_ROWS = [
  ["인디", "팝", "팝록", "재즈", "블루스"],
  ["얼터너티브록", "사이키델릭록", "일렉트로닉록"],
  ["포크록", "펑크록", "하드록", "메탈", "etc"],
];

const GenreSelectPage = () => {
  const navigate = useNavigate();
  const { data: genres = [], isLoading } = useGenres();

  const [selected, setSelected] = useState<string[]>([]);

  const genreRows = useMemo(() => {
    return GENRE_ROWS.map((row) =>
      row
        .map((genreName) =>
          genres.find((genre) => genre.name === genreName),
        )
        .filter((genre) => genre !== undefined),
    );
  }, [genres]);

  const toggleGenre = (code: string) => {
    if (selected.includes(code)) {
      setSelected((prev) =>
        prev.filter((genreCode) => genreCode !== code),
      );
      return;
    }

    if (selected.length >= 3) return;

    setSelected((prev) => [...prev, code]);
  };

  const handleNext = () => {
    if (!selected.length) return;

    sessionStorage.setItem(
      "onboardingGenres",
      JSON.stringify(selected),
    );

    navigate("/onboarding/region");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 px-5 pb-[112px]">
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
          관심 장르를 선택하세요
        </h1>

        <p className="mt-2 text-body2 text-neutral-600">
          최대 3개
        </p>

        <div className="mt-8">
          {isLoading ? (
            <p className="text-body2 text-neutral-500">
              장르 불러오는 중...
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {genreRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-2">
                  {row.map((genre) => {
                    const isSelected = selected.includes(genre.code);

                    return (
                      <button
                        key={genre.code}
                        type="button"
                        onClick={() => toggleGenre(genre.code)}
                        className={`shrink-0 whitespace-nowrap rounded-[100px] px-[15px] py-1 text-body1 ${
                          isSelected
                            ? "bg-primary-400 text-neutral-0"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="absolute inset-x-5 bottom-9">
        <Button
          type="button"
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