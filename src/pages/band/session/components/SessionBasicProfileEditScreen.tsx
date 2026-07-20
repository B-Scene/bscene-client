import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";

interface SessionBasicProfileEditScreenProps {
  onBack: () => void;
}

type Gender = "남성" | "여성";

interface BasicProfileValues {
  name: string;
  phone: string;
  email: string;
  gender: Gender;
  birthDate: string;
}

const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const SessionBasicProfileEditScreen = ({
  onBack,
}: SessionBasicProfileEditScreenProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [values, setValues] = useState<BasicProfileValues>({
    name: "정하람",
    phone: "01012345678",
    email: "haramdrums@example.com",
    gender: "남성",
    birthDate: "1998.06.06.",
  });

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileImage(URL.createObjectURL(file));
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((currentValues) => ({
      ...currentValues,
      email: event.target.value,
    }));
  };

  const handleGenderChange = (gender: Gender) => {
    setValues((currentValues) => ({
      ...currentValues,
      gender,
    }));
  };

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+92px)]">
      <EditTopBar onBack={onBack} />

      <section className="flex flex-col items-center bg-neutral-0 pt-[34px]">
        <button
          type="button"
          aria-label="프로필 이미지 변경"
          onClick={() => fileInputRef.current?.click()}
          className="flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-neutral-600"
        >
          {profileImage ? (
            <img src={profileImage} alt="" className="size-full object-cover" />
          ) : (
            <ProfilePlaceholderIcon />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfileImageChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 flex h-5 w-[100px] items-center justify-center text-caption3 text-secondary-500"
        >
          프로필 이미지 변경
        </button>
      </section>

      <section className="mx-auto w-[330px] pt-[56px]">
        <div className="flex flex-col gap-5">
          <ProfileField label="이름">
            <ProfileInput value={values.name} readOnly muted />
          </ProfileField>

          <ProfileField label="연락처" helperText="전화번호는 안심번호로 표시돼요">
            <ProfileInput value={values.phone} readOnly muted />
          </ProfileField>

          <ProfileField label="이메일 (선택)">
            <ProfileInput
              value={values.email}
              onChange={handleEmailChange}
              placeholder="이메일을 입력해주세요"
            />
          </ProfileField>

          <ProfileField label="성별">
            <div className="grid grid-cols-2 gap-6">
              <GenderButton
                label="남성"
                selected={values.gender === "남성"}
                onClick={() => handleGenderChange("남성")}
              />
              <GenderButton
                label="여성"
                selected={values.gender === "여성"}
                onClick={() => handleGenderChange("여성")}
              />
            </div>
          </ProfileField>

          <ProfileField label="생년월일">
            <ProfileInput value={values.birthDate} readOnly muted />
          </ProfileField>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-20 bg-neutral-0 px-5 pt-4 pb-5">
        <button
          type="button"
          className="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-secondary-500 text-label2 text-neutral-0"
        >
          프로필 저장
        </button>
      </div>
    </main>
  );
};

interface EditTopBarProps {
  onBack: () => void;
}

const EditTopBar = ({ onBack }: EditTopBarProps) => {
  return (
    <header className="relative flex h-12 w-full items-center justify-center bg-neutral-0 px-[15px] py-[5px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute left-[15px] top-[5px] flex size-[38px] items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>
      <h1 className="text-body1 text-neutral-900">기본 정보 수정</h1>
    </header>
  );
};

const ProfilePlaceholderIcon = () => {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="21" cy="14" r="8" stroke="white" strokeWidth="3" />
      <path
        d="M6.5 36.5C8.7 28.6 14 25 21 25C28 25 33.3 28.6 35.5 36.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

interface ProfileFieldProps {
  label: string;
  helperText?: string;
  children: ReactNode;
}

const ProfileField = ({ label, helperText, children }: ProfileFieldProps) => {
  return (
    <div>
      <label className="block text-body1 text-neutral-900">{label}</label>
      {helperText ? (
        <p className="mt-1 text-caption2 text-neutral-500">{helperText}</p>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
};

interface ProfileInputProps {
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  muted?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const ProfileInput = ({
  value,
  placeholder,
  readOnly = false,
  muted = false,
  onChange,
}: ProfileInputProps) => {
  return (
    <input
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      aria-readonly={readOnly}
      onChange={onChange}
      className={cx(
        "h-[34px] w-full rounded-[5px] border border-neutral-400 px-4 text-body1 outline-none placeholder:text-caption2 placeholder:text-neutral-500 focus:border-secondary-500",
        muted ? "bg-neutral-300 text-neutral-500" : "bg-neutral-0 text-neutral-900",
      )}
    />
  );
};

interface GenderButtonProps {
  label: Gender;
  selected: boolean;
  onClick: () => void;
}

const GenderButton = ({ label, selected, onClick }: GenderButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-[34px] items-center justify-center rounded-[5px] border text-body1",
        selected
          ? "border-secondary-500 bg-secondary-500 text-neutral-0"
          : "border-neutral-400 bg-neutral-0 text-neutral-400",
      )}
    >
      {label}
    </button>
  );
};
