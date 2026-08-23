import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import Hls from "hls.js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getLiveMembers,
  resolveLiveApiUrl,
  setupLivePlaybackXhr,
  subscribeViewerCount,
} from "@/api/live/live";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  useBlockLiveUserMutation,
  useEnterLiveMutation,
  useLeaveLiveMutation,
  useReportLiveUserMutation,
  useUnblockLiveUserMutation,
} from "@/hooks/api/live/useLive";
import { useLiveChatSocket } from "@/hooks/api/live/useLiveChatSocket";
import type {
  EnterLiveResponse,
  LiveApiResponse,
  LiveMemberItem,
  ReportLiveUserRequest,
} from "@/types/live/live";
import type {
  LiveChatMessageData,
  LiveChatMessageFrame,
} from "@/types/live/liveChat";
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
import type { FanChatMessage } from "./components/FanLiveRoomParts";
import {
  FanLiveReportCompletePage,
  FanLiveReportPage,
} from "./components/FanLiveReportFlow";

type FanLiveView = "room" | "report" | "reportComplete";

type FanLiveLocationState = {
  live?: EnterLiveResponse;
};

type ReportTarget = {
  targetUserId?: number;
  chatMessage: string;
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

const formatChatTime = (sentAt: string) => {
  const normalizedValue = sentAt.includes("T")
    ? sentAt
    : sentAt.replace(" ", "T");
  const sentDate = new Date(normalizedValue);

  if (Number.isNaN(sentDate.getTime())) {
    return sentAt.slice(11, 16);
  }

  return sentDate.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export function FanLivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { liveId: liveIdParam } = useParams();
  const stateLive = (location.state as FanLiveLocationState | null)?.live;
  const liveId = Number(liveIdParam);
  const hasValidLiveId = Number.isInteger(liveId) && liveId > 0;
  const matchingStateLive =
    stateLive?.liveId === liveId ? stateLive : undefined;

  const enterLiveMutation = useEnterLiveMutation();
  const requestedLiveIdRef = useRef<number | null>(null);

  const requestEnterLive = useCallback(() => {
    if (!hasValidLiveId) return;

    requestedLiveIdRef.current = liveId;
    enterLiveMutation.mutate(liveId);
  }, [enterLiveMutation, hasValidLiveId, liveId]);

  useEffect(() => {
    if (
      matchingStateLive ||
      !hasValidLiveId ||
      requestedLiveIdRef.current === liveId
    ) {
      return;
    }

    requestEnterLive();
  }, [hasValidLiveId, liveId, matchingStateLive, requestEnterLive]);

  const matchingMutationLive =
    enterLiveMutation.variables === liveId
      ? enterLiveMutation.data
      : undefined;

  const live = matchingStateLive ?? matchingMutationLive;
  const isLoading = enterLiveMutation.isPending;
  const isError = enterLiveMutation.isError;

  const leaveLiveMutation = useLeaveLiveMutation();
  const reportLiveUserMutation = useReportLiveUserMutation();
  const blockLiveUserMutation = useBlockLiveUserMutation();
  const unblockLiveUserMutation = useUnblockLiveUserMutation();

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
  const [liveMembers, setLiveMembers] = useState<LiveMemberItem[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [hasMembersError, setHasMembersError] = useState(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [isChatComposerOpen, setIsChatComposerOpen] = useState(false);
  const [isProfileActionSheetOpen, setIsProfileActionSheetOpen] =
    useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [chatMessages, setChatMessages] = useState<FanChatMessage[]>([]);

  const selectedUserId = reportTarget?.targetUserId;

  const isSelectedUserBlocked = selectedUserId
    ? blockedUserIds.has(selectedUserId)
    : false;

  const isBlockPending =
    blockLiveUserMutation.isPending || unblockLiveUserMutation.isPending;

  const handleChatMessage = useCallback(
    (message: LiveChatMessageData, frame: LiveChatMessageFrame) => {
      if (blockedUserIds.has(message.senderId)) return;

      const isBandMember =
        message.senderName === live?.bandName ||
        liveMembers.some((member) => member.nickname === message.senderName);

      const confirmedMessage: FanChatMessage = {
        id: message.messageId,
        senderId: message.senderId,
        sender: message.senderName,
        message: message.content,
        time: formatChatTime(message.sentAt),
        profileImageUrl: message.senderProfileImageUrl,
        band: isBandMember,
      };

      setChatMessages((current) => {
        if (current.some((chat) => chat.id === message.messageId)) {
          return current;
        }

        const optimisticIndex = current.findIndex(
          (chat) => chat.id === frame.clientMsgId,
        );

        if (optimisticIndex < 0) {
          return [...current, confirmedMessage];
        }

        return current.map((chat, index) =>
          index === optimisticIndex ? confirmedMessage : chat,
        );
      });
    },
    [blockedUserIds, live?.bandName, liveMembers],
  );

  const {
    isConnected: isChatConnected,
    lastErrorMessage: chatErrorMessage,
    sendMessage: sendChatMessage,
  } = useLiveChatSocket({
    liveId: live?.liveId,
    enabled: Boolean(live?.isLive && live.liveId),
    onMessage: handleChatMessage,
    onLiveEnded: () => {
      navigate("/fan/live", { replace: true });
    },
  });

  const handleSendChatMessage = useCallback(
    (content: string) => {
      const clientMsgId = sendChatMessage(content);

      if (!clientMsgId) return false;

      setChatMessages((current) => [
        ...current,
        {
          id: clientMsgId,
          sender: "나",
          message: content.trim(),
          time: formatChatTime(new Date().toISOString()),
          pending: true,
        },
      ]);

      return true;
    },
    [sendChatMessage],
  );

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
    }).catch(() => {});

    return () => controller.abort();
  }, [live?.liveId]);

  useEffect(() => {
    if (!live?.liveId) return;

    let isMounted = true;

    const loadMembers = async () => {
      await Promise.resolve();

      if (!isMounted) return;

      setLiveMembers([]);
      setIsMembersLoading(true);
      setHasMembersError(false);

      try {
        const response = await getLiveMembers(live.liveId);

        if (!isMounted) return;

        const memberNames = new Set(
          response.members.map((member) => member.nickname),
        );

        setLiveMembers(response.members);

        setChatMessages((current) =>
          current.map((chat) => ({
            ...chat,
            band:
              chat.sender === live.bandName || memberNames.has(chat.sender),
          })),
        );
      } catch {
        if (!isMounted) return;

        setLiveMembers([]);
        setHasMembersError(true);
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
  }, [live?.bandName, live?.liveId]);

  useEffect(() => {
    const audio = audioRef.current;
    const playback = live?.playback;

    if (
      !audio ||
      !live?.isLive ||
      !playback ||
      playback.protocol !== "HLS" ||
      !playback.playbackUrl
    ) {
      return;
    }

    if (playback.role !== "LISTENER") {
      window.setTimeout(() => {
        setAudioMessage("청취자 재생 정보가 올바르지 않아요.");
      }, 0);

      return;
    }

    const playbackUrl = resolveLiveApiUrl(playback.playbackUrl);

    if (!Hls.isSupported()) {
      if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = playbackUrl;
        audio.load();

        const handleCanPlay = () => {
          void startPlayback();
        };

        const handleLoadedMetadata = () => {
          setAudioMessage("");
        };

        const handleNativeError = () => {
          console.error("[Fan Live native HLS error]", {
            code: audio.error?.code,
            message: audio.error?.message,
            playbackUrl,
          });
        };

        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("error", handleNativeError);

        return () => {
          audio.removeEventListener("canplay", handleCanPlay);
          audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audio.removeEventListener("error", handleNativeError);
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
        };
      }

      window.setTimeout(() => {
        setAudioMessage("이 브라우저에서는 HLS 재생을 지원하지 않아요.");
      }, 0);

      return;
    }

    const hls = new Hls({
      lowLatencyMode: true,
      backBufferLength: 30,
      xhrSetup: setupLivePlaybackXhr,
    });

    hlsRef.current = hls;
    hls.attachMedia(audio);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(playbackUrl);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setAudioMessage("");
      void startPlayback();
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      if (audio.paused) return;

      setAudioMessage("");
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      console.error("[Fan Live HLS error]", {
        type: data.type,
        details: data.details,
        reason: data.reason,
        fatal: data.fatal,
        response: data.response,
      });

      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setAudioMessage("라이브 오디오 데이터를 다시 연결하고 있어요.");
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setAudioMessage("라이브 오디오 재생을 복구하고 있어요.");
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
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "신고를 접수하지 못했어요.");
    }
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

      setChatMessages((current) =>
        current.filter((chat) => chat.senderId !== selectedUserId),
      );

      setIsBlockConfirmOpen(false);
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "사용자를 차단하지 못했어요.");
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
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "사용자 차단을 해제하지 못했어요.");
    }
  };

  const handleBlockToggle = () => {
    if (!selectedUserId) {
      alert("현재 예시 채팅에는 실제 사용자 ID가 없어 차단할 수 없어요.");
      return;
    }

    if (isSelectedUserBlocked) {
      void handleUnblockUser();
      return;
    }

    setIsProfileActionSheetOpen(false);
    setIsBlockConfirmOpen(true);
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
              onClick={requestEnterLive}
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
        isSubmitting={reportLiveUserMutation.isPending}
        onBack={() => setView("room")}
        onSubmit={handleSubmitReport}
      />
    );
  }

  if (view === "reportComplete") {
    return (
      <FanLiveReportCompletePage onBackToLive={() => setView("room")} />
    );
  }

  return (
    <main className="relative h-full min-h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveHeader
        durationSeconds={durationSeconds}
        viewerCount={viewerCount ?? live.viewerCount ?? live.viewCount ?? 0}
        onExit={() => setIsExitModalOpen(true)}
      />

      <FanLiveHero
        isAudioActive={Boolean(live.isLive && !isMuted)}
        live={live}
      />

      <audio
        ref={audioRef}
        autoPlay
        preload="auto"
        className="sr-only"
        onCanPlay={() => {
          if (audioRef.current?.paused) {
            void startPlayback();
          }
        }}
        onError={() =>
          setAudioMessage("라이브 오디오를 재생하지 못했어요.")
        }
      />

      {audioMessage ? (
        <button
          type="button"
          onClick={() => void startPlayback()}
          className="absolute inset-x-5 top-[56px] z-20 rounded-lg bg-primary-400 px-3 py-2 text-center font-body text-caption3 text-neutral-0"
        >
          {audioMessage}
        </button>
      ) : null}

      {hasOpenedChat ? (
        <FanLiveChatArea
          composerOpen={isChatComposerOpen}
          connectionMessage={chatErrorMessage}
          isConnected={isChatConnected}
          messages={chatMessages}
          onProfileClick={(chat: FanChatMessage) => {
            setReportTarget({
              targetUserId: chat.senderId,
              chatMessage: chat.message,
            });

            setIsProfileActionSheetOpen(true);
          }}
          onSendMessage={handleSendChatMessage}
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
        hasError={hasMembersError}
        isLoading={isMembersLoading}
        members={liveMembers}
        open={isMemberSheetOpen}
        onClose={() => setIsMemberSheetOpen(false)}
      />

      <FanLiveProfileActionSheet
        isBlocked={isSelectedUserBlocked}
        isBlockPending={isBlockPending}
        open={isProfileActionSheetOpen}
        onBlockToggle={handleBlockToggle}
        onClose={() => setIsProfileActionSheetOpen(false)}
        onReport={() => {
          if (!reportTarget?.targetUserId) {
            alert(
              "현재 예시 채팅에는 실제 사용자 ID가 없어 신고할 수 없어요.",
            );
            return;
          }

          setIsProfileActionSheetOpen(false);
          setView("report");
        }}
      />

      <ModalOverlay
        open={isBlockConfirmOpen}
        onClose={() => {
          if (!blockLiveUserMutation.isPending) {
            setIsBlockConfirmOpen(false);
          }
        }}
        panelClassName="rounded-[24px]"
      >
        <Modal
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

      <ModalOverlay
        open={isExitModalOpen}
        onClose={() => {
          if (!leaveLiveMutation.isPending) {
            setIsExitModalOpen(false);
          }
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