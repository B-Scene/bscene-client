import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/tokens/color.css";
import MicIcon from "@/assets/icons/ic_Mic.svg";
import MicEllipseIcon from "@/assets/icons/Mic_Ellipse.svg";
import LiveStartIcon from "@/assets/icons/band/live-start.svg";
import LiveStopIcon from "@/assets/icons/band/live-stop.svg";
import { cx } from "../utils";
import { TopBar } from "./TopBar";

interface MicTestScreenProps {
  onBack: () => void;
  onClose: () => void;
  onComplete: () => void;
}

const VOLUME_BAR_COUNT = 28;
const TEST_DURATION_SECONDS = 5;

const VOLUME_BAR_COLORS = [
  "var(--color-secondary-0)",
  "var(--color-secondary-200)",
  "var(--color-secondary-400)",
  "var(--color-secondary-500)",
];

const formatSeconds = (seconds: number) =>
  `0:${String(seconds).padStart(2, "0")}`;

export function MicTestScreen({
  onBack,
  onClose,
  onComplete,
}: MicTestScreenProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const secondTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const elapsedSecondsRef = useRef(0);

  const progressPercent = Math.min(
    100,
    (elapsedSeconds / TEST_DURATION_SECONDS) * 100,
  );

  const updateElapsedSeconds = useCallback((nextSeconds: number) => {
    elapsedSecondsRef.current = nextSeconds;
    setElapsedSeconds(nextSeconds);
  }, []);

  const clearTimers = useCallback(() => {
    if (secondTimerRef.current !== null) {
      window.clearInterval(secondTimerRef.current);
      secondTimerRef.current = null;
    }
  }, []);

  const stopAudioResources = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    mediaRecorderRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed"
    ) {
      void audioContextRef.current.close();
    }

    audioContextRef.current = null;
  }, []);

  const stopMicTest = useCallback(() => {
    clearTimers();
    stopAudioResources();
  }, [clearTimers, stopAudioResources]);

  const finishMicTest = useCallback(() => {
    clearTimers();
    stopAudioResources();

    setIsTesting(false);
    setIsCompleted(true);
    setVolumeLevel(0);
    updateElapsedSeconds(TEST_DURATION_SECONDS);
  }, [clearTimers, stopAudioResources, updateElapsedSeconds]);

  const pauseMicTest = useCallback(() => {
    clearTimers();
    stopAudioResources();

    setIsTesting(false);
    setVolumeLevel(0);
  }, [clearTimers, stopAudioResources]);

  const startMicTest = useCallback(
    async ({ reset = false }: { reset?: boolean } = {}) => {
      clearTimers();
      stopAudioResources();

      if (reset || elapsedSecondsRef.current >= TEST_DURATION_SECONDS) {
        updateElapsedSeconds(0);
        setVolumeLevel(0);
        recordedChunksRef.current = [];
      }

      setIsTesting(true);
      setIsCompleted(false);
      setErrorMessage("");

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("이 브라우저에서는 마이크 테스트를 지원하지 않아요.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        streamRef.current = stream;

        if (typeof MediaRecorder !== "undefined") {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.start();
        }

        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }).webkitAudioContext;

        if (!AudioContextClass) {
          throw new Error("이 브라우저에서는 오디오 분석을 지원하지 않아요.");
        }

        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.75;

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.fftSize);

        const updateMeter = () => {
          analyser.getByteTimeDomainData(dataArray);

          let sum = 0;

          for (const value of dataArray) {
            const normalizedValue = (value - 128) / 128;
            sum += normalizedValue * normalizedValue;
          }

          const rms = Math.sqrt(sum / dataArray.length);
          const amplifiedLevel = Math.round(rms * 310);

          const nextLevel =
            amplifiedLevel < 2
              ? 0
              : Math.min(VOLUME_BAR_COUNT, amplifiedLevel);

          setVolumeLevel(nextLevel);

          animationFrameRef.current = requestAnimationFrame(updateMeter);
        };

        updateMeter();

        secondTimerRef.current = window.setInterval(() => {
          const nextSeconds = Math.min(
            TEST_DURATION_SECONDS,
            elapsedSecondsRef.current + 1,
          );

          updateElapsedSeconds(nextSeconds);

          if (nextSeconds >= TEST_DURATION_SECONDS) {
            finishMicTest();
          }
        }, 1000);
      } catch {
        stopAudioResources();

        setIsTesting(false);
        setIsCompleted(false);
        setVolumeLevel(0);
        setErrorMessage(
          "마이크 권한을 허용해야 테스트할 수 있어요. 브라우저 설정에서 마이크 권한을 허용해주세요.",
        );
      }
    },
    [
      clearTimers,
      finishMicTest,
      stopAudioResources,
      updateElapsedSeconds,
    ],
  );

  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, [stopMicTest]);

  const handleTogglePlayback = () => {
    if (isTesting) {
      pauseMicTest();
      return;
    }

    void startMicTest({ reset: isCompleted });
  };

  const handleBack = () => {
    stopMicTest();
    onBack();
  };

  const handleClose = () => {
    stopMicTest();
    onClose();
  };

  const handleComplete = () => {
    stopMicTest();
    onComplete();
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 text-neutral-900">
      <TopBar title="마이크 테스트" onBack={handleBack} onClose={handleClose} />

      <section className="flex flex-col items-center px-5 pt-[54px]">
        <div className="flex w-[215px] flex-col items-center gap-2 text-center">
          <h1 className="text-h4 font-bold text-neutral-900">
            마이크 볼륨을 테스트해 보세요
          </h1>

          <p className="whitespace-pre-line text-body2 leading-5 text-neutral-600">
            {"마이크 버튼을 누르고,\n아래 레벨이 움직이는지 확인해 주세요"}
          </p>
        </div>

        <div className="mt-[45px] flex flex-col items-center">
          <button
            type="button"
            onClick={handleTogglePlayback}
            aria-label={isTesting ? "마이크 테스트 멈춤" : "마이크 테스트 시작"}
            className={cx(
              "relative flex h-[135px] w-[135px] items-center justify-center rounded-full transition-transform",
              isTesting ? "scale-100" : "active:scale-95",
            )}
          >
            <img
              src={MicEllipseIcon}
              alt=""
              className={cx(
                "absolute inset-0 h-full w-full object-contain transition-opacity",
                isTesting ? "opacity-100" : "opacity-80",
              )}
            />

            <img
              src={MicIcon}
              alt=""
              className="relative z-10 h-[72px] w-[72px] object-contain"
            />
          </button>

          <span className="mt-4 h-4 text-caption4 font-bold text-secondary-500">
            {isTesting || isCompleted || elapsedSeconds > 0
              ? formatSeconds(elapsedSeconds)
              : ""}
          </span>
        </div>

        <section className="mt-[34px] w-full max-w-[335px] rounded-[12px] bg-neutral-0 px-6 py-5 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
          <div className="flex h-9 items-end justify-between">
            {Array.from({ length: VOLUME_BAR_COUNT }).map((_, index) => {
              const isActive = index < volumeLevel;
              const barHeight =
                8 + Math.round((index / (VOLUME_BAR_COUNT - 1)) * 26);
              const colorIndex = Math.min(
                VOLUME_BAR_COLORS.length - 1,
                Math.floor(
                  (index / VOLUME_BAR_COUNT) * VOLUME_BAR_COLORS.length,
                ),
              );

              return (
                <div
                  key={index}
                  className="w-[7px] rounded-full transition-all duration-100"
                  style={{
                    height: isActive ? `${barHeight}px` : "8px",
                    backgroundColor: isActive
                      ? VOLUME_BAR_COLORS[colorIndex]
                      : "var(--color-neutral-300)",
                    boxShadow: isActive
                      ? "0 0 8px var(--color-secondary-300)"
                      : "none",
                  }}
                />
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-caption4 font-bold">
            <span className="text-neutral-600">너무 작아요</span>
            <span className="text-secondary-500">적정</span>
            <span className="text-neutral-600">너무 커요</span>
          </div>
        </section>

        {errorMessage ? (
          <p className="mt-4 max-w-[320px] text-center text-caption2 text-error">
            {errorMessage}
          </p>
        ) : null}

        <section className="mt-[34px] flex h-[56px] w-full max-w-[353px] items-center rounded-[10px] bg-secondary-0 px-5 shadow-[0_4px_15px_rgba(20,20,20,0.04)]">
          <button
            type="button"
            onClick={handleTogglePlayback}
            aria-label={isTesting ? "마이크 테스트 멈춤" : "마이크 테스트 시작"}
            className="flex size-6 shrink-0 items-center justify-center"
          >
            <img
              src={isTesting ? LiveStartIcon : LiveStopIcon}
              alt=""
              className="size-6 object-contain"
            />
          </button>

          <span className="ml-3 shrink-0 text-caption4 font-bold text-secondary-500">
            {formatSeconds(elapsedSeconds)} /{" "}
            {formatSeconds(TEST_DURATION_SECONDS)}
          </span>

          <div className="ml-3 h-1 w-full overflow-hidden rounded-full bg-neutral-300">
            <div
              className="h-full rounded-full bg-secondary-500 transition-all duration-500 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>
      </section>

      <div className="fixed inset-x-0 bottom-[80px] px-5">
        <button
          type="button"
          disabled={!isCompleted}
          onClick={handleComplete}
          className={cx(
            "mx-auto flex h-[52px] w-full max-w-[353px] items-center justify-center rounded-[12px] text-label1",
            isCompleted
              ? "bg-secondary-500 text-neutral-0"
              : "bg-neutral-300 text-neutral-600",
          )}
        >
          테스트 완료
        </button>
      </div>
    </main>
  );
}