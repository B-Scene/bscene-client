import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { Input } from "@/components/common/Input/Input";
import { useBandMusicLinksStore } from "@/stores/useBandMusicLinksStore";
import type { MusicEtcPlatform } from "@/types/band/musicLink";

const ETC_PLATFORM_OPTIONS: { value: MusicEtcPlatform; label: string }[] = [
  { value: "MELON", label: "Melon" },
  { value: "GENIE", label: "genie" },
  { value: "BUGS", label: "Bugs" },
  { value: "APPLE_MUSIC", label: "Apple Music" },
];

interface FieldProps {
  label: string;
  error?: ReactNode;
  children: ReactNode;
}

const Field = ({ label, error, children }: FieldProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-body1 text-neutral-900">{label}</label>
    {children}
    {error ? <span className="text-body5 text-error">{error}</span> : null}
  </div>
);

const MusicRegisterPage = () => {
  const navigate = useNavigate();
  const setMusicLinks = useBandMusicLinksStore((state) => state.setMusicLinks);

  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [otherUrl, setOtherUrl] = useState("");

  const [etcPlatform, setEtcPlatform] = useState<MusicEtcPlatform | null>(null);
  const [etcUrl, setEtcUrl] = useState("");

  const [showErrors, setShowErrors] = useState(false);

  const isValid = Boolean(
    spotifyUrl.trim() ||
      youtubeUrl.trim() ||
      soundcloudUrl.trim() ||
      otherUrl.trim() ||
      (etcPlatform && etcUrl.trim()),
  );

  const linksError = showErrors && !isValid;
  const etcPlatformMismatchError =
    showErrors && Boolean(etcPlatform) !== Boolean(etcUrl.trim());

  const handleSelectEtcPlatform = (platform: MusicEtcPlatform) => {
    setEtcPlatform((prev) => (prev === platform ? null : platform));
  };

  const handleSubmit = () => {
    if (!isValid || etcPlatformMismatchError) {
      setShowErrors(true);
      return;
    }

    setMusicLinks({
      spotifyUrl,
      youtubeUrl,
      soundcloudUrl,
      etcPlatform,
      etcUrl,
      otherUrl,
    });

    navigate("/band/home");
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-40">
      <Header title="음원 등록" />

      <section className="flex flex-col gap-6 px-8 pt-6">
        <p className="text-caption3 text-neutral-600">
          팬들이 음악을 들을 수 있도록 음원 플랫폼 링크를 등록해 주세요
        </p>

        <div className="flex flex-col gap-4">
          <Field label="Spotify URL">
            <Input
              value={spotifyUrl}
              onChange={(event) => setSpotifyUrl(event.target.value)}
              placeholder="open.spotify.com/artist/..."
              error={linksError}
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>

          <Field label="YouTube URL">
            <Input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="youtube.com/@..."
              error={linksError}
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>

          <Field label="SoundCloud URL">
            <Input
              value={soundcloudUrl}
              onChange={(event) => setSoundcloudUrl(event.target.value)}
              placeholder="soundcloud.com/..."
              error={linksError}
              className="w-full rounded-[5px] px-4 py-1.25"
            />
          </Field>

          <Field
            label="Melon / genie / Bugs / Apple Music URL"
            error={
              etcPlatformMismatchError
                ? "플랫폼과 링크를 함께 입력해주세요"
                : null
            }
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-2">
                {ETC_PLATFORM_OPTIONS.map((platform) => (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() => handleSelectEtcPlatform(platform.value)}
                    className={`flex h-6.5 shrink-0 items-center justify-center gap-2.5 rounded-lg px-3.75 py-1.75 text-center text-caption3 ${
                      etcPlatform === platform.value
                        ? "bg-secondary-500 text-neutral-0"
                        : "bg-neutral-300 text-neutral-600"
                    }`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>

              {etcPlatform ? (
                <Input
                  value={etcUrl}
                  onChange={(event) => setEtcUrl(event.target.value)}
                  placeholder="예매 링크 또는 관련 게시글 링크를 첨부해주세요"
                  error={etcPlatformMismatchError}
                  className="w-full rounded-[5px] px-4 py-1.25"
                />
              ) : null}
            </div>
          </Field>

          <Field
            label="기타 링크"
            error={linksError ? "최소 하나의 음원 링크를 입력해주세요" : null}
          >
            <Input
              value={otherUrl}
              onChange={(event) => setOtherUrl(event.target.value)}
              placeholder="기타 음원 플랫폼 링크"
              error={linksError}
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
