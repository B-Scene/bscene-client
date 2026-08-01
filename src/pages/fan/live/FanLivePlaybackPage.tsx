import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useNavigate, useParams } from "react-router-dom";
import {
  resolveLiveApiUrl,
  setupLiveReplayXhr,
} from "@/api/live/live";
import HeadsetIcon from "@/assets/Headset.svg";
import FallbackSeekIcon from "@/assets/icons/band/menu-reload.svg";
import { useReplayPlaybackQuery } from "@/hooks/api/live/useLive";
import { FanLiveHero } from "./components/FanLiveRoomParts";
import "./FanLivePage.css";

const playbackIconModules = import.meta.glob<string>(
  "/src/assets/**/{move_left,move_right,play}.svg",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);

function findPlaybackIcon(fileName: string) {
  const entry = Object.entries(playbackIconModules).find(([path]) =>
    path.endsWith(`/${fileName}.svg`),
  );

  return entry?.[1];
}

const MoveLeftIcon = findPlaybackIcon("move_left");
const MoveRightIcon = findPlaybackIcon("move_right");
const ReplayPlayIcon = findPlaybackIcon("play");

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, remainingSeconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

function ReplayHeader({
  title,
  viewCount,
  onExit,
}: {
  title: string;
  viewCount: number;
  onExit: () => void;
}) {
  return (
    <header className="absolute inset-x-0 top-2.5 z-10 flex h-12 items-center justify-between pr-6 pl-[31px]">
      <div className="flex min-w-0 items-center gap-2.5 text-neutral-900">
        <span className="flex h-[22px] shrink-0 items-center rounded-lg bg-primary-400 px-1 py-0.5 text-caption3 text-neutral-0">
          REPLAY
        </span>
        <span className="max-w-[115px] truncate text-caption2">{title}</span>
        <span className="flex shrink-0 items-center gap-1 text-caption2">
          <img
            src={HeadsetIcon}
            alt=""
            className="size-4 object-contain brightness-0"
          />
          {viewCount.toLocaleString()}명 청취
        </span>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="fan-live-exit-button flex shrink-0 items-center justify-center rounded-full bg-neutral-0 px-2 py-1 text-caption3 text-error"
      >
        나가기
      </button>
    </header>
  );
}

