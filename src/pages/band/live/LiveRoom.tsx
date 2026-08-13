import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createWhipSession,
  deleteWhipSession,
  getLiveMembers,
  subscribeViewerCount,
} from "@/api/live/live";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  useAcceptCoHostUpgradeMutation,
  useBlockLiveUserMutation,
  useCloseLiveMutation,
  useLeaveLiveMutation,
  useReportLiveUserMutation,
  useUnblockLiveUserMutation,
} from "@/hooks/api/live/useLive";
import type {
  LiveCoPublisher,
  LiveMemberItem,
  ReportLiveUserRequest,
} from "@/types/live/live";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

import type { ActiveLive, ChatMessage, GoLiveScreen } from "./types";
import {
  extractWhipPath,
  getAudioContextConstructor,
  waitForIceGatheringComplete,
} from "./hooks/liveMediaUtils";
import { useLiveRoomPlayback } from "./hooks/useLiveRoomPlayback";
import {
  ChatComposer,
  LiveActionBar,
  LiveChatProfileActionSheet,
  LiveRoomHeader,
  LiveRoomHero,
  MemberSheet,
  RoomMessageArea,
} from "./components/LiveRoomParts";
import {
  BandLiveReportCompletePage,
  BandLiveReportPage,
} from "./components/LiveReportFlow";

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

type LiveRoomView = "room" | "report" | "reportComplete";

type ReportTarget = {
  targetUserId?: number;
  chatMessage: string;
};

const MIC_VOLUME_MIN = 0;
const MIC_VOLUME_MAX = 150;
const DEFAULT_MIC_VOLUME = 100;

