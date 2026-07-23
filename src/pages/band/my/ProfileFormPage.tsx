import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DefaultBandAvatar from "@/assets/icons/band/band-default-profile.svg";
import { Header } from "@/components/band/home/Header";
import { ImagePickerSheet } from "@/components/band/home/ImagePickerSheet";
import { Input, Textarea } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { useBandMembersStore } from "@/stores/useBandMembersStore";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";

const GENRE_OPTIONS = [
  "인디",
  "팝",
  "팝록",
  "재즈",
  "블루스",
  "얼터너티브록",
  "사이키델릭록",
  "일렉트로닉록",
  "포크록",
  "펑크록",
  "하드록",
  "메탈",
  "etc.",
];

const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "충남",
  "충북",
  "전남",
  "전북",
  "경남",
  "경북",
  "강원",
  "제주",
];

const PART_OPTIONS = ["보컬", "기타", "베이스", "드럼", "키보드"];

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

interface ProfileFormPageProps {
  mode: "create" | "edit";
}

const ProfileFormPage = ({ mode }: ProfileFormPageProps) => {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();
  const profile = useBandProfileStore((state) => state.profile);
  const setProfile = useBandProfileStore((state) => state.setProfile);
  const addBand = useBandProfileStore((state) => state.addBand);

  const members = useBandMembersStore((state) => state.members);
  const updateSelfMember = useBandMembersStore(
    (state) => state.updateSelfMember,
  );
  const selfMember = members.find((member) => member.isSelf);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(
    isEditMode ? profile.avatarUrl : "",
  );
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);

  const [name, setName] = useState(isEditMode ? profile.name : "");
  const [genre, setGenre] = useState(isEditMode ? profile.genre : "");
  const [region, setRegion] = useState(
    isEditMode ? (profile.regions[0] ?? "") : "",
  );
  const [bio, setBio] = useState(isEditMode ? profile.bio : "");

  const [myActivityName, setMyActivityName] = useState(selfMember?.name ?? "");
  const [myPart, setMyPart] = useState(
    selfMember?.roleLabel.split(" · ")[1] ?? "",
  );

  const isValid = Boolean(name.trim() && genre && region);

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleDeleteImage = () => {
    setIsImageMenuOpen(false);
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const handleSubmit = () => {
    if (!isValid) return;
    const profileData = { name, genre, regions: [region], bio, avatarUrl };

    if (isEditMode) {
      setProfile(profileData);
      if (myActivityName.trim() && myPart) {
        updateSelfMember({ name: myActivityName.trim(), part: myPart });
      }
    } else {
      addBand(profileData);
    }

    navigate("/band/home");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0">
      <Header title={isEditMode ? "밴드 프로필 관리" : "프로필 생성"} />

      {isEditMode ? (
        <div className="px-5 pt-4">
          <NotificationBandBanner
            bandName={`현재 선택된 밴드 · ${profile.name || "WAVY"}`}
            description="현재 선택된 밴드의 공개 프로필을 수정합니다"
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
            maxLength={60}
            className="h-15 w-full overflow-hidden rounded-[5px] pt-2.25 pr-6.5 pb-8.25 pl-4"
          />
        </div>
      </section>

      {isEditMode ? (
        <>
          <div className="my-4 h-4 bg-secondary-0" />

          <section className="flex flex-col gap-4 px-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-body6 text-neutral-900">내 프로필 수정</h2>
              <p className="text-caption2 text-neutral-600">
                이 밴드에서 표시되는 내 활동명과 파트를 수정합니다
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-body1 text-neutral-900">활동명</label>
              <Input
                value={myActivityName}
                onChange={(event) => setMyActivityName(event.target.value)}
                placeholder="활동명을 입력해주세요"
                className="w-full rounded-[5px] py-1.25 pl-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-body1 text-neutral-900">파트</label>
              <Select
                value={myPart}
                onChange={setMyPart}
                options={PART_OPTIONS}
                placeholder="파트를 선택해주세요"
              />
            </div>
          </section>
        </>
      ) : null}

      <div className="px-5 py-8">
        <button
          type="button"
          onClick={handleSubmit}
          className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-xl text-label1 ${
            isValid
              ? "bg-secondary-500 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          {isEditMode ? "밴드 프로필 저장" : "프로필 생성"}
        </button>
      </div>
    </main>
  );
};

export default ProfileFormPage;
