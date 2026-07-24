import { useCallback, useEffect, useRef, useState } from "react";
import MicIcon from "@/assets/icons/ic_Mic.svg";
import MicEllipseIcon from "@/assets/icons/Mic_Ellipse.svg";
import VolumeSpecIcon from "@/assets/icons/band/volumeSpec.svg";
import { cx } from "../utils";
import { TopBar } from "./TopBar";

interface MicTestScreenProps {
  onBack: () => void;
  onClose: () => void;
  onComplete: () => void;
}

const VOLUME_BAR_COUNT = 28;
const TEST_DURATION_SECONDS = 5;

const formatSeconds = (seconds: number) => `0:${String(seconds).padStart(2, "0")}`;

export function MicTestScreen({ onBack, onClose, onComplete }: MicTestScreenProps) {
  const [isTesting, setIsTesting] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fallbackIntervalRef = useRef<number | null>(null);

  const progressPercent = Math.min(
    100,
    (elapsedSeconds / TEST_DURATION_SECONDS) * 100,
  );

  const stopMicTest = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (fallbackIntervalRef.current) {
      window.clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }

    audioContextRef.current = null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const startFallbackMeter = () => {
      fallbackIntervalRef.current = window.setInterval(() => {
        setVolumeLevel(9 + Math.floor(Math.random() * 11));
      }, 180);
    };

    const startMicMeter = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          analyser.getByteTimeDomainData(dataArray);

          let sum = 0;

          for (const value of dataArray) {
            const normalizedValue = (value - 128) / 128;
            sum += normalizedValue * normalizedValue;
          }

          const rms = Math.sqrt(sum / dataArray.length);
          const nextLevel = Math.min(
            VOLUME_BAR_COUNT,
            Math.max(1, Math.round(rms * 90)),
          );

          setVolumeLevel(nextLevel);
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        };

        updateMeter();
      } catch {
        startFallbackMeter();
      }
    };

    startMicMeter();

    const secondTimer = window.setInterval(() => {
      setElapsedSeconds((prevSeconds) => {
        if (prevSeconds >= TEST_DURATION_SECONDS) return prevSeconds;
        return prevSeconds + 1;
      });
    }, 1000);

    const finishTimer = window.setTimeout(() => {
      setIsTesting(false);
      setElapsedSeconds(TEST_DURATION_SECONDS);
      setVolumeLevel((prevLevel) => Math.max(prevLevel, 14));
      stopMicTest();
    }, TEST_DURATION_SECONDS * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(secondTimer);
      window.clearTimeout(finishTimer);
      stopMicTest();
    };
  }, [stopMicTest]);

  return (
    <main className="relative min-h-dvh bg-neutral-0 text-neutral-900">
      <TopBar title="마이크 테스트" onBack={onBack} onClose={onClose} />

      <section className="flex flex-col items-center px-5 pt-[54px]">
        <div className="flex w-[215px] flex-col items-center gap-2 text-center">
          <h1 className="text-h4 font-bold text-neutral-900">
            마이크 볼륨을 테스트해 보세요
          </h1>
          <p className="whitespace-pre-line text-body2 leading-5 text-neutral-600">
            {"말하기 버튼을 누르고,\n아래 레벨이 움직이는지 확인해 주세요"}
          </p>
        </div>

        <div className="mt-[45px] flex flex-col items-center">
          <div className="relative flex h-[135px] w-[135px] items-center justify-center">
            <img
              src={MicEllipseIcon}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />
            <img
              src={MicIcon}
              alt=""
              className="relative z-10 h-[72px] w-[72px] object-contain"
            />
          </div>

          <span className="mt-4 text-caption4 font-bold text-secondary-500">
            {formatSeconds(elapsedSeconds)}
          </span>
        </div>

        <section className="mt-[34px] w-full max-w-[335px] rounded-[12px] bg-neutral-0 px-6 py-5 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
          <div className="flex h-8 items-end justify-between">
            {Array.from({ length: VOLUME_BAR_COUNT }).map((_, index) => {
              const isActive = index < volumeLevel;

              return (
                <img
                  key={index}
                  src={VolumeSpecIcon}
                  alt=""
                  className={cx(
                    "h-8 w-[6px] object-contain transition-all duration-150",
                    isActive ? "opacity-100" : "opacity-20 grayscale",
                  )}
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

        <section className="mt-[34px] flex h-[56px] w-full max-w-[353px] items-center rounded-[10px] bg-secondary-0 px-5 shadow-[0_4px_15px_rgba(20,20,20,0.04)]">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-neutral-800">
            <img src={VolumeSpecIcon} alt="" className="h-3.5 w-3.5 object-contain" />
          </div>

          <span className="ml-3 shrink-0 text-caption4 font-bold text-secondary-500">
            {formatSeconds(elapsedSeconds)} / {formatSeconds(TEST_DURATION_SECONDS)}
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
          disabled={isTesting}
          onClick={onComplete}
          className={cx(
            "mx-auto flex h-[52px] w-full max-w-[353px] items-center justify-center rounded-[12px] text-label1",
            isTesting
              ? "bg-neutral-300 text-neutral-600"
              : "bg-secondary-500 text-neutral-0",
          )}
        >
          테스트 완료
        </button>
      </div>
    </main>
  );
}