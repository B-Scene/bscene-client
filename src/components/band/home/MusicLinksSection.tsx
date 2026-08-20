import SpotifyIcon from "@/assets/icons/Spotify.svg";
import YoutubeIcon from "@/assets/icons/youtube.svg";
import SoundcloudIcon from "@/assets/icons/soundcloude.svg";
import PlusIcon from "@/assets/icons/Plus.svg";
import MusicNoteIcon from "@/assets/icons/band/menu-music.svg";
import ArrowRightIcon from "@/assets/icons/band/arrow-right-home.svg";
import type { MusicEtcPlatform } from "@/types/band/musicLink";

const ETC_PLATFORM_LABELS: Record<MusicEtcPlatform, string> = {
  MELON: "Melon",
  GENIE: "genie",
  BUGS: "Bugs",
  APPLE_MUSIC: "Apple Music",
};

interface MusicLinkRowProps {
  iconSrc: string;
  label: string;
  url: string;
  filledIcon?: boolean;
}

const MusicLinkRow = ({
  iconSrc,
  label,
  url,
  filledIcon = false,
}: MusicLinkRowProps) => (
  <a
    href={url}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-6.25 rounded-xl py-3 pl-3 pr-3.75 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
  >
    {filledIcon ? (
      <img
        src={iconSrc}
        alt=""
        className="size-8.75 shrink-0 rounded-lg object-cover"
      />
    ) : (
      <span className="flex size-8.75 shrink-0 items-center justify-center rounded-lg bg-neutral-400">
        <img src={iconSrc} alt="" className="size-5" />
      </span>
    )}
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="text-caption3 text-neutral-900">{label}</span>
      <span className="truncate text-caption2 text-neutral-600">{url}</span>
    </div>
    <img src={ArrowRightIcon} alt="" />
  </a>
);

interface MusicLinksSectionProps {
  spotifyUrl: string;
  youtubeUrl: string;
  soundcloudUrl: string;
  etcPlatform: MusicEtcPlatform | null;
  etcUrl: string;
  otherUrl: string;
  onAddLink: () => void;
}

export const MusicLinksSection = ({
  spotifyUrl,
  youtubeUrl,
  soundcloudUrl,
  etcPlatform,
  etcUrl,
  otherUrl,
  onAddLink,
}: MusicLinksSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption2 text-neutral-600">
        외부 음원 플랫폼에서 이 밴드의 음악을 들어보세요
      </p>

      <div className="flex flex-col gap-3 px-2.5">
        {spotifyUrl ? (
          <MusicLinkRow
            iconSrc={SpotifyIcon}
            label="Spotify"
            url={spotifyUrl}
            filledIcon
          />
        ) : null}

        {youtubeUrl ? (
          <MusicLinkRow
            iconSrc={YoutubeIcon}
            label="YouTube"
            url={youtubeUrl}
            filledIcon
          />
        ) : null}

        {soundcloudUrl ? (
          <MusicLinkRow
            iconSrc={SoundcloudIcon}
            label="SoundCloud"
            url={soundcloudUrl}
            filledIcon
          />
        ) : null}

        {etcPlatform && etcUrl ? (
          <MusicLinkRow
            iconSrc={MusicNoteIcon}
            label={ETC_PLATFORM_LABELS[etcPlatform]}
            url={etcUrl}
          />
        ) : null}

        {otherUrl ? (
          <MusicLinkRow iconSrc={MusicNoteIcon} label="기타" url={otherUrl} />
        ) : null}

        <button
          type="button"
          onClick={onAddLink}
          className="flex items-center gap-6.25 rounded-xl bg-neutral-300 p-3 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
        >
          <span className="flex size-8.75 shrink-0 items-center justify-center rounded-lg bg-neutral-400">
            <img src={PlusIcon} alt="" />
          </span>
          <div className="flex flex-col items-start">
            <span className="text-caption3 text-neutral-900">기타 링크</span>
            <span className="text-caption2 text-neutral-600">
              멜론, 지니, 벅스, 애플뮤직 등
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
