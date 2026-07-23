import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DefaultAvatarIcon from "@/assets/icons/profile.svg";
import { Header } from "@/components/band/home/Header";
import { ImagePickerSheet } from "@/components/band/home/ImagePickerSheet";
import { Input } from "@/components/common/Input/Input";

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

interface ChipMultiGroupProps {
  options: string[];
  selected: string[];
  max: number;
  onToggle: (option: string) => void;
}

const ChipMultiGroup = ({
  options,
  selected,
  max,
  onToggle,
}: ChipMultiGroupProps) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const isSelected = selected.includes(option);

      return (
        <button
          key={option}
          type="button"
          onClick={() => {
            if (!isSelected && selected.length >= max) return;
            onToggle(option);
          }}
          className={`rounded-full px-3.75 py-1 text-caption3 whitespace-nowrap ${
            isSelected
              ? "bg-primary-400 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [nickname, setNickname] = useState("최유주");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([
    "인디",
    "팝",
    "재즈",
  ]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    "서울",
    "경기",
  ]);

  const isValid = Boolean(nickname.trim());

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((item) => item !== genre)
        : [...prev, genre],
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((item) => item !== region)
        : [...prev, region],
    );
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsImageMenuOpen(false);
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
    navigate(-1);
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
            className="w-full rounded-[5px] py-1.25 pl-4"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-body1 text-neutral-900">
            관심 장르 (최대 3개)
          </label>
          <ChipMultiGroup
            options={GENRE_OPTIONS}
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
            options={REGION_OPTIONS}
            selected={selectedRegions}
            max={2}
            onToggle={toggleRegion}
          />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-9 px-5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-xl text-label1 ${
            isValid
              ? "bg-primary-400 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          프로필 저장
        </button>
      </div>
    </main>
  );
};

export default ProfileEditPage;