const getMicStartGuideStorageKey = (liveId: number) =>
  `bscene:live:mic-start-guide:${liveId}`;

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
  const reportLiveUserMutation = useReportLiveUserMutation();
  const blockLiveUserMutation = useBlockLiveUserMutation();
  const unblockLiveUserMutation = useUnblockLiveUserMutation();

  const playbackRole = live?.playback?.role;
  const playbackProtocol = live?.playback?.protocol;
  const playbackUrl = live?.playback?.playbackUrl;

  const isBroadcaster = playbackRole === "BROADCASTER";
  const isCoHost = playbackRole === "CO_HOST";

  const canBroadcast = isBroadcaster || isCoHost;
  const canAcceptCoHostUpgrade = isBroadcaster;

  const [view, setView] = useState<LiveRoomView>("room");
  const [viewerCount, setViewerCount] = useState(() =>
    getInitialViewerCount(live),
  );
  const [durationSeconds, setDurationSeconds] = useState(() =>
    getLiveDurationSeconds(live?.startedAt),
  );
  const [audioStatus, setAudioStatus] = useState<LiveAudioStatus>("idle");
  const [audioErrorMessage, setAudioErrorMessage] = useState("");
  const [micInfoMessage, setMicInfoMessage] = useState("");

  const [isCoHostUpgradeConfirmOpen, setIsCoHostUpgradeConfirmOpen] =
    useState(false);
  const [hasPendingCoHostUpgradeRequest, setHasPendingCoHostUpgradeRequest] =
    useState(false);
  const [pendingCoHostRequesterUserId, setPendingCoHostRequesterUserId] =
    useState<number | null>(null);
  const [coHostApprovalMessage, setCoHostApprovalMessage] = useState("");

  const [isMicStartGuideOpen, setIsMicStartGuideOpen] = useState(false);

  const [micVolume, setMicVolume] = useState(DEFAULT_MIC_VOLUME);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [liveMembers, setLiveMembers] = useState<LiveMemberItem[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [isProfileActionSheetOpen, setIsProfileActionSheetOpen] =
    useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<number>>(
    () => new Set(),
  );

  const selectedUserId = reportTarget?.targetUserId;

  const isSelectedUserBlocked = selectedUserId
    ? blockedUserIds.has(selectedUserId)
    : false;

  const isBlockPending =
    blockLiveUserMutation.isPending || unblockLiveUserMutation.isPending;

  const canCloseLive = isBroadcaster;

  const visibleMessages = useMemo(() => {
    return messages.filter(
      (message) => !message.senderId || !blockedUserIds.has(message.senderId),
    );
  }, [blockedUserIds, messages]);

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
    handleCoPublishersChanged,
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

  const hasTopNotice =
    Boolean(audioErrorMessage) ||
    Boolean(micInfoMessage) ||
    ((isListenerPlayback || isBroadcasterMonitorPlayback) &&
      showListenerPlayButton);

  const applyLiveMembers = useCallback((members: LiveMemberItem[]) => {
    setLiveMembers((currentMembers) => {
      if (members.length > 0) {
        return members;
      }

      if (currentMembers.length > 0) {
        return currentMembers;
      }

      return members;
    });
  }, []);

  const refreshLiveMembers = useCallback(async () => {
    if (!live?.liveId) return;

    try {
      const response = await getLiveMembers(live.liveId);
      applyLiveMembers(response.members);
    } catch {
      return;
    }
  }, [applyLiveMembers, live?.liveId]);

  
  const handleCoHostUpgradeRequested = useCallback(
    (requester?: { userId: number }) => {
      if (!canAcceptCoHostUpgrade) return;

      setHasPendingCoHostUpgradeRequest(true);
      setPendingCoHostRequesterUserId(requester?.userId ?? null);
      setIsCoHostUpgradeConfirmOpen(false);
      setCoHostApprovalMessage("공동 진행 요청이 도착했어요.");
    },
    [canAcceptCoHostUpgrade],
  );

  
  const handleCoPublishersChangedEvent = useCallback(
    (publishers: LiveCoPublisher[]) => {
      handleCoPublishersChanged(publishers);
      void refreshLiveMembers();
    },
    [handleCoPublishersChanged, refreshLiveMembers],
  );

  
  const handleAcceptCoHostUpgrade = async () => {
    if (!live?.liveId || acceptCoHostUpgradeMutation.isPending) return;

    if (!hasPendingCoHostUpgradeRequest) {
      setCoHostApprovalMessage("대기 중인 공동 진행 요청이 없어요.");
      return;
    }

    setCoHostApprovalMessage("");

    try {
      await acceptCoHostUpgradeMutation.mutateAsync({
        liveId: live.liveId,
        userId: pendingCoHostRequesterUserId ?? undefined,
      });

      setHasPendingCoHostUpgradeRequest(false);
      setPendingCoHostRequesterUserId(null);
      setIsCoHostUpgradeConfirmOpen(false);
      setCoHostApprovalMessage("공동 송출자 요청을 승인했어요.");
    } catch (error) {
      setIsCoHostUpgradeConfirmOpen(false);
      setCoHostApprovalMessage(
        getApiErrorMessage(
          error,
          "대기 중인 공동 송출자 요청을 승인하지 못했어요.",
        ),
      );
    }
  };

  const handleSubmitReport = async (
    request: Omit<ReportLiveUserRequest, "targetUserId" | "chatMessage">,
  ) => {
    if (!live?.liveId || !reportTarget?.targetUserId) {
      alert("신고 대상 사용자 정보를 확인할 수 없어요.");
      return;
    }

    try {
      await reportLiveUserMutation.mutateAsync({
        liveId: live.liveId,
        request: {
          ...request,
          targetUserId: reportTarget.targetUserId,
          chatMessage: reportTarget.chatMessage,
        },
      });

      setView("reportComplete");
    } catch (error) {
      alert(getApiErrorMessage(error, "신고를 접수하지 못했어요."));
    }
  };

  const handleOpenProfileAction = (chat: ChatMessage) => {
    if (chat.pending) {
      return;
    }

    setReportTarget({
      targetUserId: chat.senderId,
      chatMessage: chat.message,
    });
    setIsProfileActionSheetOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!live?.liveId || !selectedUserId || blockLiveUserMutation.isPending) {
      return;
    }

    try {
      await blockLiveUserMutation.mutateAsync({
        liveId: live.liveId,
        targetUserId: selectedUserId,
      });

      setBlockedUserIds((current) => {
        const next = new Set(current);
        next.add(selectedUserId);
        return next;
      });

      setIsBlockConfirmOpen(false);
      setIsProfileActionSheetOpen(false);
    } catch (error) {
      alert(getApiErrorMessage(error, "사용자를 차단하지 못했어요."));
    }
  };

  const handleUnblockUser = async () => {
    if (!live?.liveId || !selectedUserId || unblockLiveUserMutation.isPending) {
      return;
    }

    try {
      await unblockLiveUserMutation.mutateAsync({
        liveId: live.liveId,
        targetUserId: selectedUserId,
      });

      setBlockedUserIds((current) => {
        const next = new Set(current);
        next.delete(selectedUserId);
        return next;
      });
    } catch (error) {
      alert(getApiErrorMessage(error, "사용자 차단을 해제하지 못했어요."));
    }
  };

  const handleBlockToggle = () => {
    if (!selectedUserId) {
      alert("신고/차단 대상 사용자 정보를 확인할 수 없어요.");
      return;
    }

    if (isSelectedUserBlocked) {
      void handleUnblockUser();
      return;
    }

    setIsProfileActionSheetOpen(false);
    setIsBlockConfirmOpen(true);
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
    }

    try {
      micGainNodeRef.current?.disconnect();
    } catch {
    }

    micSourceNodeRef.current = null;
    micGainNodeRef.current = null;

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;

    if (audioContext && audioContext.state !== "closed") {
      try {
        await audioContext.close();
      } catch {
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
    const processedTracks =
      processedMicStreamRef.current?.getAudioTracks() ?? [];
    const allAudioTracks = [...originalTracks, ...processedTracks];

    if (allAudioTracks.length === 0) {
      setAudioErrorMessage(
        "마이크 트랙을 찾을 수 없어요. 송출을 다시 시작해주세요.",
      );
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
    if (isBroadcaster) {
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
    setLiveMembers([]);
    setHasPendingCoHostUpgradeRequest(false);
    setPendingCoHostRequesterUserId(null);
    setIsCoHostUpgradeConfirmOpen(false);
    setCoHostApprovalMessage("");
  }, [live?.liveId]);

  
  useEffect(() => {
    if (!isBroadcaster || !live?.liveId) {
      setIsMicStartGuideOpen(false);
      return;
    }

    if (audioStatus === "connected") {
      setIsMicStartGuideOpen(false);
      return;
    }

    const storageKey = getMicStartGuideStorageKey(live.liveId);

    try {
      if (window.sessionStorage.getItem(storageKey) === "shown") {
        return;
      }

      window.sessionStorage.setItem(storageKey, "shown");
    } catch {
    }

    setIsMicStartGuideOpen(true);
  }, [audioStatus, isBroadcaster, live?.liveId]);

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
    let reconnectTimer: number | undefined;

    const connectViewerEvents = async () => {
      try {
        await subscribeViewerCount({
          liveId: live.liveId,

          watchOnly: false,
          onViewerCount: setViewerCount,
          onCoPublishersChanged: canBroadcast
            ? handleCoPublishersChangedEvent
            : undefined,
          onCoHostUpgradeRequested: canAcceptCoHostUpgrade
            ? handleCoHostUpgradeRequested
            : undefined,
          signal: controller.signal,
        });
      } catch {
      }

      if (!controller.signal.aborted) {
        reconnectTimer = window.setTimeout(connectViewerEvents, 1000);
      }
    };

    void connectViewerEvents();

    return () => {
      controller.abort();

      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [
    canAcceptCoHostUpgrade,
    canBroadcast,
    handleCoHostUpgradeRequested,
    handleCoPublishersChangedEvent,
    live?.liveId,
  ]);

  useEffect(() => {
    if (!live?.liveId) return;
    void refreshLiveMembers();
  }, [live?.liveId, refreshLiveMembers]);

  useEffect(() => {
    if (overlay !== "members" || !live?.liveId || liveMembers.length > 0) {
      return;
    }

    let isMounted = true;

    const loadMembers = async () => {
      setIsMembersLoading(true);

      try {
        const response = await getLiveMembers(live.liveId);

        if (!isMounted) return;

        applyLiveMembers(response.members);
      } catch {
        return;
      } finally {
        if (isMounted) {
          setIsMembersLoading(false);
        }
      }
    };

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, [
    applyLiveMembers,
    live?.liveId,
    liveMembers.length,
    overlay,
  ]);

  useEffect(() => {
    return () => {
      void cleanupWhipBroadcast();
    };
  }, [cleanupWhipBroadcast]);

  if (view === "report") {
    return (
      <BandLiveReportPage
        isSubmitting={reportLiveUserMutation.isPending}
        onBack={() => setView("room")}
        onSubmit={handleSubmitReport}
      />
    );
  }

  if (view === "reportComplete") {
    return (
      <BandLiveReportCompletePage
        onBackToLive={() => {
          setView("room");
          setReportTarget(null);
        }}
      />
    );
  }

  return (
    <main className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader
        canCloseLive={canCloseLive}
        durationSeconds={durationSeconds}
        viewerCount={viewerCount}
        onClose={() => void handleHeaderAction()}
      />

      <LiveRoomHero
        isAudioActive={
          isListenerPlayback
            ? !showListenerPlayButton
            : audioStatus === "connected" && !isMicMuted
        }
        live={live}
      />

      {}
      {canAcceptCoHostUpgrade && hasPendingCoHostUpgradeRequest ? (
        <div
          className={`absolute right-5 z-30 flex max-w-[calc(100%-40px)] flex-col items-end gap-2 transition-[top] duration-200 ${
            hasTopNotice ? "top-[108px]" : "top-[58px]"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsCoHostUpgradeConfirmOpen(true)}
            disabled={acceptCoHostUpgradeMutation.isPending}
            className="rounded-full bg-secondary-500 px-4 py-2 text-caption3 font-semibold text-neutral-0 shadow-[0_2px_10px_rgba(20,20,20,0.15)] disabled:opacity-60"
          >
            공동 진행 요청 확인
          </button>

          {coHostApprovalMessage ? (
            <p className="max-w-[260px] rounded-lg bg-neutral-900/85 px-3 py-2 text-right text-caption3 text-neutral-0">
              {coHostApprovalMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {}

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

      <RoomMessageArea
        composerOpen={chatOpen}
        messages={visibleMessages}
        onProfileClick={handleOpenProfileAction}
      />

      {chatOpen ? <ChatComposer onSendMessage={onSendMessage} /> : null}

      <LiveActionBar
        go={go}
        audioStatus={audioStatus}
        chatOpen={chatOpen}
        isMicMuted={isMicMuted}
        micVolume={micVolume}
        onMicVolumeChange={handleMicVolumeChange}
        onToggleBroadcast={handleToggleBroadcast}
      />

      {overlay === "members" ? (
        <MemberSheet
          go={go}
          isLoading={isMembersLoading}
          members={liveMembers}
        />
      ) : null}

      <LiveChatProfileActionSheet
        isBlocked={isSelectedUserBlocked}
        isBlockPending={isBlockPending}
        open={isProfileActionSheetOpen}
        onBlockToggle={handleBlockToggle}
        onClose={() => setIsProfileActionSheetOpen(false)}
        onReport={() => {
          if (!reportTarget?.targetUserId) {
            alert("신고 대상 사용자 정보를 확인할 수 없어요.");
            return;
          }

          setIsProfileActionSheetOpen(false);
          setView("report");
        }}
      />

      <ModalOverlay
        open={isMicStartGuideOpen}
        panelClassName="rounded-[24px]"
        onClose={() => setIsMicStartGuideOpen(false)}
      >
        <Modal
          tone="orange"
          title="라이브 송출을 시작해주세요"
          description={
            <>
              라이브방에 입장했어요.
              <br />
              하단의 마이크 버튼을 눌러야 실제 라이브 송출이 시작돼요.
            </>
          }
          showCancel={false}
          confirmLabel="확인"
          onConfirm={() => setIsMicStartGuideOpen(false)}
        />
      </ModalOverlay>

      <ModalOverlay
        open={isCoHostUpgradeConfirmOpen}
        panelClassName="rounded-[24px]"
        onClose={() => {
          if (!acceptCoHostUpgradeMutation.isPending) {
            setIsCoHostUpgradeConfirmOpen(false);
          }
        }}
      >
        <Modal
          tone="orange"
          title="공동 송출 요청을 승인할까요?"
          description={
            <>
              승인하면 요청한 밴드 멤버가
              <br />
              공동 진행자로 라이브에 참여해요.
            </>
          }
          cancelDisabled={acceptCoHostUpgradeMutation.isPending}
          confirmDisabled={acceptCoHostUpgradeMutation.isPending}
          confirmLabel={
            acceptCoHostUpgradeMutation.isPending ? "승인 중" : "승인하기"
          }
          onCancel={() => setIsCoHostUpgradeConfirmOpen(false)}
          onConfirm={() => void handleAcceptCoHostUpgrade()}
        />
      </ModalOverlay>

      <ModalOverlay
        open={isBlockConfirmOpen}
        panelClassName="rounded-[24px]"
        onClose={() => {
          if (!blockLiveUserMutation.isPending) {
            setIsBlockConfirmOpen(false);
          }
        }}
      >
        <Modal
          tone="orange"
          title="이 사용자를 차단할까요?"
          description={
            <>
              이 라이브에서 서로의 메시지를
              <br />
              더 이상 볼 수 없어요.
            </>
          }
          cancelDisabled={blockLiveUserMutation.isPending}
          confirmDisabled={blockLiveUserMutation.isPending}
          confirmLabel={
            blockLiveUserMutation.isPending ? "차단 중" : "차단하기"
          }
          onCancel={() => setIsBlockConfirmOpen(false)}
          onConfirm={() => void handleConfirmBlock()}
        />
      </ModalOverlay>

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