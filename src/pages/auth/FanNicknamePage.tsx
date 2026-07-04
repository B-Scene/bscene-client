import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ErrorIcon from "@/assets/icons/error.svg";
import Button from "@/components/common/Button/Button";

const FanNicknamePage = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  const isValidNickname = nickname.trim().length > 0 && !isDuplicate;

  const handleChangeNickname = (value: string) => {
    const nextValue = value.slice(0, 8);
    setNickname(nextValue);

    // TODO: 닉네임 중복 확인 API 연결 후,
    // 중복일 때만 setIsDuplicate(true)
    setIsDuplicate(false);
  };

  const handleNext = () => {
    if (!isValidNickname) return;
    navigate("/onboarding/complete");
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
          팬모드에서 사용할
          <br />
          닉네임을 정해주세요
        </h1>

        <p className="mt-2 text-body2 text-neutral-600">
          나중에 언제든 변경할 수 있어요
        </p>

        <div className="mt-10">
          <input
            value={nickname}
            onChange={(e) => handleChangeNickname(e.target.value)}
            placeholder="8자 이내 한글 혹은 영문"
            className={`h-[72px] w-full rounded-xl border bg-neutral-0 px-6 text-label2 text-neutral-900 outline-none placeholder:text-label2 placeholder:text-neutral-400 ${
              nickname && isDuplicate
                ? "border-[1.5px] border-error"
                : "border-[1.5px] border-primary-400"
            }`}
          />

          {nickname && isDuplicate && (
            <p className="mt-2 flex items-center gap-1 text-caption2 text-error">
              <img src={ErrorIcon} alt="" className="size-[14px]" />
              이미 존재하는 닉네임입니다.
            </p>
          )}
        </div>
      </section>

      <div className="fixed bottom-9 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-5">
        <Button
          size="large"
          type="button"
          disabled={!isValidNickname}
          tone={isValidNickname ? "pink" : "gray"}
          className="w-full"
          onClick={() => navigate("/onboarding/genre")}
        >
          다음
        </Button>
      </div>
    </main>
  );
};

export default FanNicknamePage;