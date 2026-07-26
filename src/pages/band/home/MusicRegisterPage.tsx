import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { Input } from "@/components/common/Input/Input";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { useMusicLinksQuery, useSaveMusicLinks } from "@/hooks/api/band/useMusicLink";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type {
  MusicEtcPlatform,
  MusicLinksResponse,
} from "@/types/band/musicLink";

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
  const activeBandId = useActiveBandId();
  const bandId = activeBandId ?? NaN;
  const { data: existingLinks, isLoading } = useMusicLinksQuery(bandId);

  if (activeBandId === null || isLoading) {
    return <main className="min-h-dvh bg-neutral-0" />;
  }

  return (
    <MusicRegisterForm
      key={bandId}
      bandId={bandId}
      existingLinks={existingLinks}
    />
  );
};

interface MusicRegisterFormProps {
  bandId: number;
  existingLinks: MusicLinksResponse | undefined;
}

const MusicRegisterForm = ({
  bandId,
  existingLinks,
}: MusicRegisterFormProps) => {
  const navigate = useNavigate();
  const saveMusicLinks = useSaveMusicLinks(bandId);

  const [spotifyUrl, setSpotifyUrl] = useState(
    () => existingLinks?.spotifyUrl ?? "",
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    () => existingLinks?.youtubeUrl ?? "",
  );
  const [soundcloudUrl, setSoundcloudUrl] = useState(
    () => existingLinks?.soundcloudUrl ?? "",
  );
  const [otherUrl, setOtherUrl] = useState(() => existingLinks?.otherUrl ?? "");

  const [etcPlatform, setEtcPlatform] = useState<MusicEtcPlatform | null>(
    () => existingLinks?.etcPlatform ?? null,
  );
  const [etcUrl, setEtcUrl] = useState(() => existingLinks?.etcUrl ?? "");

  const [showErrors, setShowErrors] = useState(false);

  const isValid = Boolean(
    spotifyUrl.trim() ||
      youtubeUrl.trim() ||
      soundcloudUrl.trim() ||
      otherUrl.trim() ||
      (etcPlatform && etcUrl.trim()),
  );

  const hasEtcPlatformMismatch =
    Boolean(etcPlatform) !== Boolean(etcUrl.trim());

  const linksError = showErrors && !isValid;
  const etcPlatformMismatchError = showErrors && hasEtcPlatformMismatch;

  const handleSelectEtcPlatform = (platform: MusicEtcPlatform) => {
    setEtcPlatform((prev) => (prev === platform ? null : platform));
  };

  const handleSubmit = () => {
    if (!isValid || hasEtcPlatformMismatch) {
      setShowErrors(true);
      return;
    }

    saveMusicLinks.mutate(
      {
        spotifyUrl: spotifyUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
        soundcloudUrl: soundcloudUrl.trim() || null,
        etcPlatform,
        etcUrl: etcUrl.trim() || null,
        otherUrl: otherUrl.trim() || null,
      },
      {
        onSuccess: () => {
          navigate("/band/home");
        },
      },
    );
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

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+16px)] flex flex-col gap-2 px-5">
        {saveMusicLinks.isError ? (
          <span className="text-center text-body5 text-error">
            {getApiErrorMessage(
              saveMusicLinks.error,
              "저장에 실패했어요. 다시 시도해주세요",
            )}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saveMusicLinks.isPending}
          className={`flex h-13 w-full items-center justify-center rounded-xl text-label1 ${
            isValid && !saveMusicLinks.isPending
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
