import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/Button/Button";
import { SignupField } from "@/features/onboarding/SignupField";
import SignupPhoneVerification from "@/features/onboarding/SignupPhoneVerification";
import {
  useFindLoginId,
  useSendPhoneVerification,
  useVerifyPhone,
} from "@/hooks/api/auth/useAuth";

type ApiErrorResponse = {
  message?: string;
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return axiosError.response?.data?.message ?? fallbackMessage;
};

const FindLoginIdPage = () => {
  const navigate = useNavigate();

  const { mutate: sendCodeMutate, isPending: isSendingCode } =
    useSendPhoneVerification();
  const { mutate: verifyPhoneMutate, isPending: isVerifyingPhone } =
    useVerifyPhone();
  const { mutate: findLoginIdMutate, isPending: isFinding } =
    useFindLoginId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  const [foundLoginId, setFoundLoginId] = useState<string | null>(null);

  useEffect(() => {
    if (!isCodeSent || isPhoneVerified) return;

    if (timeLeft <= 0) {
      const timeout = window.setTimeout(() => {
        setIsPhoneVerified(false);
        setCode("");
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCodeSent, isPhoneVerified, timeLeft]);

  const isFormValid = useMemo(
    () => Boolean(name && phone && isPhoneVerified),
    [name, phone, isPhoneVerified],
  );

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, ""));
    setIsCodeSent(false);
    setIsPhoneVerified(false);
    setTimeLeft(180);
    setCode("");
  };

  const handleSendCode = () => {
    if (!phone || isSendingCode) return;

    sendCodeMutate(
      { phone, purpose: "FIND_LOGIN_ID" },
      {
        onSuccess: () => {
          setIsCodeSent(true);
          setIsPhoneVerified(false);
          setTimeLeft(180);
          setCode("");
          alert("인증번호가 발송되었습니다.");
        },
        onError: (error) => {
          console.error(error);
          alert(getApiErrorMessage(error, "인증번호 발송에 실패했습니다."));
        },
      },
    );
  };

  const handleCodeChange = (value: string) => {
    const onlyNumber = value.replace(/\D/g, "");

    setCode(onlyNumber);
    setIsPhoneVerified(false);

    if (onlyNumber.length !== 6 || isVerifyingPhone || timeLeft <= 0) return;

    verifyPhoneMutate(
      { phone, code: onlyNumber, purpose: "FIND_LOGIN_ID" },
      {
        onSuccess: () => {
          setIsPhoneVerified(true);
        },
        onError: (error) => {
          console.error(error);
          setIsPhoneVerified(false);
          alert(getApiErrorMessage(error, "인증번호가 올바르지 않습니다."));
        },
      },
    );
  };

  const handleFindLoginId = () => {
    if (!isFormValid || isFinding) return;

    findLoginIdMutate(
      { name, phone },
      {
        onSuccess: (data) => {
          setFoundLoginId(data.loginId);
        },
        onError: (error) => {
          console.error(error);
          alert(getApiErrorMessage(error, "아이디 조회에 실패했습니다."));
        },
      },
    );
  };

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-8">
      <header className="flex h-12 items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
          aria-label="뒤로가기"
        >
          <img src={ArrowLeftIcon} alt="" className="size-5" />
        </button>

        <h1 className="text-label2 text-neutral-900">아이디 찾기</h1>

        <div className="size-6" />
      </header>

      {foundLoginId ? (
        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="text-center">
            {/* FIXME: 디자인 미확정 - 임시 문구 */}
            <p className="text-body1 text-neutral-600">
              회원님의 아이디입니다.
            </p>

            <p className="mt-2 text-h4 text-neutral-900">{foundLoginId}</p>
          </div>

          <Button
            type="button"
            size="large"
            tone="pink"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full"
          >
            로그인하러 가기
          </Button>
        </div>
      ) : (
        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleFindLoginId();
          }}
        >
          <SignupField
            label="이름"
            required
            value={name}
            placeholder="이름을 입력해주세요"
            onChange={setName}
          />

          <SignupPhoneVerification
            phone={phone}
            code={code}
            isCodeSent={isCodeSent}
            isPhoneVerified={isPhoneVerified}
            isSendingCode={isSendingCode}
            isVerifyingPhone={isVerifyingPhone}
            timeLeft={timeLeft}
            onPhoneChange={handlePhoneChange}
            onSendCode={handleSendCode}
            onCodeChange={handleCodeChange}
          />

          <Button
            type="submit"
            size="large"
            tone={isFormValid ? "pink" : "gray"}
            disabled={!isFormValid || isFinding}
            className="mt-2 h-[48px] w-full rounded-[10px] text-label1"
          >
            {isFinding ? "조회 중..." : "아이디 찾기"}
          </Button>
        </form>
      )}
    </main>
  );
};

export default FindLoginIdPage;
