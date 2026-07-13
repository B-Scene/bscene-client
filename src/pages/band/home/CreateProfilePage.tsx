import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DefaultBandAvatar from "@/assets/icons/band/band-default-profile.svg";
import { Header } from "@/components/band/home/Header";
import { ImagePickerSheet } from "@/components/band/home/ImagePickerSheet";
import { Input, Textarea } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { useBandProfileStore } from "@/stores/useBandProfileStore";

const GENRE_OPTIONS = [
  "록",
  "인디팝",
  "펑크",
  "메탈",
  "재즈",
  "블루스",
  "R&B",
  "어쿠스틱",
  "포크",
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
  "충청",
  "전라",
  "경상",
  "강원",
  "제주",
];

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const setProfile = useBandProfileStore((state) => state.setProfile);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");

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

  const handleCreate = () => {
    if (!isValid) return;
    setProfile({ name, genre, regions: [region], bio, avatarUrl });
    navigate("/band/home");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-40">
      <Header title="프로필 생성" />

      <section className="flex flex-col gap-6 px-5 pt-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatarUrl || DefaultBandAvatar}
              alt=""
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
            프로필 이미지 등록
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

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">
              밴드명 <span className="text-body1 text-error">*</span>
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="밴드 이름을 입력하세요"
              className="pl-4 py-1.25 w-82.5 max-w-full rounded-[5px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">
              장르 <span className="text-body1 text-error">*</span>
            </label>
            <Select
              value={genre}
              onChange={setGenre}
              options={GENRE_OPTIONS}
              placeholder="장르 선택"
              className="w-82.5 max-w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">
              활동 지역 <span className="text-body1 text-error">*</span>
            </label>
            <Select
              value={region}
              onChange={setRegion}
              options={REGION_OPTIONS}
              placeholder="지역 선택"
              className="w-82.5 max-w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">밴드 소개</label>
            <Textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="밴드 소개글을입력하세요"
              maxLength={60}
              className="h-15 w-82.5 max-w-full overflow-hidden rounded-[5px] pt-2.25 pr-6.5 pb-8.25 pl-4"
            />
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] px-5">
        <button
          type="button"
          onClick={handleCreate}
          className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-xl text-label1 ${
            isValid
              ? "bg-secondary-500 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          프로필 생성
        </button>
      </div>
    </main>
  );
};

export default CreateProfilePage;
