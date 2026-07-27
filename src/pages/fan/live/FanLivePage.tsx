import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import Hls from "hls.js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getLivePlaybackAuthorization,
  subscribeViewerCount,
} from "@/api/live/live";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  useEnterLiveQuery,
  useLeaveLiveMutation,
} from "@/hooks/api/live/useLive";
import type {
  EnterLiveResponse,
  LiveApiResponse,
} from "@/types/live/live";
import "./FanLivePage.css";
import {
  EmptyChatArea,
  FanLiveActionBar,
  FanLiveChatArea,
  FanLiveHeader,
  FanLiveHero,
  FanLiveMemberSheet,
  FanLiveProfileActionSheet,
} from "./components/FanLiveRoomParts";
import {
  FanLiveReportCompletePage,
  FanLiveReportPage,
} from "./components/FanLiveReportFlow";

type FanLiveView = "room" | "report" | "reportComplete";

type FanLiveLocationState = {
  live?: EnterLiveResponse;
};

const parseStartedAt = (startedAt: string) => {
  const normalizedValue = startedAt.includes("T")
    ? startedAt
    : startedAt.replace(" ", "T");
  const startedDate = new Date(normalizedValue);

  return Number.isNaN(startedDate.getTime()) ? null : startedDate;
};

const getDurationSeconds = (startedAt: string) => {
  const startedDate = parseStartedAt(startedAt);

  if (!startedDate) return 0;

  return Math.max(0, Math.floor((Date.now() - startedDate.getTime()) / 1000));
};

