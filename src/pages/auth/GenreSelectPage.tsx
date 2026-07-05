import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/Button/Button";

const GENRE_ROWS = [
  ["록", "인디팝", "펑크", "메탈", "재즈"],
  ["블루스", "R&B", "어쿠스틱", "포크"],
];

const GenreSelectPage = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    if (selected.includes(genre)) {
      setSelected(selected.filter((g) => g !== genre));
      return;
    }

    if (selected.length >= 3) return;

    setSelected([...selected, genre]);
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
          관심 장르를 선택하세요
        </h1>

        <p className="mt-2 text-body2 text-neutral-600">
          최대 3개
        </p>

        <div className="mt-8 flex flex-col items-center gap-2">
          {GENRE_ROWS.map((row) => (
            <div
              key={row.join("-")}
              className="flex justify-center gap-2"
            >
              {row.map((genre) => {
                const isSelected = selected.includes(genre);

                return (
                  <Button
                    key={genre}
                    size="chipLarge"
                    variant="solid"
                    tone={isSelected ? "pink" : "gray"}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
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
          onClick={() => navigate("/onboarding/region")}
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