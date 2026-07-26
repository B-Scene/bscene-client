import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import type { AxiosError } from "axios";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import {
  useSessionProfileQuery,
  useUpdateSessionProfile,
} from "@/hooks/api/session/useSessionProfile";
import type {
  SessionApiResponse,
  SessionProfileGender,
  SessionProfileResponse,
} from "@/types/session/sessionProfile";

interface SessionBasicProfileEditScreenProps {
  onBack: () => void;
}

interface BasicProfileValues {
  name: string;
  phone: string;
  email: string;
  gender: SessionProfileGender;
  birthDate: string;
  profileImageUrl: string | null;
}

const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const SessionBasicProfileEditScreen = ({
  onBack,
}: SessionBasicProfileEditScreenProps) => {
  const profileQuery = useSessionProfileQuery();

  if (profileQuery.isLoading) {
    return (
      <main className="min-h-dvh bg-neutral-0">
        <EditTopBar onBack={onBack} />
        <section className="flex min-h-[360px] items-center justify-center text-caption1 text-neutral-500">
          기본 정보를 불러오고 있어요
        </section>
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className="min-h-dvh bg-neutral-0">
        <EditTopBar onBack={onBack} />
        <section className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
          <p className="text-caption1 text-neutral-500">
            기본 정보를 불러오지 못했어요
          </p>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      </main>
    );
  }

  if (!profileQuery.data) return null;

  return (
    <SessionBasicProfileEditForm
      key={profileQuery.data.userId}
      profile={profileQuery.data}
      onBack={onBack}
    />
  );
};

interface SessionBasicProfileEditFormProps {
  profile: SessionProfileResponse;
  onBack: () => void;
}

const SessionBasicProfileEditForm = ({
  profile,
  onBack,
}: SessionBasicProfileEditFormProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateProfileMutation = useUpdateSessionProfile();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [values, setValues] = useState<BasicProfileValues>({
    name: profile.name,
    phone: profile.phone,
    email: profile.email ?? "",
    gender: profile.gender,
    birthDate: profile.birthDate,
    profileImageUrl: profile.profileImageUrl,
  });

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    setSaveErrorMessage(
      "이미지 저장은 Presigned URL 업로드 API 연결 후 반영돼요. 현재는 미리보기만 가능합니다.",
    );
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((currentValues) => ({
      ...currentValues,
      email: event.target.value,
    }));
    setSaveErrorMessage("");
  };

  const handleGenderChange = (gender: SessionProfileGender) => {
    setValues((currentValues) => ({
      ...currentValues,
      gender,
    }));
    setSaveErrorMessage("");
  };

  const handleSave = async () => {
    setSaveErrorMessage("");

    try {
      await updateProfileMutation.mutateAsync({
        email: values.email.trim() || undefined,
        gender: values.gender,
        profileImageUrl: values.profileImageUrl ?? undefined,
      });

      onBack();
    } catch (error) {
      const apiMessage = (error as AxiosError<SessionApiResponse<null>>).response?.data
        ?.message;

      setSaveErrorMessage(
        apiMessage ?? "기본 정보 수정에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
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
          <img
            src={previewImage || values.profileImageUrl || UserDefaultProfileIcon}
            alt=""
            className="size-full object-cover"
          />
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
                selected={values.gender === "MALE"}
                onClick={() => handleGenderChange("MALE")}
              />
              <GenderButton
                label="여성"
                selected={values.gender === "FEMALE"}
                onClick={() => handleGenderChange("FEMALE")}
              />
            </div>
          </ProfileField>

          <ProfileField label="생년월일">
            <ProfileInput value={values.birthDate} readOnly muted />
          </ProfileField>
        </div>

        {saveErrorMessage ? (
          <p className="mt-5 text-center text-caption2 text-error">{saveErrorMessage}</p>
        ) : null}
      </section>

      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-20 bg-neutral-0 px-5 pt-4 pb-5">
        <button
          type="button"
          disabled={updateProfileMutation.isPending}
          onClick={handleSave}
          className="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-secondary-500 text-label2 text-neutral-0 disabled:bg-neutral-300 disabled:text-neutral-700"
        >
          {updateProfileMutation.isPending ? "저장 중" : "프로필 저장"}
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
        className="absolute top-[5px] left-[15px] flex size-[38px] items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>
      <h1 className="text-body1 text-neutral-900">기본 정보 수정</h1>
    </header>
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
  label: "남성" | "여성";
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
