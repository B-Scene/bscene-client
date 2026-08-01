import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  createWhepSession,
  createWhipSession,
  deleteWhepSession,
  deleteWhipSession,
  extractWhepPath,
  getLiveMembers,
  subscribeViewerCount,
} from "@/api/live/live";
import {
  useAcceptCoHostUpgradeMutation,
  useCloseLiveMutation,
  useLeaveLiveMutation,
} from "@/hooks/api/live/useLive";
import type {
  CoHostUpgradeEvent,
  LiveCoPublisher,
  LiveMemberItem,
} from "@/types/live/live";
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
  const leaveLiveMutation = useLeaveLiveMutation();
  const acceptCoHostUpgradeMutation = useAcceptCoHostUpgradeMutation();

  const playbackRole = live?.playback?.role;
  const playbackProtocol = live?.playback?.protocol;
  const playbackUrl = live?.playback?.playbackUrl;

  // 송출자·공동 진행자 모두 개인 멤버 path로 WHIP 송출한다
  const isPublisherRole =
    playbackRole === "BROADCASTER" || playbackRole === "CO_HOST";
  const isCoHostRole = playbackRole === "CO_HOST";

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
  // 본인을 제외한 다른 진행자들의 WHEP 모니터링 대상 (enterLive 응답 + coPublisherJoined SSE)
  const [coPublishers, setCoPublishers] = useState<LiveCoPublisher[]>(
    () => live?.coPublishers ?? [],
  );
  // 송출자에게 도착한 공동 송출자 업그레이드 요청 (수락 모달)
  const [upgradeRequest, setUpgradeRequest] =
    useState<CoHostUpgradeEvent | null>(null);

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

  // userId -> WHEP 모니터링 연결 (다른 진행자 원본 오디오 청취)
  const whepConnectionsRef = useRef(
    new Map<
      number,
      {
        peerConnection: RTCPeerConnection;
        audio: HTMLAudioElement;
        sessionUrl: string | null;
      }
    >(),
  );

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

  const disconnectWhepMonitor = useCallback(async (userId: number) => {
    const connection = whepConnectionsRef.current.get(userId);

    if (!connection) return;

    whepConnectionsRef.current.delete(userId);

    connection.audio.pause();
    connection.audio.srcObject = null;
    connection.peerConnection.close();

    if (connection.sessionUrl) {
      try {
        await deleteWhepSession(connection.sessionUrl);
      } catch {
        // 이미 종료된 세션이면 무시
      }
    }
  }, []);

  const disconnectAllWhepMonitors = useCallback(async () => {
    const userIds = Array.from(whepConnectionsRef.current.keys());

    await Promise.all(userIds.map((userId) => disconnectWhepMonitor(userId)));
  }, [disconnectWhepMonitor]);

  // 다른 진행자의 원본 오디오(멤버 path)를 WHEP으로 직접 청취한다.
  // 믹스 결과(HLS)를 들으면 본인 음성이 에코로 돌아오므로 진행자는 이 경로만 사용한다
  const connectWhepMonitor = useCallback(
    async (coPublisher: LiveCoPublisher) => {
      if (whepConnectionsRef.current.has(coPublisher.userId)) return;

      const peerConnection = new RTCPeerConnection();
      const audio = new Audio();

      audio.autoplay = true;

      const connection = {
        peerConnection,
        audio,
        sessionUrl: null as string | null,
      };

      whepConnectionsRef.current.set(coPublisher.userId, connection);

      try {
        peerConnection.addTransceiver("audio", { direction: "recvonly" });

        peerConnection.ontrack = (event) => {
          audio.srcObject =
            event.streams[0] ?? new MediaStream([event.track]);

          void audio.play().catch(() => {
            // 자동재생 차단 시 마이크 제스처 이후 재시도된다
          });
        };

        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);
        await waitForIceGatheringComplete(peerConnection);

        const sdpOffer = peerConnection.localDescription?.sdp;

        if (!sdpOffer) {
          throw new Error("WHEP SDP Offer 생성에 실패했습니다.");
        }

        const path = extractWhepPath(coPublisher.whepUrl);

        if (!path) {
          throw new Error("WHEP path를 찾을 수 없습니다.");
        }

        const { sdpAnswer, sessionUrl } = await createWhepSession({
          path,
          sdpOffer,
        });

        await peerConnection.setRemoteDescription({
          type: "answer",
          sdp: sdpAnswer,
        });

        connection.sessionUrl = sessionUrl;
      } catch {
        await disconnectWhepMonitor(coPublisher.userId);
      }
    },
    [disconnectWhepMonitor],
  );

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

    if (!isPublisherRole) {
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
    isPublisherRole,
    live?.liveId,
    playbackProtocol,
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
    // 확실한 유저 제스처 시점이므로, 자동재생 정책에 막혀 있던 WHEP 모니터링 오디오를 재개한다
    whepConnectionsRef.current.forEach(({ audio }) => {
      if (audio.paused && audio.srcObject) {
        void audio.play().catch(() => {});
      }
    });

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
      await disconnectAllWhepMonitors();

      // 라이브 종료 권한은 송출자(오너)에게만 있다. 공동 진행자는 방을 나가기만 한다
      if (isCoHostRole) {
        await leaveLiveMutation.mutateAsync(live.liveId);
        go("home");
        return;
      }

      await closeLiveMutation.mutateAsync(live.liveId);
      go("ended");
    } catch {
      alert(
        isCoHostRole
          ? "라이브 나가기에 실패했어요. 잠시 후 다시 시도해주세요."
          : "라이브 종료에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleAcceptUpgradeRequest = async () => {
    if (!live?.liveId || !upgradeRequest) return;
    if (acceptCoHostUpgradeMutation.isPending) return;

    try {
      await acceptCoHostUpgradeMutation.mutateAsync({
        liveId: live.liveId,
        userId: upgradeRequest.userId,
      });

      setUpgradeRequest(null);
    } catch (error) {
      setUpgradeRequest(null);
      alert(
        error instanceof Error && error.message
          ? error.message
          : "공동 송출자 업그레이드 수락에 실패했어요.",
      );
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

    // watchOnly=true(보기 전용)로 구독하면 coHostUpgradeRequested/coPublisherJoined 같은
    // 유저 타깃 이벤트를 받지 못한다. 송출자는 BE가 시청자 수에서 자체 제외하므로 항상 유저 등록 구독을 쓴다
    subscribeViewerCount({
      liveId: live.liveId,
      watchOnly: false,
      onViewerCount: setViewerCount,
      onCoHostUpgradeRequested:
        playbackRole === "BROADCASTER"
          ? (event) => setUpgradeRequest(event)
          : undefined,
      onCoPublisherJoined: isPublisherRole
        ? (joined) => {
            setCoPublishers((prev) =>
              prev.some((item) => item.userId === joined.userId)
                ? prev
                : [...prev, joined],
            );
          }
        : undefined,
      signal: controller.signal,
    }).catch(() => {
      // SSE 연결 종료/취소는 조용히 처리
    });

    return () => {
      controller.abort();
    };
  }, [live?.liveId, playbackRole, isPublisherRole]);

  // enterLive 응답이 갱신되면(재입장 등) 모니터링 목록을 응답 기준으로 리셋
  useEffect(() => {
    setCoPublishers(live?.coPublishers ?? []);
  }, [live?.coPublishers]);

  // 진행자 전용: 모니터링 대상과 실제 WHEP 연결을 동기화.
  // coPublisherJoined는 상대가 enterRoom한 직후(마이크 송출 시작 전)에 도착하므로,
  // 그 시점의 WHEP 구독은 MediaMTX에 path가 없어 404로 실패한다. 실패 시 연결을 버리기만 하면
  // 상대가 송출을 시작해도 영영 들리지 않으므로 주기적으로 재연결을 시도한다
  useEffect(() => {
    if (!isPublisherRole) return;

    const syncConnections = () => {
      coPublishers.forEach((coPublisher) => {
        // connectWhepMonitor는 이미 연결(시도) 중인 userId를 스스로 건너뛴다
        void connectWhepMonitor(coPublisher);
      });

      // 자동재생 차단 등으로 멈춘 오디오 재생 재시도
      whepConnectionsRef.current.forEach(({ audio }) => {
        if (audio.paused && audio.srcObject) {
          void audio.play().catch(() => {});
        }
      });
    };

    syncConnections();

    const retryTimer = window.setInterval(syncConnections, 5000);

    const activeUserIds = new Set(coPublishers.map((item) => item.userId));

    Array.from(whepConnectionsRef.current.keys()).forEach((userId) => {
      if (!activeUserIds.has(userId)) {
        void disconnectWhepMonitor(userId);
      }
    });

    return () => {
      window.clearInterval(retryTimer);
    };
  }, [
    coPublishers,
    connectWhepMonitor,
    disconnectWhepMonitor,
    isPublisherRole,
  ]);

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
      void disconnectAllWhepMonitors();
      stopListenerPlayback();
    };
  }, [cleanupWhipBroadcast, disconnectAllWhepMonitors, stopListenerPlayback]);

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
        isCoHost={isCoHostRole}
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
          {isCoHostRole ? (
            <Modal
              tone="orange"
              title="라이브에서 나갈까요?"
              description={
                <>
                  나가더라도 라이브는
                  <br />
                  계속 진행돼요
                </>
              }
              cancelLabel="취소"
              confirmLabel={leaveLiveMutation.isPending ? "나가는 중" : "나가기"}
              onCancel={() => go("room")}
              onConfirm={handleConfirmEndLive}
            />
          ) : (
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
          )}
        </ModalOverlay>
      ) : null}

      {/* 송출자 전용: 공동 송출자 업그레이드 요청 수락 모달 (coHostUpgradeRequested SSE 수신 시) */}
      {upgradeRequest ? (
        <ModalOverlay open onClose={() => setUpgradeRequest(null)}>
          <Modal
            tone="orange"
            title={`${upgradeRequest.nickname ?? "밴드 멤버"}님이 공동 송출을 요청했어요`}
            description={
              <>
                수락하면 함께 라이브를
                <br />
                진행할 수 있어요
              </>
            }
            cancelLabel="나중에"
            confirmLabel={
              acceptCoHostUpgradeMutation.isPending ? "수락 중" : "수락"
            }
            onCancel={() => setUpgradeRequest(null)}
            onConfirm={() => void handleAcceptUpgradeRequest()}
          />
        </ModalOverlay>
      ) : null}
    </main>
  );
}
