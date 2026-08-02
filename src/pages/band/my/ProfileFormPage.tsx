import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DefaultBandAvatar from "@/assets/icons/band/band-default-profile.svg";
import { Header } from "@/components/common/Header/Header";
import { ImagePickerSheet } from "@/components/band/home/ImagePickerSheet";
import { Input, Textarea } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import {
  useBandQuery,
  useCreateBand,
  useUpdateBand,
} from "@/hooks/api/band/useBand";
import {
  useActiveBandMemberProfileQuery,
  useCreateBandMemberProfile,
  useUpdateBandMemberProfile,
} from "@/hooks/api/band/useBandMemberProfile";
import { uploadMediaFile } from "@/utils/uploadMediaFile";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type {
  BandMemberProfilePart,
  BandMemberProfileResponse,
} from "@/types/band/bandMemberProfile";
import {
  BAND_GENRE_BY_LABEL,
  BAND_GENRE_LABELS,
  BAND_GENRE_LABEL_OPTIONS,
  BAND_REGION_BY_LABEL,
  BAND_REGION_LABELS,
  BAND_REGION_LABEL_OPTIONS,
  getPartLabel,
} from "@/utils/bandLabels";

const GENRE_OPTIONS = BAND_GENRE_LABEL_OPTIONS;
const REGION_OPTIONS = BAND_REGION_LABEL_OPTIONS;

const PART_OPTIONS = ["보컬", "기타", "베이스", "드럼", "키보드"];

const PART_LABEL_TO_ENUM: Record<string, BandMemberProfilePart> = {
  보컬: "VOCAL",
  기타: "GUITAR",
  베이스: "BASS",
  드럼: "DRUM",
  키보드: "KEYBOARD",
};