export function FanLivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { liveId: liveIdParam } = useParams();
  const stateLive = (location.state as FanLiveLocationState | null)?.live;
  const liveId = Number(liveIdParam);
  const hasValidLiveId = Number.isInteger(liveId) && liveId > 0;
  const {
    data: queriedLive,
    isLoading,
    isError,
    refetch,
  } = useEnterLiveQuery(
    hasValidLiveId ? liveId : null,
    !stateLive,
  );
  const live = stateLive ?? queriedLive;
  const leaveLiveMutation = useLeaveLiveMutation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [view, setView] = useState<FanLiveView>("room");
  const [durationSeconds, setDurationSeconds] = useState(() =>
    live ? getDurationSeconds(live.startedAt) : 0,
  );
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [isChatComposerOpen, setIsChatComposerOpen] = useState(false);
  const [isProfileActionSheetOpen, setIsProfileActionSheetOpen] =
    useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !live?.playback.playbackUrl) return;

    try {
      audio.muted = false;
      audio.volume = 1;
      await audio.play();
      setIsMuted(false);
      setAudioMessage("");
    } catch {
      setIsMuted(true);
      setAudioMessage("오디오를 들으려면 음량 버튼을 눌러주세요.");
    }
  }, [live?.playback.playbackUrl]);

  useEffect(() => {
    if (!live) return;

    const intervalId = window.setInterval(() => {
      setDurationSeconds(getDurationSeconds(live.startedAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [live]);

  useEffect(() => {
    if (!live?.liveId) return;

    const controller = new AbortController();

    subscribeViewerCount({
      liveId: live.liveId,
      watchOnly: false,
      onViewerCount: setViewerCount,
      signal: controller.signal,
    }).catch(() => {
      // SSE 연결 종료 및 화면 이탈에 따른 취소는 조용히 처리합니다.
    });

    return () => controller.abort();
  }, [live?.liveId]);

  useEffect(() => {
    const audio = audioRef.current;
    const playback = live?.playback;

    if (
      !audio ||
      !live?.isLive ||
      playback?.role !== "LISTENER" ||
      playback.protocol !== "HLS" ||
      !playback.playbackUrl
    ) {
      return;
    }

    if (!Hls.isSupported()) {
      window.setTimeout(() => {
        setAudioMessage("이 브라우저에서는 인증된 HLS 재생을 지원하지 않아요.");
      }, 0);
      return;
    }

    let authorization: string;

    try {
      authorization = getLivePlaybackAuthorization();
    } catch (error) {
      window.setTimeout(() => {
        setAudioMessage(
          error instanceof Error
            ? error.message
            : "오디오 인증 정보를 확인하지 못했어요.",
        );
      }, 0);
      return;
    }

    const hls = new Hls({
      lowLatencyMode: true,
      backBufferLength: 30,
      xhrSetup: (xhr) => {
        xhr.setRequestHeader("Authorization", authorization);
      },
    });

    hlsRef.current = hls;
    hls.attachMedia(audio);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(playback.playbackUrl);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      void startPlayback();
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        return;
      }

      setAudioMessage("라이브 오디오 연결이 종료됐어요.");
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
  }, [live?.isLive, live?.playback, startPlayback]);

  const handleToggleMute = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isMuted || audio.paused) {
      void startPlayback();
      return;
    }

    audio.muted = true;
    setIsMuted(true);
  };

  const handleToggleChat = () => {
    setHasOpenedChat(true);
    setIsChatComposerOpen((current) => !current);
  };

  const handleLeaveLive = async () => {
    if (!live?.liveId || leaveLiveMutation.isPending) return;

    try {
      await leaveLiveMutation.mutateAsync(live.liveId);
      navigate("/fan/live", { replace: true });
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "라이브 방에서 나가지 못했어요.");
    }
  };

  if (!live && isLoading) {
    return (
      <main className="flex h-full items-center justify-center bg-neutral-0">
        <p className="font-body text-caption2 text-neutral-500">
          라이브 방에 입장하는 중이에요.
        </p>
      </main>
    );
  }

  if (!live) {
    return (
      <main className="flex h-full flex-col items-center justify-center bg-neutral-0 px-5 text-center">
        <p className="font-body text-body2 text-neutral-700">
          {isError
            ? "라이브 방에 입장하지 못했어요."
            : "라이브 입장 정보가 없어요."}
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
            onClick={() => navigate("/fan/live", { replace: true })}
            className="rounded-lg bg-primary-400 px-4 py-2 font-body text-caption2 text-neutral-0"
          >
            라이브 홈으로
          </button>
        </div>
      </main>
    );
  }

  if (view === "report") {
    return (
      <FanLiveReportPage
        onBack={() => setView("room")}
        onComplete={() => setView("reportComplete")}
      />
    );
  }

  if (view === "reportComplete") {
    return <FanLiveReportCompletePage onBackToLive={() => setView("room")} />;
  }

  return (
    <main className="relative h-full min-h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveHeader
        durationSeconds={durationSeconds}
        viewerCount={
          viewerCount ?? live.viewerCount ?? live.viewCount ?? 0
        }
        onExit={() => setIsExitModalOpen(true)}
      />
      <FanLiveHero live={live} />

      <audio
        ref={audioRef}
        autoPlay
        className="sr-only"
        onCanPlay={() => {
          if (audioRef.current?.paused) void startPlayback();
        }}
        onError={() => setAudioMessage("라이브 오디오를 재생하지 못했어요.")}
      />

      {audioMessage ? (
        <p className="absolute inset-x-5 top-[56px] z-20 rounded-lg bg-primary-400 px-3 py-2 text-center font-body text-caption3 text-neutral-0">
          {audioMessage}
        </p>
      ) : null}

      {hasOpenedChat ? (
        <FanLiveChatArea
          composerOpen={isChatComposerOpen}
          onProfileClick={() => setIsProfileActionSheetOpen(true)}
        />
      ) : (
        <EmptyChatArea />
      )}
      <FanLiveActionBar
        chatOpen={isChatComposerOpen}
        isMuted={isMuted}
        onOpenMembers={() => setIsMemberSheetOpen(true)}
        onToggleMute={handleToggleMute}
        onToggleChat={handleToggleChat}
      />
      <FanLiveMemberSheet
        open={isMemberSheetOpen}
        onClose={() => setIsMemberSheetOpen(false)}
      />
      <FanLiveProfileActionSheet
        open={isProfileActionSheetOpen}
        onClose={() => setIsProfileActionSheetOpen(false)}
        onReport={() => {
          setIsProfileActionSheetOpen(false);
          setView("report");
        }}
      />
      <ModalOverlay
        open={isExitModalOpen}
        onClose={() => {
          if (!leaveLiveMutation.isPending) setIsExitModalOpen(false);
        }}
        panelClassName="rounded-[24px]"
      >
        <Modal
          cancelDisabled={leaveLiveMutation.isPending}
          confirmDisabled={leaveLiveMutation.isPending}
          confirmLabel={
            leaveLiveMutation.isPending ? "나가는 중" : "나가기"
          }
          onCancel={() => setIsExitModalOpen(false)}
          onConfirm={() => void handleLeaveLive()}
        />
      </ModalOverlay>
    </main>
  );
}

export default FanLivePage;