function ReplaySeekButton({
  direction,
  onClick,
}: {
  direction: "backward" | "forward";
  onClick: () => void;
}) {
  const icon = direction === "backward" ? MoveLeftIcon : MoveRightIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction === "backward" ? "10초 전" : "10초 후"} 이동`}
      className="relative flex size-8 items-center justify-center text-neutral-800"
    >
      <img
        src={icon ?? FallbackSeekIcon}
        alt=""
        className={`size-8 object-contain ${
          !icon && direction === "backward" ? "-scale-x-100" : ""
        }`}
      />
      <span className="pointer-events-none absolute top-[13px] left-1/2 -translate-x-1/2 font-body text-[10px] leading-3 font-black text-neutral-800">
        10
      </span>
    </button>
  );
}

function PlaybackToggle({
  disabled,
  playing,
  onClick,
}: {
  disabled: boolean;
  playing: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={playing ? "일시 정지" : "재생"}
      className="flex size-[62px] items-center justify-center rounded-full bg-primary-400 disabled:opacity-50"
    >
      {playing ? (
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-8 w-2 rounded-full bg-neutral-0" />
          <span className="h-8 w-2 rounded-full bg-neutral-0" />
        </span>
      ) : ReplayPlayIcon ? (
        <img src={ReplayPlayIcon} alt="" className="size-8 object-contain" />
      ) : (
        <span
          aria-hidden="true"
          className="ml-1 h-0 w-0 border-y-[11px] border-l-[18px] border-y-transparent border-l-neutral-0"
        />
      )}
    </button>
  );
}

export function FanLivePlaybackPage() {
  const navigate = useNavigate();
  const { liveId: liveIdParam } = useParams();
  const liveId = Number(liveIdParam);
  const hasValidLiveId = Number.isInteger(liveId) && liveId > 0;
  const {
    data: replay,
    isError,
    isLoading,
    refetch,
  } = useReplayPlaybackQuery(hasValidLiveId ? liveId : null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [isPlaybackReady, setIsPlaybackReady] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioError, setAudioError] = useState("");

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaybackReady) {
      setAudioError("재생 데이터를 불러오는 중이에요.");
      return;
    }

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
      setAudioError("");
    } catch {
      setAudioError("다시보기를 재생하지 못했어요.");
    }
  }, [isPlaybackReady]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !replay?.playbackUrl) return;
    const playbackUrl = resolveLiveApiUrl(replay.playbackUrl);

    setIsPlaybackReady(false);
    setAudioError("");

    if (!Hls.isSupported()) {
      if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = playbackUrl;
        audio.load();

        return () => {
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
        };
      }

      window.setTimeout(() => {
        setAudioError("이 브라우저에서는 HLS 재생을 지원하지 않아요.");
      }, 0);
      return;
    }

    const hls = new Hls({
      lowLatencyMode: false,
      backBufferLength: 60,
      xhrSetup: setupLiveReplayXhr,
    });

    hlsRef.current = hls;
    hls.attachMedia(audio);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(playbackUrl);
    });
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setIsPlaybackReady(true);
      setAudioError("");
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      console.error("[Replay HLS error]", {
        type: data.type,
        details: data.details,
        reason: data.reason,
        fatal: data.fatal,
        response: data.response,
      });

      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setAudioError(
          data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR
            ? "다시보기 재생 목록 형식이 올바르지 않아요."
            : "다시보기 데이터를 불러오지 못했어요.",
        );
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        setAudioError("다시보기 미디어를 재생하지 못했어요.");
        return;
      }

      setAudioError("다시보기 스트림을 재생하지 못했어요.");
      hls.destroy();
      hlsRef.current = null;
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [replay?.playbackUrl]);

  const totalSeconds = replay?.durationSec ?? replay?.durationSeconds ?? 0;
  const progress =
    totalSeconds > 0
      ? Math.min(1, Math.max(0, elapsedSeconds / totalSeconds))
      : 0;

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(
      totalSeconds,
      Math.max(0, audio.currentTime + seconds),
    );
    setElapsedSeconds(audio.currentTime);
  };

  if (isLoading) {
    return (
      <main className="flex h-full items-center justify-center bg-neutral-0">
        <p className="font-body text-caption2 text-neutral-500">
          다시보기를 준비하는 중이에요.
        </p>
      </main>
    );
  }

  if (!replay || isError) {
    return (
      <main className="flex h-full flex-col items-center justify-center bg-neutral-0 px-5 text-center">
        <p className="font-body text-body2 text-neutral-700">
          다시보기를 불러오지 못했어요.
        </p>
        <div className="mt-4 flex gap-2">
          {isError ? (
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-primary-400 px-4 py-2 font-body text-caption2 text-primary-400"
            >
              다시 시도
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => navigate("/fan/live/replays", { replace: true })}
            className="rounded-lg bg-primary-400 px-4 py-2 font-body text-caption2 text-neutral-0"
          >
            목록으로
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <ReplayHeader
        title={replay.title}
        viewCount={replay.viewCount}
        onExit={() => navigate("/fan/live/replays", { replace: true })}
      />
      <FanLiveHero
        isAudioActive={playing}
        live={{
          ...replay,
          bandProfileImageUrl: replay.bandProfileImageUrl ?? null,
        }}
        top={176}
      />

      <audio
        ref={audioRef}
        className="sr-only"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onCanPlay={() => {
          setIsPlaybackReady(true);
          setAudioError("");
        }}
        onLoadedMetadata={() => setIsPlaybackReady(true)}
        onTimeUpdate={(event) =>
          setElapsedSeconds(event.currentTarget.currentTime)
        }
        onError={(event) => {
          const errorCode = event.currentTarget.error?.code;
          setAudioError(
            errorCode
              ? `다시보기 미디어를 재생하지 못했어요. (오류 ${errorCode})`
              : "다시보기 미디어를 재생하지 못했어요.",
          );
        }}
      />

      {audioError ? (
        <p className="absolute inset-x-5 top-[56px] z-20 rounded-lg bg-primary-400 px-3 py-2 text-center font-body text-caption3 text-neutral-0">
          {audioError}
        </p>
      ) : null}

      <section
        aria-label="다시보기 재생 컨트롤"
        className="absolute inset-x-0 top-[520px] px-6"
      >
        <div className="relative h-2">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-300" />
          <div
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary-400 via-primary-300 to-primary-100"
            style={{ width: `${progress * 100}%` }}
          />
          <button
            type="button"
            aria-label="재생 위치"
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary-400 via-primary-300 to-primary-100"
            style={{ left: `${progress * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max={Math.max(1, totalSeconds)}
            step="0.1"
            value={Math.min(elapsedSeconds, Math.max(1, totalSeconds))}
            onChange={(event) => {
              const nextSeconds = Number(event.target.value);
              if (audioRef.current) {
                audioRef.current.currentTime = nextSeconds;
              }
              setElapsedSeconds(nextSeconds);
            }}
            aria-label="재생 위치 조절"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="mt-1 flex items-center justify-between font-body text-caption4">
          <span className="text-neutral-700">{formatTime(elapsedSeconds)}</span>
          <span className="text-neutral-400">{formatTime(totalSeconds)}</span>
        </div>

        <div className="mt-[15px] flex items-center justify-center gap-10">
          <ReplaySeekButton direction="backward" onClick={() => seek(-10)} />
          <PlaybackToggle
            disabled={!isPlaybackReady}
            playing={playing}
            onClick={() => void togglePlayback()}
          />
          <ReplaySeekButton direction="forward" onClick={() => seek(10)} />
        </div>
      </section>
    </main>
  );
}

export default FanLivePlaybackPage;
