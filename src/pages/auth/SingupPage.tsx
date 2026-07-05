import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CheckIcon from "@/assets/icons/check-active.svg";
import Button from "@/components/common/Button/Button";

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

const SignupPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupForm>({
    email: "",
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

  const isPasswordValid =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/.test(form.password);

  const isPasswordSame =
    form.password.length > 0 && form.password === form.passwordConfirm;

  const isFormValid = useMemo(() => {
    return Boolean(
      form.email &&
        isPasswordValid &&
        isPasswordSame &&
        form.name &&
        form.phone &&
        isPhoneVerified &&
        form.birth.length === 6 &&
        form.gender.length === 1,
    );
  }, [form, isPasswordValid, isPasswordSame, isPhoneVerified]);

  const handleChange = (key: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOnlyNumberChange = (key: keyof SignupForm, value: string) => {
    handleChange(key, value.replace(/\D/g, ""));
  };

  const handleSendCode = () => {
    if (!form.phone) return;

    setIsCodeSent(true);
    setIsPhoneVerified(false);
    handleChange("code", "");

    // TODO: 인증번호 발송 API 연결
  };

  const handleCodeChange = (value: string) => {
    const onlyNumber = value.replace(/\D/g, "");

    handleChange("code", onlyNumber);

    // TODO: 실제 API 연결 후 인증 성공 응답을 받으면 true 처리
    if (onlyNumber.length >= 6) {
      setIsPhoneVerified(true);
    } else {
      setIsPhoneVerified(false);
    }
  };

  const handleSignup = () => {
    if (!isFormValid) return;

    // TODO: 회원가입 API 연결
    navigate("/login");
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

        <h1 className="text-label2 text-neutral-900">회원가입</h1>

        <div className="size-6" />
      </header>

      <form className="mt-5 flex flex-col gap-4">
        <TextField
          label="아이디"
          required
          value={form.email}
          placeholder="로그인에 사용할 이메일을 입력해주세요"
          onChange={(value) => handleChange("email", value)}
        />

        <div>
          <TextField
            label="비밀번호"
            required
            type="password"
            value={form.password}
            placeholder="비밀번호를 입력해주세요"
            onChange={(value) => handleChange("password", value)}
          />

          {form.password && (
            <HelperText active={isPasswordValid}>
              영문/숫자/특수문자 포함 8~20자
            </HelperText>
          )}
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

          {form.passwordConfirm && (
            <HelperText active={isPasswordSame}>
              비밀번호가 일치합니다.
            </HelperText>
          )}
        </div>

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
              disabled={!form.phone}
              onClick={handleSendCode}
              className="h-[46px] w-[126px] shrink-0 rounded-lg text-body1"
            >
              {isCodeSent ? "인증번호 재전송" : "인증번호 받기"}
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
                  className="min-w-0 flex-1 bg-transparent text-body2 font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
                />

                <span className="text-body2 text-neutral-500">03:00</span>
              </div>

              {isPhoneVerified && (
                <HelperText active>인증이 완료되었습니다.</HelperText>
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
          disabled={!isFormValid}
          onClick={handleSignup}
          className="mt-2 h-[48px] w-full rounded-[10px] text-label1"
        >
          가입완료
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
  onChange: (value: string) => void;
};

const TextField = ({
  label,
  required = false,
  description,
  placeholder,
  value,
  type = "text",
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
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] w-full rounded-lg border border-neutral-400 bg-neutral-0 px-4 text-body2 font-medium text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500"
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