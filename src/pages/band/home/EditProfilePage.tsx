import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultAvatar from "@/assets/images/IMG_my.svg";
import { Header } from "@/components/band/home/Header";
import { Input, Textarea } from "@/components/common/Input/Input";
import { useBandProfileStore } from "@/stores/useBandProfileStore";

const REGION_OPTIONS = ["서울", "경기", "인천", "기타"];

const EditProfilePage = () => {
  const navigate = useNavigate();
  const profile = useBandProfileStore((state) => state.profile);
  const setProfile = useBandProfileStore((state) => state.setProfile);

  const [name, setName] = useState(profile.name);
  const [genre] = useState(profile.genre);
  const [region, setRegion] = useState(profile.regions[0] ?? "");
  const [bio, setBio] = useState(profile.bio);

  const handleSave = () => {
    setProfile({ name, genre, regions: [region], bio });
    navigate("/band/home");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="프로필 편집" />

      <section className="flex flex-col gap-8 px-5 pt-5.5">
        <div className="flex flex-col items-center gap-3">
          <img
            src={profile.avatarUrl || DefaultAvatar}
            alt={profile.name}
            className="size-18 rounded-full object-cover"
          />
          <button type="button" className="text-caption2 text-secondary-500">
            프로필 이미지 변경
          </button>
        </div>

        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">
              밴드명 <span className="text-body1 text-error">*</span>
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="밴드 이름을 입력해주세요"
              className="pl-4 py-1.25 w-82.5 max-w-full rounded-[5px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">
              장르 <span className="text-body1 text-error">*</span>
            </label>
            <div className="flex w-82.5 max-w-full items-center rounded-[5px] border border-neutral-400 bg-neutral-0 px-4 py-1.25 text-caption2 text-neutral-900">
              {genre}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">
              활동 지역 <span className="text-body1 text-error">*</span>
            </label>
            <div className="flex gap-2">
              {REGION_OPTIONS.map((option) => {
                const isSelected = region === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRegion(option)}
                    className={`flex h-6.5 w-14 items-center justify-center gap-2.5 rounded-full px-3.75 py-1.75 text-caption3 ${
                      isSelected
                        ? "bg-secondary-100 text-secondary-500"
                        : "bg-neutral-300 text-neutral-600"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-body1 text-neutral-900">밴드 소개</label>
            <Textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="밴드 소개글을 입력해주세요"
              maxLength={60}
              className="h-15 w-82.5 max-w-full overflow-hidden rounded-[5px] pt-2.25 pr-6.5 pb-8.25 pl-4"
            />
          </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/band/profile/invite")}
              className="flex h-13 w-82.5 max-w-full items-center justify-center rounded-xl border-[1.5px] border-secondary-500 bg-neutral-0 text-label1 text-secondary-500"
            >
              멤버 초대하기
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex h-13 w-82.5 max-w-full items-center justify-center gap-2.5 rounded-xl bg-secondary-500 text-label1 text-white"
            >
              저장하기
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EditProfilePage;
