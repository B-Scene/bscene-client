import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DefaultAvatarIcon from "@/assets/icons/profile.svg";
import { Header } from "@/components/band/home/Header";
import { ImagePickerSheet } from "@/components/band/home/ImagePickerSheet";
import { Input } from "@/components/common/Input/Input";
import {
  useFanInformationQuery,
  useUpdateFanInformation,
} from "@/hooks/api/user/useFanInformation";
import { useGenres, useRegions } from "@/hooks/api/onboarding/useOnboarding";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { getRenderableProfileImageUrl } from "@/utils/profileImageUrl";
import { uploadMediaFile } from "@/utils/uploadMediaFile";
import type { FanInformationResponse } from "@/types/user/fanInformation";
import type { CodeName } from "@/types/onboarding/onboarding";

interface ChipMultiGroupProps {
  options: CodeName[];
  selected: string[];
  max: number;
  onToggle: (code: string) => void;
}

const ChipMultiGroup = ({
  options,
  selected,
  max,
  onToggle,
}: ChipMultiGroupProps) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const isSelected = selected.includes(option.code);

      return (
        <button
          key={option.code}
          type="button"
          onClick={() => {
            if (!isSelected && selected.length >= max) return;
            onToggle(option.code);
          }}
          className={`rounded-full px-3.75 py-1 text-caption3 whitespace-nowrap ${
            isSelected
              ? "bg-primary-400 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          {option.name}
        </button>
      );
    })}
  </div>
);

const ProfileEditForm = ({
  initialData,
}: {
  initialData: FanInformationResponse;
}) => {
  const navigate = useNavigate();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { data: genres = [] } = useGenres();
  const { data: regions = [] } = useRegions();
  const updateFanInformation = useUpdateFanInformation();

  const [avatarUrl, setAvatarUrl] = useState(
    getRenderableProfileImageUrl(initialData.profileImageUrl) ?? "",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [nickname, setNickname] = useState(initialData.nickname);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialData.genres,
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    initialData.regions,
  );

  const isValid = Boolean(
    nickname.trim() && selectedGenres.length > 0 && selectedRegions.length > 0,
  );

  const toggleGenre = (code: string) => {
    setSelectedGenres((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code],
    );
  };

  const toggleRegion = (code: string) => {
    setSelectedRegions((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code],
    );
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsImageMenuOpen(false);
    setAvatarFile(file);
    setIsAvatarRemoved(false);
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleDeleteImage = () => {
    setIsImageMenuOpen(false);
    setAvatarFile(null);
    setIsAvatarRemoved(true);
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setUploadError(null);
    let uploadedAvatarUrl = avatarUrl;

    if (avatarFile) {
      try {
        setIsUploading(true);
        uploadedAvatarUrl = await uploadMediaFile(avatarFile, "USER_PROFILE");
      } catch {
        setIsUploading(false);
        setUploadError("이미지 업로드에 실패했어요. 다시 시도해주세요");
        return;
      }
      setIsUploading(false);
    }

    try {
      await updateFanInformation.mutateAsync({
        nickname: nickname.trim(),
        genres: selectedGenres,
        regions: selectedRegions,
        profileImageUrl: isAvatarRemoved ? null : uploadedAvatarUrl || undefined,
      });
      navigate(-1);
    } catch {
      // 에러는 submitError로 화면에 표시됨
    }
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="내 정보 수정" />

      <section className="flex flex-col gap-6 px-5 pt-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatarUrl || DefaultAvatarIcon}
              alt=""
              className="size-22 rounded-full bg-neutral-300 object-cover"
            />

            <ImagePickerSheet
              open={isImageMenuOpen}
              onClose={() => setIsImageMenuOpen(false)}
              onSelectGallery={() => {
                setIsImageMenuOpen(false);
                galleryInputRef.current?.click();
              }}
              onSelectCamera={() => {
                setIsImageMenuOpen(false);
                cameraInputRef.current?.click();
              }}
              onDelete={handleDeleteImage}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsImageMenuOpen((prev) => !prev)}
            className="text-caption2 text-primary-400"
          >
            프로필 이미지 변경
          </button>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-body1 text-neutral-900">닉네임</label>
          <Input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="닉네임을 입력해주세요"
            maxLength={8}
            className="w-full rounded-[5px] py-1.25 pl-4"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-body1 text-neutral-900">
            관심 장르 (최대 3개)
          </label>
          <ChipMultiGroup
            options={genres}
            selected={selectedGenres}
            max={3}
            onToggle={toggleGenre}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-body1 text-neutral-900">
            활동 지역 (최대 2개)
          </label>
          <ChipMultiGroup
            options={regions}
            selected={selectedRegions}
            max={2}
            onToggle={toggleRegion}
          />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-9 flex flex-col gap-2 px-5">
        {uploadError ? (
          <span className="text-center text-body5 text-error">
            {uploadError}
          </span>
        ) : updateFanInformation.error ? (
          <span className="text-center text-body5 text-error">
            {getApiErrorMessage(
              updateFanInformation.error,
              "저장에 실패했어요. 다시 시도해주세요",
            )}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isUploading || updateFanInformation.isPending}
          className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-xl text-label1 ${
            isValid && !isUploading && !updateFanInformation.isPending
              ? "bg-primary-400 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          {isUploading
            ? "업로드 중..."
            : updateFanInformation.isPending
              ? "저장 중..."
              : "프로필 저장"}
        </button>
      </div>
    </main>
  );
};

const ProfileEditPage = () => {
  const { data, isError, error, refetch } = useFanInformationQuery();

  if (isError) {
    return (
      <main className="relative min-h-dvh bg-neutral-0 pb-24">
        <Header title="내 정보 수정" />
        <div className="flex flex-col items-center gap-3 px-6 pt-24 text-center">
          <p className="text-caption1 text-neutral-500">
            {getApiErrorMessage(error, "내 정보를 불러오지 못했어요")}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-primary-400 px-4 py-2 text-caption2 text-neutral-0"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="relative min-h-dvh bg-neutral-0 pb-24">
        <Header title="내 정보 수정" />
      </main>
    );
  }

  return <ProfileEditForm initialData={data} />;
};

export default ProfileEditPage;
