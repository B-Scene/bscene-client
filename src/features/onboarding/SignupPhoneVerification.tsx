import CheckIcon from "@/assets/icons/check.svg";
import Button from "@/components/common/Button/Button";
import { formatTime } from "@/utils/formatTime";
import { FieldLabel } from "./SignupField";

type SignupPhoneVerificationProps = {
  phone: string;
  code: string;
  isCodeSent: boolean;
  isPhoneVerified: boolean;
  isSendingCode: boolean;
  isVerifyingPhone: boolean;
  timeLeft: number;
  onPhoneChange: (value: string) => void;
  onSendCode: () => void;
  onCodeChange: (value: string) => void;
};

export default function SignupPhoneVerification({
  phone,
  code,
  isCodeSent,
  isPhoneVerified,
  isSendingCode,
  isVerifyingPhone,
  timeLeft,
  onPhoneChange,
  onSendCode,
  onCodeChange,
}: SignupPhoneVerificationProps) {
  return (
    <div>
      <FieldLabel required>휴대폰</FieldLabel>

      <div className="flex gap-2">
        <input
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="숫자만 입력해주세요"
          inputMode="numeric"
          className="h-[46px] min-w-0 flex-1 rounded-lg border border-neutral-400 bg-neutral-0 px-4 text-body2 font-medium text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500"
        />

        <Button
          type="button"
          size="medium"
          tone={phone ? "pink" : "gray"}
          disabled={!phone || isSendingCode}
          onClick={onSendCode}
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
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
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
            <p className="mt-1 flex items-center gap-1 text-body5 text-primary-400">
              <img src={CheckIcon} alt="" className="h-[6px] w-[9px]" />
              인증이 완료되었습니다.
            </p>
          )}

          {!isPhoneVerified && timeLeft <= 0 && (
            <p className="mt-1 text-body5 text-error">
              인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.
            </p>
          )}
        </>
      )}
    </div>
  );
}