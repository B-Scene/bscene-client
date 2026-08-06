import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  createWhipSession,
  deleteWhipSession,
  getLiveMembers,
  subscribeViewerCount,
} from "@/api/live/live";
import {
  useAcceptCoHostUpgradeMutation,
  useCloseLiveMutation,
  useLeaveLiveMutation,
} from "@/hooks/api/live/useLive";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import type { LiveMemberItem } from "@/types/live/live";
import type { ActiveLive, ChatMessage, GoLiveScreen } from "./types";
import { getCachedScheduledCoHostUserIds } from "./scheduledLiveCache";
import {
  extractWhipPath,
  getAudioContextConstructor,
  waitForIceGatheringComplete,
} from "./hooks/liveMediaUtils";
import { useLiveRoomPlayback } from "./hooks/useLiveRoomPlayback";
import {
  ChatComposer,
  LiveActionBar,
  LiveRoomHeader,
  LiveRoomHero,
  MemberSheet,
  RoomMessageArea,
} from "./components/LiveRoomParts";

interface LiveRoomProps {
  go: GoLiveScreen;
  live: ActiveLive;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  chatOpen?: boolean;
  overlay?: "members" | "endConfirm";
}
type LiveAudioStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "unsupported";

const MIC_VOLUME_MIN = 0;
const MIC_VOLUME_MAX = 150;
const DEFAULT_MIC_VOLUME = 100;

const clampMicVolume = (volume: number) => {
  return Math.min(MIC_VOLUME_MAX, Math.max(MIC_VOLUME_MIN, Math.round(volume)));
};

