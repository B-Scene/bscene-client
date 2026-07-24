import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadsetIcon from "@/assets/Headset.svg";
import FallbackSeekIcon from "@/assets/icons/band/menu-reload.svg";
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

const TOTAL_SECONDS = 86 * 60 + 22;
const INITIAL_SECONDS = 2 * 60 + 17;

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.min(TOTAL_SECONDS, Math.floor(seconds)));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

function ReplayHeader({ onExit }: { onExit: () => void }) {
  return (
    <header className="absolute inset-x-0 top-2.5 z-10 flex h-12 items-center justify-between pr-6 pl-[31px]">
      <div className="flex items-center gap-2.5 text-neutral-900">
        <span className="flex h-[22px] items-center rounded-lg bg-primary-400 px-1 py-0.5 text-caption3 text-neutral-0">
          REPLAY
        </span>
        <span className="text-caption2">5월 6일 라이브</span>
        <span className="flex items-center gap-1 text-caption2">
          <img
            src={HeadsetIcon}
            alt=""
            className="size-4 object-contain brightness-0"
          />
          30명 청취
        </span>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="fan-live-exit-button flex items-center justify-center rounded-full bg-neutral-0 px-2 py-1 text-caption3 text-error"
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
  playing,
  onClick,
}: {
  playing: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playing ? "일시 정지" : "재생"}
      className="flex size-[62px] items-center justify-center rounded-full bg-primary-400"
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
  const [playing, setPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(INITIAL_SECONDS);
  const progress = elapsedSeconds / TOTAL_SECONDS;

  useEffect(() => {
    if (!playing) return;

    const timer = window.setTimeout(() => {
      const nextElapsedSeconds = Math.min(
        TOTAL_SECONDS,
        elapsedSeconds + 0.25,
      );

      setElapsedSeconds(nextElapsedSeconds);
      if (nextElapsedSeconds >= TOTAL_SECONDS) {
        setPlaying(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [elapsedSeconds, playing]);

  const seek = (seconds: number) => {
    setElapsedSeconds((current) =>
      Math.min(TOTAL_SECONDS, Math.max(0, current + seconds)),
    );
  };

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <ReplayHeader onExit={() => navigate("/fan/live/replays")} />
      <FanLiveHero top={176} />

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
            max="1"
            step="0.001"
            value={progress}
            onChange={(event) => {
              const nextProgress = Number(event.target.value);
              setElapsedSeconds(nextProgress * TOTAL_SECONDS);
            }}
            aria-label="재생 위치 조절"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="mt-1 flex items-center justify-between font-body text-caption4">
          <span className="text-neutral-700">{formatTime(elapsedSeconds)}</span>
          <span className="text-neutral-400">86:22</span>
        </div>

        <div className="mt-[15px] flex items-center justify-center gap-10">
          <ReplaySeekButton direction="backward" onClick={() => seek(-10)} />
          <PlaybackToggle
            playing={playing}
            onClick={() => setPlaying((current) => !current)}
          />
          <ReplaySeekButton direction="forward" onClick={() => seek(10)} />
        </div>
      </section>
    </main>
  );
}

export default FanLivePlaybackPage;
