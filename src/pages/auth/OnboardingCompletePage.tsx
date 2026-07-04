import { useNavigate } from "react-router-dom";

import BSceneSymbol from "@/assets/bscene-symbol.svg";
import Button from "@/components/common/Button/Button";

const OnboardingCompletePage = () => {
  const navigate = useNavigate();

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
        onClick={() => navigate("/")}
        className="w-full"
      >
        B:Scene 시작하기
      </Button>
    </main>
  );
};

export default OnboardingCompletePage;