interface ChipGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const ChipGroup = ({ options, value, onChange }: ChipGroupProps) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const isSelected = value === option;
      return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3.75 py-1 text-caption3 whitespace-nowrap ${
            isSelected
              ? "bg-secondary-500 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

interface ProfileFormValues {
  name: string;
  genre: string;
  region: string;
  bio: string;
  avatarUrl: string;
  myActivityName: string;
  myPart: string;
}

const EMPTY_FORM_VALUES: ProfileFormValues = {
  name: "",
  genre: "",
  region: "",
  bio: "",
  avatarUrl: "",
  myActivityName: "",
  myPart: "",
};

interface ProfileFormPageProps {
  mode: "create" | "edit";
}

const ProfileFormPage = ({ mode }: ProfileFormPageProps) => {
  if (mode === "create") {
    return <ProfileForm mode="create" initialValues={EMPTY_FORM_VALUES} />;
  }

  return <ProfileEditLoader />;
};

const ProfileEditLoader = () => {
  const activeBandId = useActiveBandId();
  const bandId = activeBandId ?? NaN;

  const bandQuery = useBandQuery(bandId);
  const memberProfileQuery = useActiveBandMemberProfileQuery();

  if (bandQuery.isError || memberProfileQuery.isError) {
    return (
      <main className="relative min-h-dvh bg-neutral-0 pb-24">
        <Header title="밴드 프로필 관리" />
        <div className="flex flex-col items-center gap-3 px-6 pt-24 text-center">
          <p className="text-caption1 text-neutral-500">
            {getApiErrorMessage(
              bandQuery.error ?? memberProfileQuery.error,
              "프로필 정보를 불러오지 못했어요",
            )}
          </p>
        </div>
      </main>
    );
  }

  if (!bandQuery.data || !memberProfileQuery.data) {
    return (
      <main className="relative min-h-dvh bg-neutral-0 pb-24">
        <Header title="밴드 프로필 관리" />
      </main>
    );
  }

  const band = bandQuery.data;
  const memberProfile = memberProfileQuery.data;

  return (
    <ProfileForm
      mode="edit"
      bandId={bandId}
      memberProfileId={memberProfile.id}
      initialValues={{
        name: band.name,
        genre: BAND_GENRE_LABELS[band.genre] ?? band.genre,
        region: BAND_REGION_LABELS[band.region] ?? band.region,
        bio: band.description ?? "",
        avatarUrl: band.profileImageUrl ?? "",
        myActivityName: memberProfile.nickname,
        myPart: getPartLabel(memberProfile.part),
      }}
    />
  );
};

interface ProfileFormProps {
  mode: "create" | "edit";
  bandId?: number;
  memberProfileId?: number;
  initialValues: ProfileFormValues;
}

const ProfileForm = ({
  mode,
  bandId,
  memberProfileId,
  initialValues,
}: ProfileFormProps) => {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();

  const createBandMemberProfile = useCreateBandMemberProfile();
  const createBand = useCreateBand();
  const updateBand = useUpdateBand(bandId ?? NaN);
  const updateBandMemberProfile = useUpdateBandMemberProfile(
    memberProfileId ?? NaN,
  );

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const ownerProfileRef = useRef<{
    nickname: string;
    part: BandMemberProfilePart;
    profile: BandMemberProfileResponse;
  } | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [name, setName] = useState(initialValues.name);
  const [genre, setGenre] = useState(initialValues.genre);
  const [region, setRegion] = useState(initialValues.region);
  const [bio, setBio] = useState(initialValues.bio);

  const [myActivityName, setMyActivityName] = useState(
    initialValues.myActivityName,
  );
  const [myPart, setMyPart] = useState(initialValues.myPart);

  const isValid = isEditMode
    ? Boolean(name.trim() && genre && region)
    : Boolean(
        name.trim() && genre && region && myActivityName.trim() && myPart,
      );

  const isSubmitting =
    createBandMemberProfile.isPending ||
    createBand.isPending ||
    updateBand.isPending ||
    updateBandMemberProfile.isPending ||
    isUploading;

  const submitError = isEditMode
    ? (updateBand.error ?? updateBandMemberProfile.error)
    : (createBandMemberProfile.error ?? createBand.error);

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

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
        uploadedAvatarUrl = await uploadMediaFile(avatarFile, "BAND_PROFILE");
      } catch {
        setIsUploading(false);
        setUploadError("이미지 업로드에 실패했어요. 다시 시도해주세요");
        return;
      }
      setIsUploading(false);
    }

    if (isEditMode) {
      if (!bandId) return;

      const genreValue = BAND_GENRE_BY_LABEL[genre];
      const regionValue = BAND_REGION_BY_LABEL[region];

      if (!genreValue || !regionValue) {
        setUploadError("장르 또는 지역을 다시 선택해주세요");
        return;
      }

      try {
        await updateBand.mutateAsync({
          name,
          genre: genreValue,
          region: regionValue,
          description: bio || undefined,
          ...(isAvatarRemoved
            ? { deleteProfileImage: true }
            : uploadedAvatarUrl
              ? { profileImageUrl: uploadedAvatarUrl }
              : {}),
        });

        if (memberProfileId && myActivityName.trim() && myPart) {
          const partEnum = PART_LABEL_TO_ENUM[myPart];

          await updateBandMemberProfile.mutateAsync({
            nickname: myActivityName.trim(),
            ...(partEnum ? { part: partEnum } : {}),
          });
        }

        navigate("/band/home");
      } catch {
        // 에러는 submitError로 화면에 표시됨
      }

      return;
    }

    const genreValue = BAND_GENRE_BY_LABEL[genre];
    const regionValue = BAND_REGION_BY_LABEL[region];

    if (!genreValue || !regionValue) {
      setUploadError("장르 또는 지역을 다시 선택해주세요");
      return;
    }

    try {
      const nickname = myActivityName.trim();
      const part = PART_LABEL_TO_ENUM[myPart];

      const cached = ownerProfileRef.current;
      const ownerProfile =
        cached && cached.nickname === nickname && cached.part === part
          ? cached.profile
          : await createBandMemberProfile.mutateAsync({ nickname, part });

      ownerProfileRef.current = { nickname, part, profile: ownerProfile };

      await createBand.mutateAsync({
        name,
        genre: genreValue,
        region: regionValue,
        bandMemberProfileId: ownerProfile.id,
        profileImageUrl: uploadedAvatarUrl || undefined,
        description: bio || undefined,
      });

      ownerProfileRef.current = null;
      navigate("/band/home");
    } catch {
      // 에러는 submitError로 화면에 표시됨
    }
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title={isEditMode ? "밴드 프로필 관리" : "프로필 생성"} />

      {isEditMode ? (
        <div className="px-5 pt-4">
          <NotificationBandBanner
            bandName={`현재 선택된 밴드 · ${name || "밴드"}`}
            description="현재 선택된 밴드의 공개 프로필을 수정합니다"
            profileImageUrl={avatarUrl}
          />
        </div>
      ) : null}

      <section className="flex flex-col gap-6 px-5 pt-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatarUrl || DefaultBandAvatar}
              alt={name}
              className="size-18 rounded-full object-cover"
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
            className="text-caption2 text-secondary-500"
          >
            {isEditMode ? "프로필 이미지 변경" : "프로필 이미지 등록"}
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
          <label className="text-body1 text-neutral-900">
            밴드명 <span className="text-body1 text-error">*</span>
          </label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="밴드 이름을 입력해주세요"
            className="w-full rounded-[5px] py-1.25 pl-4"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-body1 text-neutral-900">관심 장르</label>
          <ChipGroup
            options={GENRE_OPTIONS}
            value={genre}
            onChange={setGenre}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-body1 text-neutral-900">활동 지역</label>
          <ChipGroup
            options={REGION_OPTIONS}
            value={region}
            onChange={setRegion}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-body1 text-neutral-900">밴드 소개</label>
          <Textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="밴드 소개글을 입력해주세요"
            maxLength={1000}
            className="h-15 w-full overflow-hidden rounded-[5px] pt-2.25 pr-6.5 pb-8.25 pl-4"
          />
        </div>
      </section>

      <div className="my-4 h-4 bg-secondary-0" />

      <section className="flex flex-col gap-4 px-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-body6 text-neutral-900">
            {isEditMode ? "내 프로필 수정" : "내 프로필"}
          </h2>
          <p className="text-caption2 text-neutral-600">
            {isEditMode
              ? "이 밴드에서 표시되는 내 활동명과 파트를 수정합니다"
              : "이 밴드에서 표시될 내 활동명과 파트를 입력해주세요"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-body1 text-neutral-900">
            활동명 <span className="text-body1 text-error">*</span>
          </label>
          <Input
            value={myActivityName}
            onChange={(event) => setMyActivityName(event.target.value)}
            placeholder="활동명을 입력해주세요"
            className="w-full rounded-[5px] py-1.25 pl-4"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-body1 text-neutral-900">
            파트 <span className="text-body1 text-error">*</span>
          </label>
          <Select
            value={myPart}
            onChange={setMyPart}
            options={PART_OPTIONS}
            placeholder="파트를 선택해주세요"
          />
        </div>
      </section>

      <div className="flex flex-col gap-2 px-5 py-8">
        {uploadError ? (
          <span className="text-center text-body5 text-error">
            {uploadError}
          </span>
        ) : submitError ? (
          <span className="text-center text-body5 text-error">
            {getApiErrorMessage(
              submitError,
              "저장에 실패했어요. 다시 시도해주세요",
            )}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-xl text-label1 ${
            isValid && !isSubmitting
              ? "bg-secondary-500 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          {isUploading
            ? "업로드 중..."
            : isEditMode
              ? "밴드 프로필 저장"
              : "프로필 생성"}
        </button>
      </div>
    </main>
  );
};

export default ProfileFormPage;
