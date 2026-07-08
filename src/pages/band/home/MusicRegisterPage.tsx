import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { Input } from "@/components/common/Input/Input";
import TrashIcon from "@/assets/icons/delete.svg";

const STORE_PLATFORMS = ["Melon", "genie", "Bugs", "Apple Music"];

interface FieldProps {
  label: string;
  children: ReactNode;
}

const Field = ({ label, children }: FieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-body1 text-neutral-900">{label}</label>
    {children}
  </div>
);

const MusicRegisterPage = () => {
  const navigate = useNavigate();

  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [otherUrl, setOtherUrl] = useState("");

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [platformLinks, setPlatformLinks] = useState<string[]>([""]);

  const isValid = Boolean(
    spotifyUrl.trim() ||
    youtubeUrl.trim() ||
    soundcloudUrl.trim() ||
    otherUrl.trim() ||
    (selectedPlatform && platformLinks.some((link) => link.trim())),
  );

  const handleSelectPlatform = (platform: string) => {
    setSelectedPlatform((prev) => (prev === platform ? null : platform));
  };

  const handlePlatformLinkChange = (index: number, value: string) => {
    setPlatformLinks((prev) =>
      prev.map((link, linkIndex) => (linkIndex === index ? value : link)),
    );
  };

  const handleRemovePlatformLink = (index: number) => {
    setPlatformLinks((prev) =>
      prev.filter((_, linkIndex) => linkIndex !== index),
    );
  };

  const handleAddPlatformLink = () => {
    setPlatformLinks((prev) => [...prev, ""]);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    navigate("/band/home");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-40">
      <Header title="음원 등록" />

      <section className="flex flex-col gap-6 px-5 pt-6">
        <p className="text-caption3 text-neutral-600">
          팬들이 음악을 들을 수 있도록 음원 플랫폼 링크를 등록해 주세요
        </p>

        <div className="flex flex-col gap-4">
          <Field label="Spotify URL">
            <Input
              value={spotifyUrl}
              onChange={(event) => setSpotifyUrl(event.target.value)}
              placeholder="open.spotify.com/artist/..."
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>

          <Field label="YouTube URL">
            <Input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="youtube.com/@..."
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>

          <Field label="SoundCloud URL">
            <Input
              value={soundcloudUrl}
              onChange={(event) => setSoundcloudUrl(event.target.value)}
              placeholder="soundcloud.com/..."
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>

          <Field label="Melon / genie / Bugs / Apple Music URL">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-2">
                {STORE_PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handleSelectPlatform(platform)}
                    className={`flex h-6.5 shrink-0 items-center justify-center gap-2.5 rounded-lg px-3.75 py-1.75 text-center text-caption3 ${
                      selectedPlatform === platform
                        ? "bg-secondary-500 text-neutral-0"
                        : "bg-neutral-300 text-neutral-600"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              {selectedPlatform ? (
                <div className="flex flex-col gap-2.5">
                  {platformLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={link}
                        onChange={(event) =>
                          handlePlatformLinkChange(index, event.target.value)
                        }
                        placeholder="예매 링크 또는 관련 게시글 링크를 첨부해주세요"
                        className="w-full rounded-[5px] px-4 py-1.25"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePlatformLink(index)}
                        aria-label="링크 삭제"
                        className="flex size-6 shrink-0 items-center justify-center"
                      >
                        <img src={TrashIcon} alt="" className="size-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddPlatformLink}
                    className="flex w-full items-center justify-center rounded-[5px] border border-secondary-500 py-1.25 text-caption2 text-secondary-500"
                  >
                    + 링크 추가
                  </button>
                </div>
              ) : null}
            </div>
          </Field>

          <Field label="기타 링크">
            <Input
              value={otherUrl}
              onChange={(event) => setOtherUrl(event.target.value)}
              placeholder="기타 음원 플랫폼 링크"
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] px-5">
        <button
          type="button"
          onClick={handleSubmit}
          className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 ${
            isValid
              ? "bg-secondary-500 text-neutral-0"
              : "bg-neutral-300 text-neutral-600"
          }`}
        >
          음원 등록
        </button>
      </div>
    </main>
  );
};

export default MusicRegisterPage;
