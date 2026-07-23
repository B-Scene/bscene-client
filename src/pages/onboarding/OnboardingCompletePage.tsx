import { useNavigate } from "react-router-dom";

import BSceneSymbol from "@/assets/bscene-symbol.svg";
import Button from "@/components/common/Button/Button";
import { useSaveOnboarding } from "@/hooks/api/onboarding/useOnboarding";
import type { ModeCode } from "@/types/onboarding/onboarding";

const getJsonItem = <T,>(key: string, fallback: T): T => {
  const value = sessionStorage.getItem(key);

  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const OnboardingCompletePage = () => {
  const navigate = useNavigate();
  const { mutate: saveOnboardingMutate, isPending } = useSaveOnboarding();

  const handleStart = () => {
    const selectedModes = getJsonItem<ModeCode[]>(
      "onboardingSelectedModes",
      ["FAN"],
    );
    const initialMode =
      (sessionStorage.getItem("onboardingInitialMode") as ModeCode | null) ??
      "FAN";
    const fanNickname =
      sessionStorage.getItem("onboardingFanNickname") ?? undefined;
    const genres = getJsonItem<string[]>("onboardingGenres", []);
    const regions = getJsonItem<string[]>("onboardingRegions", []);

    saveOnboardingMutate(
      {
        selectedModes,
        initialMode,
        fanNickname,
        genres,
        regions,
      },
      {
        onSuccess: () => {
          sessionStorage.removeItem("onboardingSelectedModes");
          sessionStorage.removeItem("onboardingInitialMode");
          sessionStorage.removeItem("onboardingFanNickname");
          sessionStorage.removeItem("onboardingGenres");
          sessionStorage.removeItem("onboardingRegions");

          navigate("/home", { replace: true });
        },
        onError: (error) => {
          console.error(error);
          alert("온보딩 저장에 실패했습니다.");
        },
      },
    );
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-neutral-0 px-5 pb-[60px]">
      <section className="flex flex-1 flex-col items-center justify-center pb-[96px]">
        <img
          src={BSceneSymbol}
          alt="B:Scene"
          className="mb-7 h-[78px] w-auto"
        />

        <h1 className="text-center text-h2 text-neutral-900">
          설정이 완료됐어요
        </h1>

        <p className="mt-3 text-center text-body2 text-neutral-600">
          지금 바로 B:Scene을
          <br />
          시작해보세요
        </p>
      </section>

      <Button
        size="large"
        onClick={handleStart}
        disabled={isPending}
        tone={isPending ? "gray" : "pink"}
        className="w-full"
      >
        {isPending ? "저장 중..." : "B:Scene 시작하기"}
      </Button>
    </main>
  );
};

export default OnboardingCompletePage;