import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CheckIcon from "@/assets/icons/check.svg";
import CheckActiveIcon from "@/assets/icons/check-active.svg";
import Button from "@/components/common/Button/Button";
import { SignupField } from "@/features/onboarding/SignupField";
import SignupPhoneVerification from "@/features/onboarding/SignupPhoneVerification";
import {
  useResetPassword,
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

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const { mutate: sendCodeMutate, isPending: isSendingCode } =
    useSendPhoneVerification();
  const { mutate: verifyPhoneMutate, isPending: isVerifyingPhone } =
    useVerifyPhone();
  const { mutate: resetPasswordMutate, isPending: isResetting } =
    useResetPassword();

  const [loginId, setLoginId] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

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

  const isPasswordValid =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/.test(newPassword);

  const isPasswordSame =
    newPassword.length > 0 &&
    newPasswordConfirm.length > 0 &&
    newPassword === newPasswordConfirm;

  const isFormValid = useMemo(
    () =>
      Boolean(
        loginId &&
          phone &&
          isPhoneVerified &&
          isPasswordValid &&
          isPasswordSame,
      ),
    [loginId, phone, isPhoneVerified, isPasswordValid, isPasswordSame],
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
      { phone, purpose: "PASSWORD_RESET" },
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
      { phone, code: onlyNumber, purpose: "PASSWORD_RESET" },
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

  const handleResetPassword = () => {
    if (!isFormValid || isResetting) return;

    resetPasswordMutate(
      { loginId, phone, newPassword, newPasswordConfirm },
      {
        onSuccess: () => {
          alert("비밀번호가 재설정되었습니다.");
          navigate("/login", { replace: true });
        },
        onError: (error) => {
          console.error(error);
          alert(getApiErrorMessage(error, "비밀번호 재설정에 실패했습니다."));
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

        <h1 className="text-label2 text-neutral-900">비밀번호 재설정</h1>

        <div className="size-6" />
      </header>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleResetPassword();
        }}
      >
        <SignupField
          label="아이디"
          required
          value={loginId}
          placeholder="가입 시 사용한 이메일을 입력해주세요"
          onChange={setLoginId}
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

        <div>
          <SignupField
            label="새 비밀번호"
            required
            type="password"
            value={newPassword}
            placeholder="새 비밀번호를 입력해주세요"
            onChange={setNewPassword}
          />

          <p
            className={`mt-2 flex items-center gap-1 text-caption2 ${
              isPasswordValid ? "text-primary-400" : "text-neutral-400"
            }`}
          >
            <img
              src={isPasswordValid ? CheckActiveIcon : CheckIcon}
              alt=""
              className="size-[14px]"
            />
            영문/숫자/특수문자 포함 8~20자
          </p>
        </div>

        <div>
          <SignupField
            label="새 비밀번호 확인"
            required
            type="password"
            value={newPasswordConfirm}
            placeholder="새 비밀번호를 한번 더 입력해주세요"
            onChange={setNewPasswordConfirm}
          />

          <p
            className={`mt-2 flex items-center gap-1 text-caption2 ${
              isPasswordSame ? "text-primary-400" : "text-neutral-400"
            }`}
          >
            <img
              src={isPasswordSame ? CheckActiveIcon : CheckIcon}
              alt=""
              className="size-[14px]"
            />
            비밀번호가 일치합니다.
          </p>
        </div>

        <Button
          type="submit"
          size="large"
          tone={isFormValid ? "pink" : "gray"}
          disabled={!isFormValid || isResetting}
          className="mt-2 h-[48px] w-full rounded-[10px] text-label1"
        >
          {isResetting ? "변경 중..." : "비밀번호 변경"}
        </Button>
      </form>
    </main>
  );
};

export default ResetPasswordPage;
