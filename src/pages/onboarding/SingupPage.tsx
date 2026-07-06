import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CheckIcon from "@/assets/icons/check.svg";
import CheckActiveIcon from "@/assets/icons/check-active.svg";
import Button from "@/components/common/Button/Button";
import {
  useOAuthSignup,
  useSendPhoneVerification,
  useSignup,
  useVerifyPhone,
} from "@/hooks/api/auth/useAuth";

type SignupForm = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
  code: string;
  birth: string;
  gender: string;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
};

const SignupPage = () => {
  const navigate = useNavigate();

  const signupToken = sessionStorage.getItem("signupToken");
  const socialEmail = sessionStorage.getItem("socialEmail");
  const isSocialSignup = Boolean(signupToken);

  const { mutate: sendCodeMutate, isPending: isSendingCode } =
    useSendPhoneVerification();
  const { mutate: verifyPhoneMutate, isPending: isVerifyingPhone } =
    useVerifyPhone();
  const { mutate: signupMutate, isPending: isSigningUp } = useSignup();
  const { mutate: oauthSignupMutate, isPending: isOAuthSigningUp } =
    useOAuthSignup();

  const [form, setForm] = useState<SignupForm>({
    email: socialEmail ?? "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    code: "",
    birth: "",
    gender: "",
  });

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (!isSocialSignup || !socialEmail) return;

    setForm((prev) => ({
      ...prev,
      email: socialEmail,
    }));
  }, [isSocialSignup, socialEmail]);

  useEffect(() => {
    if (!isCodeSent || isPhoneVerified) return;

    if (timeLeft <= 0) {
      setIsPhoneVerified(false);
      handleChange("code", "");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCodeSent, isPhoneVerified, timeLeft]);

  const isPending = isSigningUp || isOAuthSigningUp;

  const isPasswordValid =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/.test(form.password);

  const isPasswordSame =
    form.password.length > 0 &&
    form.passwordConfirm.length > 0 &&
    form.password === form.passwordConfirm;

  const isFormValid = useMemo(() => {
    return Boolean(
      form.email &&
        (isSocialSignup || (isPasswordValid && isPasswordSame)) &&
        form.name &&
        form.phone &&
        isPhoneVerified &&
        form.birth.length === 6 &&
        form.gender.length === 1,
    );
  }, [
    form.email,
    form.name,
    form.phone,
    form.birth,
    form.gender,
    isSocialSignup,
    isPasswordValid,
    isPasswordSame,
    isPhoneVerified,
  ]);

  const handleChange = (key: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOnlyNumberChange = (key: keyof SignupForm, value: string) => {
    handleChange(key, value.replace(/\D/g, ""));
  };

  const handleSendCode = () => {
    if (!form.phone || isSendingCode) return;

    sendCodeMutate(
      {
        phone: form.phone,
        purpose: "SIGNUP",
      },
      {
        onSuccess: () => {
          setIsCodeSent(true);
          setIsPhoneVerified(false);
          setTimeLeft(180);
          handleChange("code", "");
          alert("인증번호가 발송되었습니다.");
        },
        onError: (error) => {
          console.error(error);
          alert("인증번호 발송에 실패했습니다.");
        },
      },
    );
  };

  const handleCodeChange = (value: string) => {
    const onlyNumber = value.replace(/\D/g, "");

    handleChange("code", onlyNumber);
    setIsPhoneVerified(false);

    if (onlyNumber.length !== 6 || isVerifyingPhone || timeLeft <= 0) return;

    verifyPhoneMutate(
      {
        phone: form.phone,
        code: onlyNumber,
        purpose: "SIGNUP",
      },
      {
        onSuccess: () => {
          setIsPhoneVerified(true);
        },
        onError: (error) => {
          console.error(error);
          setIsPhoneVerified(false);
          alert("인증번호가 올바르지 않습니다.");
        },
      },
    );
  };

  const handleSignup = () => {
    if (!isFormValid || isPending) return;

    if (isSocialSignup) {
      if (!signupToken) return;

      oauthSignupMutate(
        {
          signupToken,
          name: form.name,
          birthDatePrefix: form.birth,
          genderCode: form.gender,
          phone: form.phone,
          terms: [
            { termId: 1, agreed: true },
            { termId: 2, agreed: true },
          ],
        },
        {
          onSuccess: (data) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            sessionStorage.removeItem("signupToken");
            sessionStorage.removeItem("socialEmail");

            navigate("/onboarding/agreement", { replace: true });
          },
          onError: (error) => {
            console.error(error);
            alert("소셜 회원가입에 실패했습니다.");
          },
        },
      );

      return;
    }

    signupMutate(
      {
        loginId: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        name: form.name,
        birthDatePrefix: form.birth,
        genderCode: form.gender,
        phone: form.phone,
        termAgreements: [
          { termId: 1, agreed: true },
          { termId: 2, agreed: true },
        ],
      },
      {
        onSuccess: () => {
          alert("회원가입이 완료되었습니다.");
          navigate("/login", { replace: true });
        },
        onError: (error) => {
          console.error(error);
          alert("회원가입에 실패했습니다.");
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

        <h1 className="text-label2 text-neutral-900">
          {isSocialSignup ? "소셜 회원가입" : "회원가입"}
        </h1>

        <div className="size-6" />
      </header>

      <form className="mt-5 flex flex-col gap-4">
        <TextField
          label="아이디"
          required
          value={form.email}
          placeholder="로그인에 사용할 이메일을 입력해주세요"
          disabled={isSocialSignup}
          onChange={(value) => {
            if (isSocialSignup) return;
            handleChange("email", value);
          }}
        />

        {!isSocialSignup && (
          <>
            <div>
              <TextField
                label="비밀번호"
                required
                type="password"
                value={form.password}
                placeholder="비밀번호를 입력해주세요"
                onChange={(value) => handleChange("password", value)}
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
              <TextField
                label="비밀번호 확인"
                required
                type="password"
                value={form.passwordConfirm}
                placeholder="비밀번호를 한번 더 입력해주세요"
                onChange={(value) => handleChange("passwordConfirm", value)}
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
          </>
        )}

        <TextField
          label="이름"
          required
          value={form.name}
          placeholder="이름을 입력해주세요"
          description="밴드모드에서는 실명이 사용됩니다."
          onChange={(value) => handleChange("name", value)}
        />

        <div>
          <FieldLabel required>휴대폰</FieldLabel>

          <div className="flex gap-2">
            <input
              value={form.phone}
              onChange={(e) => {
                handleOnlyNumberChange("phone", e.target.value);
                setIsCodeSent(false);
                setIsPhoneVerified(false);
                setTimeLeft(180);
                handleChange("code", "");
              }}
              placeholder="숫자만 입력해주세요"
              inputMode="numeric"
              className="h-[46px] min-w-0 flex-1 rounded-lg border border-neutral-400 bg-neutral-0 px-4 text-body2 font-medium text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500"
            />

            <Button
              type="button"
              size="medium"
              tone={form.phone ? "pink" : "gray"}
              disabled={!form.phone || isSendingCode}
              onClick={handleSendCode}
              className="h-[46px] w-[126px] shrink-0 rounded-lg text-body1"
            >
              {isSendingCode
                ? "발송 중..."
                : isCodeSent
                  ? "인증번호 재전송"
                  : "인증번호 받기"}
            </Button>
          </div>

          {isCodeSent && (
            <>
              <div className="mt-2 flex h-[46px] items-center rounded-lg border border-neutral-400 bg-neutral-0 px-4">
                <input
                  value={form.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="인증번호를 입력해주세요"
                  inputMode="numeric"
                  maxLength={6}
                  disabled={timeLeft <= 0 || isPhoneVerified}
                  className="min-w-0 flex-1 bg-transparent text-body2 font-medium text-neutral-900 outline-none placeholder:text-neutral-400 disabled:text-neutral-400"
                />

                <span className="text-body2 text-neutral-500">
                  {formatTime(timeLeft)}
                </span>
              </div>

              {isVerifyingPhone && (
                <p className="mt-1 text-body5 text-neutral-500">
                  인증번호 확인 중...
                </p>
              )}

              {isPhoneVerified && (
                <HelperText active>인증이 완료되었습니다.</HelperText>
              )}

              {!isPhoneVerified && timeLeft <= 0 && (
                <p className="mt-1 text-body5 text-error">
                  인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <FieldLabel required>생년월일/성별</FieldLabel>

          <p className="mb-2 text-caption2 text-neutral-500">
            생년월일과 성별(주민번호 뒤 첫번째 숫자)을 입력해주세요.
          </p>

          <div className="flex items-center gap-2">
            <input
              value={form.birth}
              onChange={(e) => handleOnlyNumberChange("birth", e.target.value)}
              placeholder="YYMMDD"
              inputMode="numeric"
              maxLength={6}
              className="h-[46px] w-[177px] rounded-lg border border-neutral-400 bg-neutral-0 px-4 text-body2 font-medium text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500"
            />

            <span className="text-body1 text-neutral-900">-</span>

            <input
              value={form.gender}
              onChange={(e) => handleOnlyNumberChange("gender", e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="h-[46px] w-[43px] rounded-lg border border-neutral-400 bg-neutral-0 text-center text-body2 font-medium text-neutral-900 outline-none focus:border-primary-500"
            />

            <span className="flex gap-[8px]">
              {Array.from({ length: 6 }).map((_, index) => (
                <span
                  key={index}
                  className="size-[10px] rounded-full bg-neutral-600"
                />
              ))}
            </span>
          </div>
        </div>

        <Button
          type="button"
          size="large"
          tone={isFormValid ? "pink" : "gray"}
          disabled={!isFormValid || isPending}
          onClick={handleSignup}
          className="mt-2 h-[48px] w-full rounded-[10px] text-label1"
        >
          {isPending ? "가입 중..." : "가입완료"}
        </Button>
      </form>
    </main>
  );
};

export default SignupPage;

type TextFieldProps = {
  label: string;
  required?: boolean;
  description?: string;
  placeholder: string;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const TextField = ({
  label,
  required = false,
  description,
  placeholder,
  value,
  type = "text",
  disabled = false,
  onChange,
}: TextFieldProps) => {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      {description && (
        <p className="mb-2 text-caption2 text-neutral-500">{description}</p>
      )}

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[46px] w-full rounded-lg border border-neutral-400 px-4 text-body2 font-medium outline-none placeholder:text-neutral-400 focus:border-primary-500 ${
          disabled
            ? "cursor-not-allowed bg-neutral-100 text-neutral-500"
            : "bg-neutral-0 text-neutral-900"
        }`}
      />
    </div>
  );
};

const FieldLabel = ({
  children,
  required = false,
}: {
  children: string;
  required?: boolean;
}) => {
  return (
    <label className="mb-2 block text-body1 font-semibold text-neutral-900">
      {children}
      {required && <span className="text-error">*</span>}
    </label>
  );
};

const HelperText = ({
  children,
  active = false,
}: {
  children: string;
  active?: boolean;
}) => {
  return (
    <p
      className={`mt-1 flex items-center gap-1 text-body5 ${
        active ? "text-primary-400" : "text-neutral-400"
      }`}
    >
      <img src={CheckIcon} alt="" className="h-[6px] w-[9px]" />
      {children}
    </p>
  );
};