const parseStartedAt = (startedAt?: string | null) => {
  if (!startedAt) return null;

  const normalizedValue = startedAt.includes("T")
    ? startedAt
    : startedAt.replace(" ", "T");

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const getLiveDurationSeconds = (startedAt?: string | null) => {
  const startedDate = parseStartedAt(startedAt);

  if (!startedDate) return 0;

  return Math.max(0, Math.floor((Date.now() - startedDate.getTime()) / 1000));
};

const getInitialViewerCount = (live: ActiveLive) => {
  if (!live) return 0;

  const liveWithCounts = live as NonNullable<ActiveLive> & {
    viewCount?: number;
    viewerCount?: number;
  };

  return liveWithCounts.viewerCount ?? liveWithCounts.viewCount ?? 0;
};

export function LiveRoom({
  go,
  live,
  messages,
  onSendMessage,
  chatOpen = false,
  overlay,
}: LiveRoomProps) {
  const closeLiveMutation = useCloseLiveMutation();
  const leaveLiveMutation = useLeaveLiveMutation();
  const acceptCoHostUpgradeMutation = useAcceptCoHostUpgradeMutation();

  const playbackRole = live?.playback?.role;
  const playbackProtocol = live?.playback?.protocol;
  const playbackUrl = live?.playback?.playbackUrl;
  const canBroadcast =
    playbackRole === "BROADCASTER" || playbackRole === "CO_HOST";
  const canCloseLive = playbackRole === "BROADCASTER";

  const [viewerCount, setViewerCount] = useState(() =>
    getInitialViewerCount(live),
  );
  const [durationSeconds, setDurationSeconds] = useState(() =>
    getLiveDurationSeconds(live?.startedAt),
  );
  const [audioStatus, setAudioStatus] = useState<LiveAudioStatus>("idle");
  const [audioErrorMessage, setAudioErrorMessage] = useState("");
  const [micInfoMessage, setMicInfoMessage] = useState("");
  const [coHostApprovalMessage, setCoHostApprovalMessage] = useState("");
  const [micVolume, setMicVolume] = useState(DEFAULT_MIC_VOLUME);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [liveMembers, setLiveMembers] = useState<LiveMemberItem[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  const audioStatusRef = useRef<LiveAudioStatus>("idle");
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processedMicStreamRef = useRef<MediaStream | null>(null);
  const whipSessionUrlRef = useRef<string | null>(null);

  const micVolumeRef = useRef(DEFAULT_MIC_VOLUME);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);

  const {
    handleCoPublisherJoined,
    isBroadcasterMonitorPlayback,
    isListenerPlayback,
    listenerAudioMessage,
    listenerAudioRef,
    setListenerAudioMessage,
    setShowListenerPlayButton,
    showListenerPlayButton,
    startBroadcasterMonitorPlayback,
    startListenerPlayback,
    stopListenerPlayback,
  } = useLiveRoomPlayback({
    live,
    canBroadcast,
    audioConnected: audioStatus === "connected",
  });

  const handleAcceptCoHostUpgrade = async () => {
    if (!live?.liveId || acceptCoHostUpgradeMutation.isPending) return;

    const requesterUserIds = getCachedScheduledCoHostUserIds(live.liveId);

    if (requesterUserIds.length === 0) {
      setCoHostApprovalMessage(
        "승인할 공동 진행자의 사용자 정보를 찾을 수 없어요.",
      );
      return;
    }

    setCoHostApprovalMessage("");

    try {
      let lastError: unknown = null;

      for (const userId of requesterUserIds) {
        try {
          await acceptCoHostUpgradeMutation.mutateAsync({
            liveId: live.liveId,
            userId,
          });
          setCoHostApprovalMessage("공동 진행 요청을 승인했어요.");
          return;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError;
    } catch (error) {
      setCoHostApprovalMessage(
        getApiErrorMessage(
          error,
          "대기 중인 공동 진행 요청을 승인하지 못했어요.",
        ),
      );
    }
  };

  const setAudioStatusSafe = useCallback((nextStatus: LiveAudioStatus) => {
    audioStatusRef.current = nextStatus;
    setAudioStatus(nextStatus);
  }, []);

  const handleMicVolumeChange = useCallback((nextVolume: number) => {
    const safeVolume = clampMicVolume(nextVolume);

    micVolumeRef.current = safeVolume;
    setMicVolume(safeVolume);

    const gainNode = micGainNodeRef.current;
    const audioContext = audioContextRef.current;

    if (!gainNode) return;

    const gainValue = safeVolume / 100;

    if (audioContext && audioContext.state !== "closed") {
      gainNode.gain.setTargetAtTime(gainValue, audioContext.currentTime, 0.01);
      return;
    }

    gainNode.gain.value = gainValue;
  }, []);

  const cleanupWhipBroadcast = useCallback(async () => {
    const sessionUrl = whipSessionUrlRef.current;

    whipSessionUrlRef.current = null;

    if (sessionUrl) {
      try {
        await deleteWhipSession(sessionUrl);
      } catch {
        // 이미 종료된 세션이면 무시
      }
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;

    processedMicStreamRef.current?.getTracks().forEach((track) => track.stop());
    processedMicStreamRef.current = null;

    try {
      micSourceNodeRef.current?.disconnect();
    } catch {
      // 이미 끊긴 노드는 무시
    }

    try {
      micGainNodeRef.current?.disconnect();
    } catch {
      // 이미 끊긴 노드는 무시
    }

    micSourceNodeRef.current = null;
    micGainNodeRef.current = null;

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;

    if (audioContext && audioContext.state !== "closed") {
      try {
        await audioContext.close();
      } catch {
        // 이미 닫힌 AudioContext면 무시
      }
    }

    setIsMicMuted(false);
    setMicInfoMessage("");
  }, []);

  const stopWhipBroadcast = useCallback(async () => {
    await cleanupWhipBroadcast();
    setAudioStatusSafe("idle");
  }, [cleanupWhipBroadcast, setAudioStatusSafe]);

  const toggleMicTrackOnly = useCallback(() => {
    const originalTracks = micStreamRef.current?.getAudioTracks() ?? [];
    const processedTracks = processedMicStreamRef.current?.getAudioTracks() ?? [];
    const allAudioTracks = [...originalTracks, ...processedTracks];

    if (allAudioTracks.length === 0) {
      setAudioErrorMessage("마이크 트랙을 찾을 수 없어요. 송출을 다시 시작해주세요.");
      return;
    }

    setIsMicMuted((currentMuted) => {
      const nextMuted = !currentMuted;

      allAudioTracks.forEach((track) => {
        track.enabled = !nextMuted;
      });

      setMicInfoMessage(
        nextMuted ? "마이크가 음소거됐어요. 다시 누르면 송출돼요." : "",
      );

      return nextMuted;
    });
  }, []);

  const startWhipBroadcast = useCallback(async () => {
    if (!live?.liveId) return;

    if (!canBroadcast) {
      setAudioStatusSafe("unsupported");
      return;
    }

    if (playbackProtocol !== "WHIP") {
      setAudioStatusSafe("unsupported");
      return;
    }

    if (!playbackUrl) {
      setAudioStatusSafe("error");
      setAudioErrorMessage("오디오 송출 주소가 없습니다.");
      return;
    }

    if (
      audioStatusRef.current === "connecting" ||
      audioStatusRef.current === "connected"
    ) {
      return;
    }

    setAudioErrorMessage("");
    setMicInfoMessage("");

    try {
      await cleanupWhipBroadcast();

      setAudioStatusSafe("connecting");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("이 브라우저에서는 마이크 사용을 지원하지 않아요.");
      }

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      micStreamRef.current = micStream;

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      let broadcastStream = micStream;

      const AudioContextConstructor = getAudioContextConstructor();

      if (AudioContextConstructor) {
        const audioContext = new AudioContextConstructor();

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const sourceNode = audioContext.createMediaStreamSource(micStream);
        const gainNode = audioContext.createGain();
        const destinationNode = audioContext.createMediaStreamDestination();

        gainNode.gain.value = micVolumeRef.current / 100;

        sourceNode.connect(gainNode);
        gainNode.connect(destinationNode);

        audioContextRef.current = audioContext;
        micSourceNodeRef.current = sourceNode;
        micGainNodeRef.current = gainNode;
        processedMicStreamRef.current = destinationNode.stream;

        broadcastStream = destinationNode.stream;
      }

      broadcastStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
        peerConnection.addTrack(track, broadcastStream);
      });

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);
      await waitForIceGatheringComplete(peerConnection);

      const localDescription = peerConnection.localDescription;

      if (!localDescription?.sdp) {
        throw new Error("SDP Offer 생성에 실패했습니다.");
      }

      const path = extractWhipPath(playbackUrl);

      if (!path || path === "{path}") {
        throw new Error("WHIP path를 찾을 수 없습니다.");
      }

      const { sdpAnswer, sessionUrl } = await createWhipSession({
        path,
        sdpOffer: localDescription.sdp,
      });

      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: sdpAnswer,
      });

      whipSessionUrlRef.current = sessionUrl;

      setIsMicMuted(false);
      setAudioStatusSafe("connected");
    } catch (error) {
      await cleanupWhipBroadcast();

      setAudioStatusSafe("error");
      setAudioErrorMessage(
        error instanceof Error
          ? error.message
          : "오디오 송출 연결에 실패했어요.",
      );
    }
  }, [
    cleanupWhipBroadcast,
    canBroadcast,
    live?.liveId,
    playbackProtocol,
    playbackUrl,
    setAudioStatusSafe,
  ]);

  const handleToggleBroadcast = useCallback(() => {
    if (audioStatus === "connecting") {
      return;
    }

    if (audioStatus === "connected") {
      toggleMicTrackOnly();
      return;
    }

    void startWhipBroadcast();
  }, [audioStatus, startWhipBroadcast, toggleMicTrackOnly]);

  const handleConfirmEndLive = async () => {
    if (!live?.liveId) {
      go("ended");
      return;
    }

    try {
      await stopWhipBroadcast();
      stopListenerPlayback();
      await closeLiveMutation.mutateAsync(live.liveId);
      go("ended");
    } catch {
      alert("라이브 종료에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleHeaderAction = async () => {
    if (canCloseLive) {
      go("endConfirm");
      return;
    }

    if (!live?.liveId) {
      go("home");
      return;
    }

    try {
      await stopWhipBroadcast();
      stopListenerPlayback();
      await leaveLiveMutation.mutateAsync(live.liveId);
      go("home");
    } catch {
      alert("라이브방에서 나가지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      setDurationSeconds(getLiveDurationSeconds(live?.startedAt));
    }, 0);

    const timer = window.setInterval(() => {
      setDurationSeconds(getLiveDurationSeconds(live?.startedAt));
    }, 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [live?.startedAt]);

  useEffect(() => {
    if (!live?.liveId) return;

    const controller = new AbortController();
    const shouldExcludeMeFromViewerCount = canBroadcast;

    subscribeViewerCount({
      liveId: live.liveId,
      watchOnly: shouldExcludeMeFromViewerCount,
      onViewerCount: setViewerCount,
      onCoPublisherJoined: canBroadcast
        ? handleCoPublisherJoined
        : undefined,
      signal: controller.signal,
    }).catch(() => {
      // SSE 연결 종료/취소는 조용히 처리
    });

    return () => {
      controller.abort();
    };
  }, [canBroadcast, handleCoPublisherJoined, live?.liveId]);

  useEffect(() => {
    if (overlay !== "members" || !live?.liveId) return;

    let isMounted = true;
    const loadMembers = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      setIsMembersLoading(true);
      try {
        const response = await getLiveMembers(live.liveId);
        if (!isMounted) return;

        setLiveMembers(response.members);
      } catch {
        if (!isMounted) return;

        setLiveMembers([]);
      } finally {
        if (isMounted) setIsMembersLoading(false);
      }
    };

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, [live?.liveId, overlay]);

  useEffect(() => {
    return () => {
      void cleanupWhipBroadcast();
    };
  }, [cleanupWhipBroadcast]);

  return (
    <main className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader
        canCloseLive={canCloseLive}
        onClose={() => void handleHeaderAction()}
        viewerCount={viewerCount}
        durationSeconds={durationSeconds}
      />

      <LiveRoomHero
        isAudioActive={
          isListenerPlayback
            ? !showListenerPlayButton
            : audioStatus === "connected" && !isMicMuted
        }
        live={live}
      />

      {canCloseLive ? (
        <div className="absolute top-[58px] right-5 z-30 flex max-w-[calc(100%-40px)] flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => void handleAcceptCoHostUpgrade()}
            disabled={acceptCoHostUpgradeMutation.isPending}
            className="rounded-full bg-secondary-500 px-4 py-2 text-caption3 font-semibold text-neutral-0 shadow-[0_2px_10px_rgba(20,20,20,0.15)] disabled:opacity-60"
          >
            {acceptCoHostUpgradeMutation.isPending
              ? "승인 중"
              : "공동 진행 요청 승인"}
          </button>
          {coHostApprovalMessage ? (
            <p className="rounded-lg bg-neutral-900/85 px-3 py-2 text-right text-caption3 text-neutral-0">
              {coHostApprovalMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {audioErrorMessage ? (
        <p className="absolute top-[56px] left-1/2 z-20 w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 rounded-lg bg-error px-3 py-2 text-center text-caption3 text-neutral-0">
          {audioErrorMessage}
        </p>
      ) : null}

      {!audioErrorMessage && micInfoMessage ? (
        <p className="absolute top-[56px] left-1/2 z-20 w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 rounded-lg bg-secondary-500 px-3 py-2 text-center text-caption3 text-neutral-0">
          {micInfoMessage}
        </p>
      ) : null}

      {isListenerPlayback || isBroadcasterMonitorPlayback ? (
        <audio
          ref={listenerAudioRef}
          className="sr-only"
          onError={() => {
            setListenerAudioMessage("오디오 재생 URL을 확인해주세요.");
            setShowListenerPlayButton(true);
          }}
        />
      ) : null}

      {(isListenerPlayback || isBroadcasterMonitorPlayback) &&
      showListenerPlayButton ? (
        <button
          type="button"
          onClick={
            isBroadcasterMonitorPlayback
              ? startBroadcasterMonitorPlayback
              : startListenerPlayback
          }
          className="absolute top-[56px] left-1/2 z-20 w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 rounded-lg bg-secondary-500 px-3 py-2 text-center text-caption3 text-neutral-0"
        >
          {listenerAudioMessage || "라이브 오디오 재생"}
        </button>
      ) : null}

      <RoomMessageArea composerOpen={chatOpen} messages={messages} />
      {chatOpen ? <ChatComposer onSendMessage={onSendMessage} /> : null}

      <LiveActionBar
        go={go}
        chatOpen={chatOpen}
        audioStatus={audioStatus}
        isMicMuted={isMicMuted}
        micVolume={micVolume}
        onMicVolumeChange={handleMicVolumeChange}
        onToggleBroadcast={handleToggleBroadcast}
      />

      {overlay === "members" ? (
        <MemberSheet
          go={go}
          members={liveMembers}
          isLoading={isMembersLoading}
        />
      ) : null}

      {overlay === "endConfirm" ? (
        <ModalOverlay open onClose={() => go("room")}>
          <Modal
            tone="orange"
            title="라이브를 종료할까요?"
            description={
              <>
                라이브를 종료하면 청취자들도
                <br />
                자동으로 나가게 돼요.
              </>
            }
            cancelLabel="취소"
            confirmLabel={closeLiveMutation.isPending ? "종료 중" : "종료"}
            onCancel={() => go("room")}
            onConfirm={handleConfirmEndLive}
          />
        </ModalOverlay>
      ) : null}
    </main>
  );
}
