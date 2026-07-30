import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  createWhipSession,
  deleteWhipSession,
  getLiveMembers,
  subscribeViewerCount,
} from "@/api/live/live";
import { useCloseLiveMutation } from "@/hooks/api/live/useLive";
import type { LiveMemberItem } from "@/types/live/live";
import type { ActiveLive, ChatMessage, GoLiveScreen } from "./types";
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

const extractWhipPath = (playbackUrl: string) => {
  const rawValue = playbackUrl.trim();

  try {
    const url = new URL(rawValue, window.location.origin);
    const pathname = decodeURIComponent(url.pathname)
      .replace(/\/+$/, "")
      .replace(/^\/+/, "");

    const segments = pathname.split("/").filter(Boolean);
    const rtcIndex = segments.indexOf("rtc");
    const whipIndex = segments.indexOf("whip");

    if (rtcIndex >= 0) {
      const endIndex = whipIndex > rtcIndex ? whipIndex : segments.length;
      return segments.slice(rtcIndex + 1, endIndex).join("/");
    }

    return pathname
      .replace(/^api\/rtc\//, "")
      .replace(/^rtc\//, "")
      .replace(/\/whip$/, "")
      .replace(/^\/+|\/+$/g, "");
  } catch {
    return rawValue
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/+/, "")
      .replace(/^api\/rtc\//, "")
      .replace(/^rtc\//, "")
      .replace(/\/whip$/, "")
      .replace(/^\/+|\/+$/g, "");
  }
};

const waitForIceGatheringComplete = (
  peerConnection: RTCPeerConnection,
  timeoutMs = 3000,
) => {
  if (peerConnection.iceGatheringState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let isResolved = false;
    let timeoutId: number | undefined;

    function finish() {
      if (isResolved) return;

      isResolved = true;

      peerConnection.removeEventListener(
        "icegatheringstatechange",
        handleChange,
      );

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      resolve();
    }

    function handleChange() {
      if (peerConnection.iceGatheringState === "complete") {
        finish();
      }
    }

    peerConnection.addEventListener("icegatheringstatechange", handleChange);
    timeoutId = window.setTimeout(finish, timeoutMs);
  });
};

const getAudioContextConstructor = () => {
  return (
    window.AudioContext ??
    (window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext
  );
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

  const playbackRole = live?.playback?.role;
  const playbackProtocol = live?.playback?.protocol;
  const playbackUrl = live?.playback?.playbackUrl;

  const [viewerCount, setViewerCount] = useState(() =>
    getInitialViewerCount(live),
  );
  const [durationSeconds, setDurationSeconds] = useState(() =>
    getLiveDurationSeconds(live?.startedAt),
  );
  const [audioStatus, setAudioStatus] = useState<LiveAudioStatus>("idle");
  const [audioErrorMessage, setAudioErrorMessage] = useState("");
  const [micInfoMessage, setMicInfoMessage] = useState("");
  const [micVolume, setMicVolume] = useState(DEFAULT_MIC_VOLUME);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [listenerAudioMessage, setListenerAudioMessage] = useState("");
  const [showListenerPlayButton, setShowListenerPlayButton] = useState(false);
  const [liveMembers, setLiveMembers] = useState<LiveMemberItem[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  const audioStatusRef = useRef<LiveAudioStatus>("idle");
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processedMicStreamRef = useRef<MediaStream | null>(null);
  const whipSessionUrlRef = useRef<string | null>(null);
  const listenerAudioRef = useRef<HTMLAudioElement | null>(null);

  const micVolumeRef = useRef(DEFAULT_MIC_VOLUME);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);

  const isListenerPlayback =
    live?.isLive && playbackRole === "LISTENER" && Boolean(playbackUrl);

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

    if (playbackRole !== "BROADCASTER") {
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
    live?.liveId,
    playbackProtocol,
    playbackRole,
    playbackUrl,
    setAudioStatusSafe,
  ]);

  const startListenerPlayback = useCallback(async () => {
    const audio = listenerAudioRef.current;

    if (!audio || !playbackUrl) return;

    setListenerAudioMessage("");
    setShowListenerPlayButton(false);

    try {
      if (audio.src !== playbackUrl) {
        audio.src = playbackUrl;
      }

      audio.volume = 1;
      await audio.play();
    } catch {
      setListenerAudioMessage("오디오 재생을 위해 버튼을 눌러주세요.");
      setShowListenerPlayButton(true);
    }
  }, [playbackUrl]);

  const stopListenerPlayback = useCallback(() => {
    const audio = listenerAudioRef.current;

    if (!audio) return;

    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    setListenerAudioMessage("");
    setShowListenerPlayButton(false);
  }, []);

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

  useEffect(() => {
    setViewerCount(getInitialViewerCount(live));
  }, [live]);

  useEffect(() => {
    setDurationSeconds(getLiveDurationSeconds(live?.startedAt));

    const timer = window.setInterval(() => {
      setDurationSeconds(getLiveDurationSeconds(live?.startedAt));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [live?.startedAt]);

  useEffect(() => {
    if (!live?.liveId) return;

    const controller = new AbortController();
    const shouldExcludeMeFromViewerCount = playbackRole === "BROADCASTER";

    subscribeViewerCount({
      liveId: live.liveId,
      watchOnly: shouldExcludeMeFromViewerCount,
      onViewerCount: setViewerCount,
      signal: controller.signal,
    }).catch(() => {
      // SSE 연결 종료/취소는 조용히 처리
    });

    return () => {
      controller.abort();
    };
  }, [live?.liveId, playbackRole]);

  useEffect(() => {
    if (overlay !== "members" || !live?.liveId) return;

    let isMounted = true;

    setIsMembersLoading(true);

    getLiveMembers(live.liveId)
      .then((response) => {
        if (!isMounted) return;

        setLiveMembers(response.members);
      })
      .catch(() => {
        if (!isMounted) return;

        setLiveMembers([]);
      })
      .finally(() => {
        if (!isMounted) return;

        setIsMembersLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [live?.liveId, overlay]);

  useEffect(() => {
    return () => {
      void cleanupWhipBroadcast();
      stopListenerPlayback();
    };
  }, [cleanupWhipBroadcast, stopListenerPlayback]);

  useEffect(() => {
    if (isListenerPlayback) {
      void startListenerPlayback();
      return;
    }

    stopListenerPlayback();
  }, [isListenerPlayback, startListenerPlayback, stopListenerPlayback]);

  return (
    <main className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader
        go={go}
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

      {isListenerPlayback ? (
        <audio
          ref={listenerAudioRef}
          className="sr-only"
          onError={() => {
            setListenerAudioMessage("오디오 재생 URL을 확인해주세요.");
            setShowListenerPlayButton(true);
          }}
        />
      ) : null}

      {isListenerPlayback && showListenerPlayButton ? (
        <button
          type="button"
          onClick={startListenerPlayback}
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
                라이브를 종료하면 청취자들이
                <br />
                자동으로 퇴장해요
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
